<template>
  <div class="control-view">
    <!-- Header con nombre de la sala -->
    <div class="header">
      <h2>Control Remoto</h2>
      <span class="room-badge">Sala: {{ roomCode }}</span>
    </div>

    <!-- Estado de conexión -->
    <div v-if="!connected" class="connecting">
      <va-progress-circle indeterminate />
      <p>Conectando...</p>
    </div>

    <div v-else class="content">
      <!-- ===== REPRODUCTOR ===== -->
      <div class="player-card">
        <div class="song-img">
          <img 
            v-if="currentSong?.art?.img" 
            :src="currentSong.art.img" 
            :alt="currentSong.title"
          />
          <div v-else class="placeholder">
            <fa-icon icon="fa-solid fa-music" />
          </div>
        </div>
        
        <div class="song-details">
          <div class="song-title">{{ currentSong?.title || 'Sin canción' }}</div>
          <div class="song-artist">{{ currentSong?.art?.name || 'Esperando...' }}</div>
        </div>
      </div>

      <!-- ===== BARRA DE PROGRESO ===== -->
      <div class="progress-section">
        <div class="time-info">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(totalTime) }}</span>
        </div>
        <va-progress-bar 
          :model-value="progressPercent" 
          color="secondary" 
          size="small"
        />
      </div>

      <!-- ===== CONTROLES ===== -->
      <div class="controls">
        <va-button 
          @click="sendCommand('skip', 'prev')" 
          icon="msr-skip_previous" 
          size="large" 
          color="font"
          plain
        />
        <va-button 
          @click="sendCommand('pausePlay')" 
          :icon="`msr-${isPlaying ? 'pause' : 'play_arrow'}`" 
          size="large" 
          color="font"
          class="play-btn"
        />
        <va-button 
          @click="sendCommand('skip', 'next')" 
          icon="msr-skip_next" 
          size="large" 
          color="font"
          plain
        />
      </div>

      <!-- ===== VOLUMEN ===== -->
      <div class="volume-section">
        <fa-icon :icon="`msr-volume_${volumeIcon}`" />
        <va-slider 
          v-model="volume" 
          @update:modelValue="changeVolume" 
          :min="0" 
          :max="100" 
          color="secondary"
          class="vol-slider"
        />
      </div>

      <!-- ===== COLA DE CANCIONES ===== -->
      <div class="queue-section">
        <h3>Cola ({{ queue.length }})</h3>
        <div class="queue-list">
          <div v-if="queue.length === 0" class="empty-queue">
            No hay canciones en la cola
          </div>
          <div 
            v-for="(song, index) in queue" 
            :key="index" 
            class="queue-item"
          >
            <span class="queue-num">{{ index + 1 }}</span>
            <div class="queue-info">
              <div class="queue-title">{{ song.title }}</div>
              <div class="queue-artist">{{ song.art?.name }}</div>
            </div>
            <va-button 
              @click="sendCommand('skipTo', index)" 
              icon="msr-play_arrow" 
              size="small"
              color="success"
              round
            />
          </div>
        </div>
      </div>

      <!-- ===== REACCIONES ===== -->
      <div class="reactions-section">
        <h3>Reacciones</h3>
        <div class="reactions-grid">
          <button 
            v-for="emoji in reactions" 
            :key="emoji" 
            @click="sendReaction(emoji)" 
            class="emoji-btn"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'

const route = useRoute()
const roomCode = ref(route.params.roomCode || route.query.room)
const connected = ref(false)
const isPlaying = ref(false)
const volume = ref(50)
const currentSong = ref(null)
const queue = ref([])
const currentTime = ref(0)
const totalTime = ref(0)
const progressPercent = ref(0)
const reactions = ['💯', '🥳', '🤮', '❤️', '😍', '🤩', '🤯', '🙉', '🔥', '👎', '👍']

let socket = null

// Icono del volumen según el nivel
const volumeIcon = computed(() => {
  if (volume.value === 0) return 'off'
  if (volume.value < 50) return 'down'
  return 'up'
})

onMounted(() => {
  socket = io('http://192.168.10.191:3000', {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    socket.emit('joinAsControl', roomCode.value)
    connected.value = true
  })

  socket.on('notification', ({ type, data }) => {
    if (type === 'player/updateState') {
      isPlaying.value = data.playing
      volume.value = data.volume * 100
      currentSong.value = data.currentSong
      queue.value = data.queue || []
      currentTime.value = data.songProgress || 0
      totalTime.value = data.songSeconds || 0
      progressPercent.value = totalTime.value > 0 
        ? (currentTime.value / totalTime.value) * 100 
        : 0
    }
  })

  socket.on('disconnect', () => {
    connected.value = false
  })
})

onUnmounted(() => {
  if (socket) socket.disconnect()
})

function sendCommand(functionName, param) {
  socket.emit('controlCommand', {
    roomCode: roomCode.value,
    functionName,
    param
  })
}

function changeVolume(val) {
  socket.emit('controlCommand', {
    roomCode: roomCode.value,
    functionName: 'changeVolume',
    param: val / 100
  })
}

function sendReaction(emoji) {
  socket.emit('controlReaction', {
    roomCode: roomCode.value,
    functionName: 'playReaction',
    param: emoji
  })
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.control-view {
  min-height: 100vh;
  background: var(--eki-bg-color);
  color: var(--eki-font-color);
  padding: 15px;
  padding-bottom: 50px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--eki-border-color);
}

.header h2 {
  font-size: 20px;
  margin: 0;
}

.room-badge {
  background: var(--eki-secondary-color);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

/* CONEXIÓN */
.connecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 50px;
}

/* REPRODUCTOR */
.player-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--eki-border-color);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.song-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.song-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-img .placeholder {
  color: var(--eki-black-color);
  font-size: 30px;
}

.song-details {
  flex: 1;
  overflow: hidden;
}

.song-title {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  opacity: 0.7;
}

/* PROGRESO */
.progress-section {
  margin-bottom: 20px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 5px;
  opacity: 0.7;
}

/* CONTROLES */
.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.play-btn {
  background: var(--eki-secondary-color) !important;
  border-radius: 50%;
  width: 60px;
  height: 60px;
}

/* VOLUMEN */
.volume-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 0 10px;
}

.vol-slider {
  flex: 1;
}

/* COLA */
.queue-section {
  margin-bottom: 30px;
}

.queue-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.queue-list {
  background: var(--eki-border-color);
  border-radius: 12px;
  overflow: hidden;
}

.empty-queue {
  padding: 20px;
  text-align: center;
  opacity: 0.5;
  font-style: italic;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.queue-item:last-child {
  border-bottom: none;
}

.queue-num {
  font-weight: 700;
  color: var(--eki-secondary-color);
  min-width: 25px;
}

.queue-info {
  flex: 1;
  overflow: hidden;
}

.queue-title {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  font-size: 12px;
  opacity: 0.6;
}

/* REACCIONES */
.reactions-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.reactions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.emoji-btn {
  font-size: 32px;
  background: var(--eki-border-color);
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.emoji-btn:hover {
  transform: scale(1.1);
}
</style>