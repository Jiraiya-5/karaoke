<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('search') }}</h1>
    </div>

    <div class="filters">
      <va-button
        v-for="tab in tabs"
        :key="tab.value"
        :color="currentType === tab.value ? 'primary' : 'secondary'"
        :preset="currentType === tab.value ? 'solid' : 'plain'"
        size="small"
        @click="setType(tab.value)"
      >
        {{ $t(tab.label) }}
      </va-button>
    </div>

    <!-- Resultados: Canciones -->
    <div v-if="currentType === 'all' || currentType === 'song'" class="section">
      <h2 class="section-title">{{ $t('song.plural') }}</h2>
      <div v-if="songs.length === 0" class="empty">{{ $t('noResults') }}</div>
      <div v-else class="song-list">
        <div v-for="song in songs" :key="song.id" class="song-row">
          <div class="song-num">{{ song.num }}</div>
          <div class="song-img">
                <!-- 👇 CORREGIDO: usar 'item' en lugar de 'song' -->
                <img 
                  v-if="item.image || item.artist_image || item.genre_image" 
                  :src="item.image || item.artist_image || item.genre_image" 
                  :alt="item.title" 
                />
                <div v-else class="placeholder">
                  <fa-icon icon="fa-solid fa-music" />
                </div>
              </div>
          <div class="song-info">
            <div class="song-title">{{ song.title }}</div>
            <div class="song-genre">{{ song.genre_name }}</div>
          </div>
          <div class="song-artist">{{ song.artist_name }}</div>
          <va-button
            icon="fa-solid fa-cart-plus"
            color="primary"
            size="small"
            round
            @click="addToQueue(song)"
          />
        </div>
      </div>
    </div>

    <!-- Resultados: Artistas -->
    <div v-if="currentType === 'all' || currentType === 'artist'" class="section">
      <h2 class="section-title">{{ $t('artist.plural') }}</h2>
      <div v-if="artists.length === 0" class="empty">{{ $t('noResults') }}</div>
      <div v-else class="grid">
        <EkiCard
          v-for="artist in artists"
          :key="artist.id"
          :image="artist.image"
          :title="artist.name"
          :count="artist.song_count"
          icon="fa-solid fa-microphone"
          @click="goToArtist(artist.id)"
        />
      </div>
    </div>

    <!-- Resultados: Géneros -->
    <div v-if="currentType === 'all' || currentType === 'genre'" class="section">
      <h2 class="section-title">{{ $t('genre.plural') }}</h2>
      <div v-if="genres.length === 0" class="empty">{{ $t('noResults') }}</div>
      <div v-else class="grid">
        <EkiCard
          v-for="genre in genres"
          :key="genre.id"
          :image="genre.image"
          :title="genre.name"
          :count="genre.song_count"
          icon="fa-solid fa-music"
          @click="goToGenre(genre.id)"
        />
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
import EkiCard from '@/components/eki-card/EkiCard.vue'

const route = useRoute()
const router = useRouter()
const requesterX = useRequesterStore()
const playerX = usePlayerStore()
const utilsX = useUtilsStore()

const currentType = ref(route.query.type || 'all')
const query = ref(route.query.q || '')
const songs = ref([])
const artists = ref([])
const genres = ref([])

const tabs = [
  { label: 'home.all', value: 'all' },
  { label: 'song.plural', value: 'song' },
  { label: 'artist.plural', value: 'artist' },
  { label: 'genre.plural', value: 'genre' }
]

onMounted(() => {
  searchAll()
})

watch(() => route.query, () => {
  query.value = route.query.q || ''
  currentType.value = route.query.type || 'all'
  searchAll()
})

function setType(type) {
  currentType.value = type
  router.replace({ query: { ...route.query, type } })
}

async function searchAll() {
  if (currentType.value === 'all' || currentType.value === 'song') {
    await loadSongs()
  }
  if (currentType.value === 'all' || currentType.value === 'artist') {
    await loadArtists()
  }
  if (currentType.value === 'all' || currentType.value === 'genre') {
    await loadGenres()
  }
}

async function loadSongs() {
  try {
    const route = query.value
      ? `/search?q=${query.value}&limit=20&offset=0`
      : `/get-songs?limit=10&offset=0`
    const res = await requesterX.Get({ route })
    const data = Array.isArray(res.data) ? res.data : res.data.data || []
    songs.value = data
  } catch (e) {
    console.error('Error cargando canciones:', e)
    songs.value = []
  }
}

async function loadArtists() {
  try {
    const res = await requesterX.Get({ route: '/get-artists?limit=10&offset=0' })
    artists.value = res.data
  } catch (e) {
    console.error('Error cargando artistas:', e)
    artists.value = []
  }
}

async function loadGenres() {
  try {
    const res = await requesterX.Get({ route: '/get-genres?limit=10&offset=0' })
    genres.value = res.data
  } catch (e) {
    console.error('Error cargando géneros:', e)
    genres.value = []
  }
}

function goToArtist(id) {
  router.push({ name: 'artistDetail', params: { id } })
}

function goToGenre(id) {
  router.push({ name: 'genreDetail', params: { id } })
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
  utilsX.setNotif({
    title: 'song.addedToQueue',
    message: 'song.addedToQueueMsg',
    type: 'success'
  })
}
</script>

<style scoped>
.eki-content { padding: 20px; }
.header { margin-bottom: 20px; }
.title { font-size: 28px; font-weight: 700; margin: 0; }
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.section { margin-bottom: 40px; }
.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--eki-font-color);
}
.empty {
  text-align: center;
  padding: 40px;
  opacity: 0.5;
  font-style: italic;
}
.song-list {
  background: var(--eki-border-color);
  border-radius: 12px;
  overflow: hidden;
}
.song-row {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s;
}
.song-row:hover { background: rgba(255, 255, 255, 0.05); }
.song-num {
  width: 40px;
  font-weight: 700;
  color: var(--eki-secondary-color);
}
.song-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: #6022C6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.song-img img { width: 100%; height: 100%; object-fit: cover; }
.song-img .placeholder { color: rgba(255, 255, 255, 0.5); }
.song-info { flex: 1; }
.song-title { font-weight: 600; font-size: 15px; }
.song-genre { font-size: 12px; opacity: 0.6; }
.song-artist { opacity: 0.7; font-size: 14px; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}
</style>