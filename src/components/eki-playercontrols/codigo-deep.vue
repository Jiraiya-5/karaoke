<template>
  <div
    ref="playerControlsElement"
    class="controls-container"
    :class="{ opened: isOpened }"
    tabindex="0"
  >
    <!-- Botón móvil para abrir/cerrar -->
    <div
      class="mobile-control"
      tabindex="0"
      :title="$t('control.openClose')"
      @click="isOpened = !isOpened"
    >
      <fa-icon class="icon" icon="fa-solid fa-music" />
      {{ $t('control.player') }}
    </div>

    <!-- Efectos -->
    <EkiEffects
      v-if="isLoggedIn"
      :show-effects="showEffects"
      @close-effects="showEffects = false"
    />

    <!-- Imagen de la canción -->
    <div class="song-img">
      <VaImage
        v-if="currentSong?.gen?.img"
        class="img"
        :src="currentSongImg"
        lazy
      />
      <fa-icon v-else class="def-icon" icon="fa-solid fa-music" />

      <div
        class="song-num"
        :class="{ show: currentSong }"
      >
        {{ currentSong?.num }}
      </div>
    </div>

    <!-- Info de canción -->
    <EkiNextSong :fullscreen="false" :show-sala="settings.visual.showSala" />

    <!-- Controles -->
    <div class="player-controls">
      <div class="main">
        <VaButton
          class="player-icon"
          icon="msr-skip_previous"
          color="font"
          plain
          size="medium"
          :disabled="reproducedQueue.length === 0"
          @click="skip('prev')"
        />

        <VaButton
          class="player-icon main"
          :icon="`msr-${playing ? 'pause' : 'play_arrow'}`"
          color="font"
          plain
          size="large"
          :loading="loading"
          @click="pausePlay"
        />

        <VaButton
          class="player-icon"
          icon="msr-skip_next"
          color="font"
          plain
          size="medium"
          :disabled="queue.length === 0"
          @click="skip('next')"
        />
      </div>
    </div>

    <!-- Barra de progreso -->
    <div class="song-slider">
      <VaSlider
        v-model="songProgress"
        :readonly="!playing"
        min="0"
        max="100"
        color="secondary"
        track-color="border"
        @drag-start="isDragging = true"
        @drag-end="handleDragEnd"
      >
        <template #append>
          <div class="time-info">
            {{ currentTime }} / {{ totalTime }}
          </div>
        </template>
      </VaSlider>
    </div>

    <!-- Volumen y cola -->
    <div class="extra-control">
      <div class="vol-controller">
        <VaSlider
          class="vol-slider"
          v-model="volumePercent"
          min="0"
          max="100"
          color="secondary"
          track-color="border"
          :title="$t('control.songVolume')"
        >
          <template #prepend>
            <VaButton
              :icon="`msr-volume_${volumeIcon}`"
              color="font"
              plain
              size="medium"
              @click="toggleMute"
            />
          </template>
        </VaSlider>
      </div>

      <fa-icon
        class="player-icon"
        :title="$t('queue.show')"
        icon="fa-solid fa-list-ol"
        @click="settings.visual.showQueue = !settings.visual.showQueue"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import EkiEffects from '@/components/eki-effects/EkiEffects.vue'
import EkiNextSong from '@/components/eki-nextsong/EkiNextSong.vue'

const playerStore = usePlayerStore()
const userStore = useUserStore()

const isOpened = ref(false)
const isDragging = ref(false)
const showEffects = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn)
const settings = computed(() => userStore.settings)
const currentSong = computed(() => playerStore.currentSong)
const playing = computed(() => playerStore.playing)
const loading = computed(() => playerStore.loading)
const queue = computed(() => playerStore.queue)
const reproducedQueue = computed(() => playerStore.reproducedQueue)

const songProgress = computed({
  get: () => playerStore.songProgress,
  set: (val) => playerStore.songProgress = val
})

const volumePercent = computed({
  get: () => playerStore.volume * 100,
  set: (val) => playerStore.changeVolume(val / 100)
})

const volumeIcon = computed(() => {
  if (playerStore.volume === 0) return 'off'
  if (playerStore.volume < 0.5) return 'down'
  return 'up'
})

const currentSongImg = computed(() => {
  if (!currentSong.value?.gen?.img) return ''
  const img = currentSong.value.gen.img
  return navigator.onLine ? img : `/images/offline-default/${Math.floor(Math.random() * 3)}.webp`
})

const currentTime = computed(() => {
  if (!playerStore.songSeconds) return '0:00'
  const current = (playerStore.songProgress / 100) * playerStore.songSeconds
  const mins = Math.floor(current / 60)
  const secs = Math.floor(current % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const totalTime = computed(() => {
  if (!playerStore.songSeconds) return '0:00'
  const mins = Math.floor(playerStore.songSeconds / 60)
  const secs = Math.floor(playerStore.songSeconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const pausePlay = () => playerStore.pausePlay()
const skip = (dir) => playerStore.skip(dir)

const handleDragEnd = () => {
  isDragging.value = false
  playerStore.seek(songProgress.value)
}

let mutedVolume = null
const toggleMute = () => {
  if (mutedVolume === null) {
    mutedVolume = playerStore.volume
    playerStore.changeVolume(0)
  } else {
    playerStore.changeVolume(mutedVolume)
    mutedVolume = null
  }
}
</script>

<style scoped>
.controls-container {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 280px;
  width: 280px;
  color: var(--eki-font-color);
  z-index: 30;
  border-top: 1px solid var(--eki-border-color);
  border-right: 1px solid var(--eki-border-color);
  background-color: var(--eki-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 15px 0;
  transition: all 0.3s ease;
}

.controls-container.hide {
  z-index: -1;
  display: none;
}

.controls-container .mobile-control {
  display: none;
}

.controls-container .song-img {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.controls-container .song-img .img {
  width: 100%;
  height: 100%;
}

.controls-container .song-img .song-num {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 20px;
  color: var(--eki-danger-color);
  background-color: var(--eki-border-color);
  text-align: center;
  padding: 5px 0;
  opacity: 0;
  font-weight: 700;
  transition: all 0.3s ease;
}

.controls-container .song-img .song-num.show {
  opacity: 0.75;
}

.controls-container .player-controls {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
}

.controls-container .song-slider {
  width: 100%;
  padding: 0 15px;
}

.controls-container .extra-control {
  margin-top: 10px;
  padding: 0 15px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-container .extra-control .vol-controller {
  width: 70%;
}

@media screen and (max-width: 1000px) {
  .controls-container {
    z-index: 60;
    left: 50%;
    transform: translate(-50%, 100%);
    border: 2px solid var(--eki-border-color);
    border-radius: 10px;
  }
  .controls-container .mobile-control {
    opacity: 0.65;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    background-color: var(--eki-danger-color);
    color: var(--eki-bg-color);
    padding: 5px 15px;
    width: auto;
    border-radius: 7px 7px 0 0;
    left: 50%;
    transform: translate(-50%, -100%);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }
  .controls-container.opened {
    transform: translate(-50%);
  }
}
</style>