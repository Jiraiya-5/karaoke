<template>
  <div v-if="isRecording" class="user-icon" :title="$t(isPaused ? 'song.recordingPaused' : 'song.recording')">
    <fa-icon
      v-if="isPaused"
      class="icon paused"
      icon="fa-regular fa-circle-pause"
    />
    <fa-icon v-else class="icon" icon="fa-solid fa-record-vinyl" />
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const isRecording = false // Puedes conectar esto a un store real
const isPaused = false
</script>

<style scoped>
.user-icon .icon {
  font-size: 23px;
  margin-right: 15px;
  color: #f34646;
  animation: recording 3s alternate infinite;
}

.user-icon .icon.paused {
  color: #7b7b7b;
}

@keyframes recording {
  0% { opacity: 0.7; transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
</style>