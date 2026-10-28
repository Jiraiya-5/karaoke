<template>
  <div class="eki-content">
    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <va-progress-circle indeterminate size="large" />
    </div>

    <!-- Estado de error -->
    <div v-else-if="!genre" class="empty-state">
      <h2>Género no encontrado</h2>
      <va-button :to="{ name: 'genresList' }" color="primary">Volver a géneros</va-button>
    </div>

    <!-- Contenido del género -->
    <div v-else>
      <!-- Header del género -->
      <div class="artist-header">
        <div class="artist-image">
          <img v-if="genre.image" :src="genre.image" :alt="genre.name" />
          <div v-else class="placeholder">
            <fa-icon icon="fa-solid fa-music" />
          </div>
          
          <!-- Botón de Play sobresaliendo -->
          <button 
            class="play-all-btn" 
            @click="playAll"
            :title="$t('song.play')"
          >
            <fa-icon icon="fa-solid fa-play" />
          </button>
        </div>
        <div class="artist-info">
          <h1 class="artist-name">{{ genre.name }}</h1>
          <p class="song-count">{{ songs.length }} Canciones</p>
        </div>
      </div>

      <!-- Tabla de canciones -->
      <div class="table-container">
        <table class="song-table">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-title">Título</th>
              <th class="col-artist">Artista</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in songs" :key="song.id">
              <td class="num">{{ song.num }}</td>
              <td class="info-cell">
                <div class="song-img">
                  <img 
                    v-if="song.image || song.genre_image" 
                    :src="song.image || song.genre_image" 
                    :alt="song.title" 
                  />
                  <div v-else class="placeholder">
                    <fa-icon icon="fa-solid fa-music" />
                  </div>
                </div>
                <div class="song-details">
                  <div class="song-title">{{ song.title }}</div>
                  <div class="song-genre">{{ song.genre_name }}</div>
                </div>
              </td>
              <td class="artist-name">{{ song.artist_name }}</td>
              <td class="actions">
                <va-button
                  icon="fa-solid fa-cart-plus"
                  color="primary"
                  size="small"
                  square
                  :title="$t('song.addToQueue')"
                  @click="addToQueue(song)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequesterStore } from '@/stores/requester'
import { usePlayerStore } from '@/stores/player'
import { useUtilsStore } from '@/stores/utils'

const route = useRoute()
const router = useRouter()
const requesterX = useRequesterStore()
const playerX = usePlayerStore()
const utilsX = useUtilsStore()

const genre = ref(null)
const songs = ref([])
const loading = ref(true)

watch(() => route.params.id, () => {
  loadGenre()
})

onMounted(() => {
  loadGenre()
})

async function loadGenre() {
  const genreId = route.params.id
  if (!genreId) return

  loading.value = true
  genre.value = null
  songs.value = []

  try {
    const res = await requesterX.Get({ route: `/generos/${genreId}?limit=50` })
    if (res.data) {
      genre.value = res.data.genre
      songs.value = res.data.songs || []
    }
  } catch (e) {
    console.error('Error cargando género:', e)
  } finally {
    loading.value = false
  }
}

function playAll() {
  if (songs.value.length === 0) return
  const firstSong = songs.value[0]
  playerX.addToQueue({
    id: firstSong.id,
    num: firstSong.num,
    title: firstSong.title,
    art: { id: firstSong.artist_id, name: firstSong.artist_name, img: firstSong.artist_image },
    gen: { id: firstSong.genre_id, name: firstSong.genre_name, img: firstSong.genre_image },
    hasVoice: !!firstSong.has_voice
  }, { shouldPlay: true })
  
  utilsX.setNotif({ title: 'song.addedToQueue', message: 'song.addedToQueueMsg', type: 'success' })
}

function addToQueue(song) {
  playerX.addToQueue({
    id: song.id,
    num: song.num,
    title: song.title,
    art: { id: song.artist_id, name: song.artist_name, img: song.artist_image },
    gen: { id: song.genre_id, name: song.genre_name, img: song.genre_image },
    hasVoice: !!song.has_voice
  })
  utilsX.setNotif({ title: 'song.addedToQueue', message: 'song.addedToQueueMsg', type: 'success' })
}
</script>

<style scoped>
.eki-content {
  padding: 20px;
  min-height: 100vh;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 20px;
}

/* ========================================== */
/* HEADER DEL GÉNERO */
/* ========================================== */
.artist-header {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.artist-image {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  background: #6022C6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  flex-shrink: 0;
}

.artist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.artist-image .placeholder {
  font-size: 60px;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-all-btn {
  position: absolute;
  bottom: -15px;
  right: -15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #d900c9;
  color: white;
  border: 3px solid var(--eki-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.play-all-btn:hover {
  transform: scale(1.1);
  background: #b300a4;
}

.artist-info {
  flex: 1;
  padding-bottom: 10px;
  padding-left: 15px;
}

.artist-info .artist-name {
  font-size: 40px;
  font-weight: 900;
  margin: 0 0 5px 0;
  color: var(--eki-font-color);
}

.song-count {
  font-size: 16px;
  opacity: 0.7;
  font-weight: 600;
  margin: 0;
}

/* ========================================== */
/* TABLA DE CANCIONES */
/* ========================================== */
.table-container {
  width: 100%;
  margin-top: 20px;
}

.song-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--eki-font-color);
}

.song-table th {
  text-align: left;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--eki-font-color);
}

.col-num { 
  width: 50px; 
  text-align: center;
}
.col-title { 
  width: 50%; 
  padding-left: 15px;
}
.col-artist { 
  width: 35%; 
  text-align: right; 
  padding-right: 20px; 
}
.col-actions { 
  width: 80px; 
  text-align: right; 
}

.song-table tr {
  transition: opacity 0.3s ease;
  opacity: 0.7;
}

.song-table tr:hover {
  opacity: 1;
}

.song-table td {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.num {
  font-weight: 700;
  color: var(--eki-secondary-color);
  opacity: 0.7;
  text-align: center;
}

.info-cell {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 15px;
}

.song-img {
  width: 45px;
  height: 45px;
  border-radius: 4px;
  overflow: hidden;
  background: #2a1b4d;
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
  color: rgba(255, 255, 255, 0.3);
  font-size: 20px;
}

.song-details {
  display: flex;
  flex-direction: column;
}

.song-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.song-genre {
  font-size: 12px;
  opacity: 0.6;
}

/* 👇 Nombre del artista en la tabla (Pequeño, gris, derecha) */
.song-table .artist-name {
  text-align: right;
  padding-right: 20px;
  font-size: 13px;
  font-weight: 400;
  color: var(--eki-font-color);
  opacity: 0.6;
}

.actions {
  text-align: right;
  padding-right: 10px;
}

.actions .va-button {
  background-color: #d900c9 !important;
  border-radius: 4px !important;
}

/* RESPONSIVE */
@media screen and (max-width: 600px) {
  .artist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .artist-info .artist-name {
    font-size: 28px;
    text-align: center;
  }
  .artist-image {
    width: 120px;
    height: 120px;
  }
  .artist-info {
    padding-left: 0;
  }
  .col-artist,
  .song-table .artist-name {
    display: none;
  }
}
</style>