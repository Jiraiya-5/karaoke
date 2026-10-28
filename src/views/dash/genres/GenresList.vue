<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('genre.plural') }}</h1>
      <div class="search-box">
        <va-input
          v-model="searchQuery"
          :placeholder="$t('search')"
          clearable
          @input="debouncedSearch"
        >
          <template #appendInner>
            <fa-icon icon="fa-solid fa-search" />
          </template>
        </va-input>
      </div>
    </div>

    <div v-if="loading && genres.length === 0" class="loading">
      <va-progress-circle indeterminate />
    </div>

    <div v-else class="grid">
      <div
        v-for="genre in genres"
        :key="genre.id"
        class="genre-card"
        @click="goToGenre(genre.id)"
      >
        <!-- Imagen de fondo -->
        <div class="card-image">
          <img v-if="genre.image" :src="genre.image" :alt="genre.name" />
          <div v-else class="placeholder">
            <fa-icon icon="fa-solid fa-music" />
          </div>
          
          <!-- Degradado inferior para el texto -->
          <div class="gradient-overlay"></div>

          <!-- Icono de candado (esquina superior derecha) -->
          <div class="lock-icon">
            <fa-icon icon="fa-solid fa-lock" />
          </div>

          <!-- Contador de canciones (esquina inferior izquierda) -->
          <div class="song-count-badge">
            <fa-icon icon="fa-solid fa-list-ul" /> {{ genre.song_count }}
          </div>

          <!-- Barra de progreso vertical (esquina inferior derecha) -->
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <!-- Nombre del género -->
        <div class="card-title">{{ genre.name }}</div>
      </div>
    </div>

    <div class="see-all" v-if="hasMore">
      <va-button :loading="loading" @click="loadMore" color="primary">
        {{ $t('loadMore') }}
      </va-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRequesterStore } from '@/stores/requester'

const router = useRouter()
const requesterX = useRequesterStore()

const genres = ref([])
const loading = ref(false)
const hasMore = ref(true)
const searchQuery = ref('')
let page = 1
const limit = 20
let debounceTimer = null

onMounted(() => loadGenres())

async function loadGenres(reset = false) {
  if (reset) {
    page = 1
    genres.value = []
  }
  loading.value = true
  try {
    const res = await requesterX.Get({
      route: `/get-genres?limit=${limit}&offset=${(page - 1) * limit}&q=${searchQuery.value}`
    })
    if (res.data.length < limit) hasMore.value = false
    else hasMore.value = true
    genres.value = [...genres.value, ...res.data]
    page++
  } catch (e) {
    console.error('Error cargando géneros:', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadGenres()
}

function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadGenres(true)
  }, 500)
}

function goToGenre(id) {
  router.push({ name: 'genreDetail', params: { id } })
}
</script>

<style scoped>
.eki-content {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.search-box {
  width: 300px;
  max-width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* ========================================== */
/* DISEÑO DE LA TARJETA DE GÉNERO             */
/* ========================================== */
.genre-card {
  background: var(--eki-border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
}

.genre-card:hover {
  transform: translateY(-5px);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #1a1a1a;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: rgba(255, 255, 255, 0.3);
  background: #2a1b4d;
}

/* Degradado inferior */
.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  z-index: 1;
}

/* Icono de candado verde */
.lock-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(0, 200, 0, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  z-index: 2;
}

/* Contador de canciones */
.song-count-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 2;
}

/* Barra de progreso vertical */
.progress-bar {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 4px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  z-index: 2;
}

.progress-fill {
  width: 100%;
  height: 70%; /* Simula el progreso */
  background: white;
}

/* Nombre del género */
.card-title {
  padding: 12px 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--eki-font-color);
  text-align: left;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}
</style>