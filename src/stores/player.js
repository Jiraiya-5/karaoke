import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUtilsStore } from './utils'
import { useUserStore } from './user'
import { useRequesterStore } from './requester'
import { Howl } from 'howler'

const API_URL = import.meta.env.VITE_PLAYER_URL || 'http://192.168.10.191:3000'

export const usePlayerStore = defineStore('player', () => {
  const utilsStore = useUtilsStore()
  const userStore = useUserStore()
  const requesterStore = useRequesterStore()

  // ===== DETECCIÓN DE CONTROL REMOTO =====
  function isRemoteControl() {
    return window.location.pathname.includes('/control/')
  }

  function getRemoteRoomCode() {
    return window.location.pathname.split('/').pop()
  }

  function sendRemoteCommand(functionName, param, param2) {
    import('./socket').then(({ useSocketStore }) => {
      const socketX = useSocketStore()
      const roomCode = getRemoteRoomCode()
      socketX.emit('controlCommand', {
        roomCode,
        functionName,
        param,
        param2
      })
      console.log(`📤 Comando remoto enviado: ${functionName}`, param)
    })
  }

  // ===== ESTADO =====
  const storedPlayer = JSON.parse(localStorage.getItem('ekiPersistedPlayer') || 'null')

  const loading = ref(false)
  const playing = ref(false)
  const showTitle = ref(false)
  const semitone = ref(1)
  const queue = ref(storedPlayer?.queue || [])
  const reproducedQueue = ref([])
  const effectList = ref([])
  const playingEffects = ref([])
  const currentEffectIndex = ref(-1)
  const effectsVolume = ref(storedPlayer?.volume ? storedPlayer.volume * 0.4 : 0.5)
  const showScore = ref(false)
  const songRate = ref(null)
  const currentSong = ref(null)
  const volume = ref(storedPlayer?.volume || 1)
  const lyrics = ref(null)
  const isSongVoiceActive = ref(false)
  const songSeconds = ref(null)
  const songProgress = ref(0)
  const currentLyrics = ref(null)
  let progressRAF = null

  const nextSong = computed(() => queue.value.length > 0 ? { ...queue.value[0] } : null)

  const controlState = computed(() => ({
    queue: queue.value,
    currentSong: currentSong.value ? {
      id: currentSong.value.id,
      title: currentSong.value.title,
      num: currentSong.value.num,
      art: currentSong.value.art,
      gen: currentSong.value.gen
    } : null,
    volume: volume.value,
    loading: loading.value,
    playing: playing.value,
    hasPreviousSongs: reproducedQueue.value.length > 0,
    songProgress: songProgress.value,
    songSeconds: songSeconds.value
  }))

  // ===== ACCIONES =====
  function playKeepingQueue(song) {
    if (isRemoteControl()) return sendRemoteCommand('playKeepingQueue', song)
    if (currentSong.value?.id === song.id) {
      utilsStore.setNotif({ title: 'error.warning', message: 'error.songInProgress', type: 'warning' })
    } else if (!loading.value) {
      if (currentSong.value) stop()
      queue.value.unshift({ ...song })
      play()
    }
  }

  async function pausePlay() {
    if (isRemoteControl()) return sendRemoteCommand('pausePlay')

    if (currentSong.value) {
      if (playing.value) {
        currentSong.value.sound?.pause()
      } else {
        currentSong.value.sound?.play()
      }
      playing.value = !playing.value
    } else if (queue.value.length > 0) {
      play()
    } else {
      utilsStore.setNotif({ title: 'error.warning', message: 'error.noSongs', type: 'warning' })
    }
  }

  async function play() {
    if (isRemoteControl()) return sendRemoteCommand('play')

    try {
      if (!userStore.isSubscribed) {
        utilsStore.setNotif({ title: 'error.warning', message: 'error.noSubscription', type: 'warning' })
        return
      }
      if (loading.value) return
      if (queue.value.length === 0) {
        utilsStore.setNotif({ title: 'error.warning', message: 'error.noMoreSongs', type: 'warning' })
        return
      }

      loading.value = true
      const songData = { ...queue.value.shift() }
      const { num, id } = songData

      const songDetail = await requesterStore.Get({ route: `/song-detail/${id}`, withAuth: true })
      const { song } = songDetail.data

      const audioUrlOriginal = `${API_URL}/audio/ECK%20${num}.mp3`
      let songUrl = ''

      try {
        const response = await fetch(audioUrlOriginal)
        if (!response.ok) throw new Error("Error al descargar")
        const blob = await response.blob()
        songUrl = URL.createObjectURL(blob)
      } catch (error) {
        console.error("❌ Falló la descarga del audio:", error)
        loading.value = false
        return
      }

      songData.sound = new Howl({
        src: [songUrl],
        volume: volume.value,
        format: ['mp3'],
        onplay: () => {
          playing.value = true
          songSeconds.value = songData.sound.duration()
          progressRAF = requestAnimationFrame(whilePlaying)
        },
        onload: () => {
          currentSong.value?.sound.play()
        },
        onend: () => {
          semitone.value = 1
          if (!userStore.settings.functionallity.showCalification) skip('next')
          else utilsStore.showScore = true
        }
      })

      currentSong.value = songData

      // Parser de LRC
      if (song.lyricsText) {
        const lines = song.lyricsText.split('\n')
        const parsedLines = []
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/

        for (const line of lines) {
          const match = line.match(timeRegex)
          if (match) {
            const minutes = parseInt(match[1])
            const seconds = parseInt(match[2])
            const ms = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3])
            const timeMs = (minutes * 60 + seconds) * 1000 + ms
            const content = line.replace(timeRegex, '').trim()
            if (content) parsedLines.push({ time: timeMs, content })
          }
        }

        if (parsedLines.length > 0) {
          currentLyrics.value = {
            parsed: parsedLines,
            currentIndex: 0,
            content: parsedLines[0].content
          }
        }
      }
    } catch (error) {
      console.error(error)
      currentSong.value = null
    } finally {
      loading.value = false
    }
  }

  function stop(restart = false) {
    if (isRemoteControl()) return sendRemoteCommand('stop', restart)
    if (currentSong.value) {
      currentSong.value.sound?.stop()
      if (restart) queue.value.unshift({ ...currentSong.value })
      else reproducedQueue.value.push({ ...currentSong.value })
      currentSong.value = null
      songSeconds.value = null
      songProgress.value = 0
      currentLyrics.value = null
      playing.value = false
    }
  }

  function skip(direction) {
    if (isRemoteControl()) return sendRemoteCommand('skip', direction)
    switch (direction) {
      case 'prev':
        if (reproducedQueue.value.length > 0) {
          stop()
          queue.value.unshift(reproducedQueue.value.pop())
          play()
        }
        break
      case 'next':
        if (currentSong.value) stop()
        if (queue.value.length > 0) play()
        break
    }
  }

  function skipTo(index) {
    if (isRemoteControl()) return sendRemoteCommand('skipTo', index)
    if (queue.value[index] !== undefined) {
      if (currentSong.value) stop()
      if (index === 0) play()
      else {
        reproducedQueue.value.push(...queue.value.splice(0, index))
        play()
      }
    }
  }

  function changeVolume(vol) {
    if (isRemoteControl()) return sendRemoteCommand('changeVolume', vol)
    if (vol !== volume.value) {
      volume.value = vol
      if (currentSong.value?.sound) currentSong.value.sound.volume(vol)
    }
  }

  function whilePlaying() {
    const seek = currentSong.value?.sound.seek() || 0
    const percent = (seek / songSeconds.value) * 100 || 0
    songProgress.value = percent

    if (currentLyrics.value && currentLyrics.value.parsed && currentLyrics.value.parsed.length > 0) {
      const time = seek * 1000
      const lines = currentLyrics.value.parsed
      let currentLine = 0
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= time) currentLine = i
        else break
      }
      if (currentLyrics.value.currentIndex !== currentLine) {
        currentLyrics.value.currentIndex = currentLine
        currentLyrics.value.content = lines[currentLine].content
      }
    }

    if (showTitle.value && percent >= 2) showTitle.value = false
    progressRAF = requestAnimationFrame(whilePlaying)
  }

  function seek(percent) {
    if (isRemoteControl()) return sendRemoteCommand('seek', percent)
    if (currentSong.value) {
      const pos = (songSeconds.value * percent) / 100
      currentSong.value.sound?.seek(pos)
    }
  }

  function addToQueue(song, options = { shouldPlay: false }) {
    if (isRemoteControl()) return sendRemoteCommand('addToQueue', song, options)
    if (options.shouldPlay) {
      if (currentSong.value) stop()
      queue.value = [song]
      play()
    } else {
      queue.value.push(song)
    }
  }

  function removeFromQueue(index) {
    if (isRemoteControl()) return sendRemoteCommand('removeFromQueue', index)
    queue.value.splice(index, 1)
  }

  function cleanQueue() {
    if (isRemoteControl()) return sendRemoteCommand('cleanQueue')
    queue.value = []
  }

  // ============================================================
  // FUNCIONES DE EFECTOS DE SONIDO
  // ============================================================
  function setUpEffects(effects) {
    effectList.value = effects.map(e => ({ 
      name: e.name, 
      src: `/effects/${e.url}` 
    }))
  }

  function findAndPlayEffect(name) {
    if (isRemoteControl()) return sendRemoteCommand('findAndPlayEffect', name)
    const idx = effectList.value.findIndex(e => e.name === name)
    if (idx !== -1) playEffect(idx)
  }

  function playEffect(index) {
    if (isRemoteControl()) return sendRemoteCommand('playEffect', index)

    if (index === currentEffectIndex.value) {
      stopEffect()
    } else if (index >= 0 && index < effectList.value.length) {
      if (!effectList.value[index].sound) {
        effectList.value[index].sound = new Howl({
          src: [effectList.value[index].src],
          html5: true,
          volume: effectsVolume.value,
          onend: () => { currentEffectIndex.value = -1 }
        })
      }
      effectList.value[index].sound.volume(effectsVolume.value)
      effectList.value[index].sound.play()
      currentEffectIndex.value = index
    }
  }

  function stopEffect() {
    if (isRemoteControl()) return sendRemoteCommand('stopEffect')
    if (currentEffectIndex.value >= 0) {
      effectList.value[currentEffectIndex.value]?.sound.stop()
      currentEffectIndex.value = -1
    }
  }

  function changeEffectsVolume(vol) {
    effectsVolume.value = vol
    effectList.value.forEach(e => { if (e.sound) e.sound.volume(vol) })
  }

  function setNextScore(score) {
    switch (score) {
      case '0': songRate.value = 100; break
      case '8': songRate.value = Math.floor(Math.random() * 11 + 70); break
      case '9': songRate.value = Math.floor(Math.random() * 19 + 81); break
      case '7': songRate.value = null; break
    }
  }

  // ===== RETURN (TODO INCLUIDO) =====
  return {
    loading, playing, showTitle, semitone, queue, reproducedQueue,
    effectList, playingEffects, currentEffectIndex, effectsVolume,
    showScore, songRate, currentSong, volume, lyrics, isSongVoiceActive,
    songSeconds, songProgress, currentLyrics, nextSong, controlState,
    
    playKeepingQueue, pausePlay, play, stop, skip, skipTo, changeVolume, seek,
    addToQueue, removeFromQueue, cleanQueue,
    
    // 👇 ESTAS SON LAS QUE FALTABAN
    setUpEffects, findAndPlayEffect, playEffect, stopEffect, changeEffectsVolume, setNextScore
  }
})