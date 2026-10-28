<template>
  <div
    class="lrc-maincontainer"
    :class="{
      hidden: !showLyrics,
      fullscreen: settings.visual.fullScreenActive,
      'on-top': settings.visual.playerPosition === 'Arriba'
    }"
  >
    <!-- Video de YouTube -->
    <div
      v-if="settings.bgVideo === 'original' && playerX.currentSong && isOnline && settings.visual.fullScreenActive"
      class="lrc-video"
      :class="{ visible: videoVisible }"
    >
      <YoutubeIframe
        ref="youtube"
        :video-id="playerX.currentSong.idVideo"
        :player-vars="{ autoplay: 0, mute: 1, controls: 0 }"
        @ready="onVideoReady"
        @error="onVideoError"
        @state-change="onVideoStateChange"
      />
    </div>

    <!-- Semáforo -->
    <div v-if="countdown > 0" class="countdown">
      {{ countdown }}
    </div>

    <!-- Modo fullscreen -->
    <div v-if="settings.visual.fullScreenActive" class="full-lrc">
      <div class="top-shadow"></div>
      <div class="current-lrc">
        <div
          v-if="currentLyrics"
          class="lrc"
          :class="`${userX.fontStyle} ${userX.themeStyle}`"
        >
          <div v-if="previousLine" class="lrcline previous-line">{{ previousLine.content }}</div>
          
          <!-- Línea actual dividida en sílabas -->
          <div class="lrcline active-lrc-wrapper">
            <span 
              v-for="(syllable, index) in currentSyllables" 
              :key="index"
              class="syllable"
              :class="{ 'syllable-highlight': index <= activeSyllableIndex }"
            >
              {{ syllable }}
            </span>
          </div>
        </div>
      </div>
      <div class="bottom-shadow"></div>
    </div>

    <!-- Modo normal -->
    <div
      v-else-if="currentLyrics && currentLyrics.content"
      class="lrc"
      :class="`${userX.fontStyle} ${userX.themeStyle}`"
    >
      <div v-if="previousLine" class="lrcline previous-line">{{ previousLine.content }}</div>
      
      <div class="lrcline active-lrc-wrapper">
        <span 
          v-for="(syllable, index) in currentSyllables" 
          :key="index"
          class="syllable"
          :class="{ 'syllable-highlight': index <= activeSyllableIndex }"
        >
          {{ syllable }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import YoutubeIframe from './YoutubeIframe.vue'

const playerX = usePlayerStore()
const userX = useUserStore()
const settings = computed(() => userX.settings)
const currentLyrics = computed(() => playerX.currentLyrics)

const isOnline = ref(navigator.onLine)
const videoVisible = ref(false)
const youtube = ref(null)
const countdown = ref(0)
let countdownInterval = null

// ===== VIDEO Y CONTEO =====
function onVideoReady() {
  videoVisible.value = true
  if (youtube.value && youtube.value.instance) {
    youtube.value.instance.pauseVideo()
  }
}

function onVideoError() {
  videoVisible.value = false
}

function onVideoStateChange(data) {
  if (!data) return
  if (data.data === 1) console.log('Video reproduciendo')
  if (data.data === 2) console.log('Video pausado')
}

watch(() => playerX.playing, (isPlaying) => {
  if (youtube.value && youtube.value.instance) {
    if (isPlaying) youtube.value.instance.playVideo()
    else youtube.value.instance.pauseVideo()
  }

  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }

  if (isPlaying && playerX.currentSong) {
    setTimeout(() => {
      if (!playerX.playing) return
      countdown.value = 3
      countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
      }, 1000)
    }, 2000)
  } else {
    countdown.value = 0
  }
})

watch(() => playerX.songProgress, (progress) => {
  if (!youtube.value || !youtube.value.instance || !playerX.playing) return
  const videoTime = youtube.value.instance.getCurrentTime()
  const audioTime = (progress / 100) * playerX.songSeconds
  if (Math.abs(videoTime - audioTime) > 2) {
    youtube.value.instance.seekTo(audioTime, true)
  }
})

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})

// ===== LÓGICA DE LETRAS =====

// Línea anterior
const previousLine = computed(() => {
  if (!currentLyrics.value || !currentLyrics.value.parsed) return null
  const index = currentLyrics.value.currentIndex
  if (index > 0 && currentLyrics.value.parsed[index - 1]) {
    return currentLyrics.value.parsed[index - 1]
  }
  return null
})

// Separar una palabra en sílabas (Algoritmo básico para español)
function splitIntoSyllables(word) {
  // Si la palabra es muy corta o contiene números/símbolos, la dejamos igual
  if (word.length <= 3) return [word]

  // Vocales
  const vowels = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ'
  const isVowel = (char) => vowels.includes(char)
  const syllables = []
  let current = ''

  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    current += char

    // Si es una vocal y la siguiente letra es una consonante (o no hay más)
    // Nota: Este es un algoritmo simplificado. Ignoramos diptongos complejos.
    if (isVowel(char)) {
      const nextChar = word[i + 1]
      const nextNextChar = word[i + 2]

      // Si la siguiente letra es una consonante simple (y no es 'l' o 'r' después de p, b, t, etc.)
      if (nextChar && !isVowel(nextChar)) {
        if (nextNextChar && !isVowel(nextNextChar)) {
          // Grupo consonántico (ej. 'mp', 'nd'), la sílaba se corta aquí
          syllables.push(current)
          current = ''
        } else if (nextChar === 'r' || nextChar === 'l') {
          // Excepción: "pr", "tr", "bl", etc. no se separan
          // Dejamos que siga acumulando
        } else {
          // Consonante simple, cortar sílaba
          syllables.push(current)
          current = ''
        }
      }
    }
  }

  if (current) syllables.push(current)
  return syllables
}

// Convertir toda la línea en un array de sílabas (con su espacio correspondiente)
const currentSyllables = computed(() => {
  if (!currentLyrics.value || !currentLyrics.value.content) return []
  
  const words = currentLyrics.value.content.split(' ')
  const allSyllables = []

  words.forEach((word, wordIndex) => {
    const syls = splitIntoSyllables(word)
    syls.forEach((syl, sylIndex) => {
      // Añadimos un espacio al final de la última sílaba de cada palabra
      const isLastSyllable = sylIndex === syls.length - 1
      allSyllables.push(isLastSyllable ? syl + ' ' : syl)
    })
  })

  return allSyllables
})

// Progreso de la línea actual (0 a 1)
const lineProgress = computed(() => {
  if (!currentLyrics.value || !currentLyrics.value.parsed || !playerX.playing) return 0

  const currentIndex = currentLyrics.value.currentIndex
  const parsed = currentLyrics.value.parsed
  if (currentIndex < 0 || currentIndex >= parsed.length) return 0

  const currentLine = parsed[currentIndex]
  const nextLine = parsed[currentIndex + 1]
  const currentTimeMs = (playerX.songProgress / 100) * playerX.songSeconds * 1000

  const startTime = currentLine.time
  const endTime = nextLine ? nextLine.time : startTime + 5000

  if (currentTimeMs <= startTime) return 0
  if (currentTimeMs >= endTime) return 1

  return (currentTimeMs - startTime) / (endTime - startTime)
})

// Índice de la sílaba activa basado en el progreso
const activeSyllableIndex = computed(() => {
  const syllables = currentSyllables.value
  if (syllables.length === 0) return -1

  const progress = lineProgress.value
  
  // Calcular cuántas sílabas deben estar pintadas
  const activeCount = Math.floor(progress * syllables.length)

  return Math.min(activeCount, syllables.length - 1)
})

// Mostrar u ocultar letra
const showLyrics = computed(() => {
  if (settings.value.visual.fullScreenActive) return true
  return !!(playerX.playing && currentLyrics.value && currentLyrics.value.content)
})
</script>

<style scoped lang="scss" src="./lyrics.scss"></style>