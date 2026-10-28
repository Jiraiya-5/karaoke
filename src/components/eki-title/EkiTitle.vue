<template>
  <div class="eki-title" :class="{ visible: visible }">
    <div v-if="currentSong" class="song-img">
      <VaImage class="img" :src="currentSong.gen?.img" lazy />
    </div>
    <div v-if="currentSong" class="title">{{ currentSong.title }}</div>
    <div v-if="currentSong" class="artists">
      {{ currentSong.art?.name }} - {{ currentSong.gen?.name }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()

const currentSong = computed(() => playerStore.currentSong)
const visible = computed(() =>
  playerStore.showTitle && playerStore.currentSong && playerStore.playing
)
</script>

<style scoped>
.eki-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  opacity: 0;
  height: auto;
  aspect-ratio: 1/1;
  max-width: 90%;
  max-height: 90%;
  border-radius: 15px;
  background: linear-gradient(135deg, #ff512f, #dd2476);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
  padding: 5px;
  user-select: none;
  z-index: -5;
}

.eki-title.visible {
  z-index: 90;
  opacity: 1;
}

.eki-title .song-img {
  width: 48%;
  aspect-ratio: 1/1;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 45px;
}

.eki-title .song-img .img {
  width: 100%;
  height: 100%;
}

.eki-title .title {
  width: 100%;
  text-align: center;
  color: var(--eki-font-color);
  font-weight: 800;
  font-size: 26px;
  margin-bottom: 10px;
}

.eki-title .artists {
  width: 100%;
  text-align: center;
  color: var(--eki-font-color);
  font-weight: 600;
  font-size: 19px;
  opacity: 0.85;
}
</style>