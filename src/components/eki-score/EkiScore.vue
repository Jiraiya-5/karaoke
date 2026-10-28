<template>
  <div class="eki-score">
    <div class="score-card">
      <div class="img-container">
        <img
          v-if="currentSong?.gen?.img"
          class="bg-img"
          :src="currentSong.gen.img"
        />
      </div>

      <div class="rate-container">
        <h1 class="song-title">{{ currentSong?.title ?? $t('epicSong') }}</h1>
        <h2 class="song-art">{{ currentSong?.art?.name ?? $t('amazingArtists') }}</h2>
        <div class="rate-widget">{{ displayedScore }}</div>
      </div>

      <div class="next-song-container">
        <VaProgressCircle
          v-model="progress"
          :thickness="0.2"
          size="80px"
          color="warning"
        />
        <span v-if="queue[0]" class="next-indicator">
          {{ $t('song.nextIn', { time: secondsLeft }) }}
        </span>
      </div>

      <fa-icon
        class="close-icon"
        icon="fa-solid fa-close"
        @click="close"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'

const playerStore = usePlayerStore()
const userStore = useUserStore()
const utilsStore = useUtilsStore()

const progress = ref(0)
const displayedScore = ref(99)
let scoreInterval = null
let progressInterval = null

const currentSong = computed(() => playerStore.currentSong)
const queue = computed(() => playerStore.queue)
const secondsLeft = computed(() => Math.floor((7 * (140 - progress.value)) / 100))

function close() {
  clearInterval(scoreInterval)
  clearInterval(progressInterval)
  if (queue.value[0]) playerStore.skip('next')
  else if (currentSong.value) playerStore.stop()
  utilsStore.showScore = false
}

onMounted(() => {
  playerStore.findAndPlayEffect('Conteo')
  scoreInterval = setInterval(() => {
    displayedScore.value = Math.floor(Math.random() * 99)
  }, 100)

  let finished = false
  progressInterval = setInterval(() => {
    if (progress.value >= 140) {
      clearInterval(progressInterval)
      close()
    } else if (progress.value >= 50 && !finished) {
      clearInterval(scoreInterval)
      const real = playerStore.songRate ?? 100
      displayedScore.value = real
      playerStore.songRate = null
      if (real === 100) playerStore.findAndPlayEffect('Cien')
      else if (real > 90) playerStore.findAndPlayEffect('Bien')
      else if (real >= 80) playerStore.findAndPlayEffect('Normal')
      else if (real > 70) playerStore.findAndPlayEffect('Regular')
      else playerStore.findAndPlayEffect('Mal 3')
      finished = true
      progress.value += 10
    } else {
      progress.value += 10
    }
  }, 500)
})
</script>

<style scoped>
.eki-score {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.score-card {
  background: linear-gradient(135deg, #ff512f, #dd2459);
  padding: 35px;
  max-width: 90%;
  width: 450px;
  max-height: 90%;
  border-radius: 15px;
  color: #fff;
  position: relative;
  text-align: center;
}

.score-card .img-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.score-card .img-container .bg-img {
  opacity: 0.2;
  width: 80%;
}

.score-card .rate-container .rate-widget {
  font-size: 200px;
  text-align: center;
}

.score-card .rate-container .song-title {
  font-size: 35px;
}

.score-card .rate-container .song-art {
  font-size: 20px;
}

.score-card .next-song-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.score-card .close-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  padding: 3px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.score-card .close-icon:hover {
  background-color: #00000026;
}
</style>