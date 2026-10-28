<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('song.plural') }}</h1>
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

    <div class="table-container">
      <table class="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('song.title') }}</th>
            <th>{{ $t('artist.single') }}</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in songs" :key="song.id">
            <td class="num">{{ song.num }}</td>
            <td class="info-cell">
              <div class="song-img">
                <img 
  v-if="song.image || song.artist_image || song.genre_image" 
  :src="song.image || song.artist_image || song.genre_image" 
  :alt="song.title" 
/>
<div v-else class="placeholder"><fa-icon icon="fa-solid fa-music" /></div>
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
                round
                :title="$t('song.addToQueue')"
                @click="addToQueue(song)"
              />
            </td>
          </tr>
        </tbody>
      </table>
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
import { useRequesterStore } from '@/stores/requester'
import { usePlayerStore } from '@/stores/player'
import { useUtilsStore } from '@/stores/utils'

const requesterX = useRequesterStore()
const playerX = usePlayerStore()
const utilsX = useUtilsStore()

const songs = ref([])
const loading = ref(false)
const hasMore = ref(true)
const searchQuery = ref('')
let page = 1
const limit = 20
let debounceTimer = null

onMounted(() => loadSongs())

async function loadSongs(reset = false) {
  if (reset) {
    page = 1
    songs.value = []
  }
  loading.value = true
  try {
    const route = searchQuery.value
      ? `/search?q=${searchQuery.value}&limit=${limit}&offset=${(page - 1) * limit}`
      : `/get-songs?limit=${limit}&offset=${(page - 1) * limit}`

    const res = await requesterX.Get({ route })
// Validar que res y res.data existan
if (!res || !res.data) {
  console.warn('No se pudieron cargar las canciones')
  songs.value = []
  return
}

const data = Array.isArray(res.data) ? res.data : (res.data.data || [])

    if (data.length < limit) hasMore.value = false
    else hasMore.value = true

    songs.value = [...songs.value, ...data]
    page++
  } catch (e) {
    console.error('Error cargando canciones:', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadSongs()
}

function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadSongs(true)
  }, 500)
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

<style scoped lang="scss">
.eki-content { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; flex-wrap: wrap; }
.title { font-size: 28px; font-weight: 700; margin: 0; }
.search-box { width: 300px; max-width: 100%; }

.table-container {
  background: var(--eki-border-color);
  border-radius: 12px;
  overflow: hidden;
}

.song-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--eki-font-color);

  th {
    text-align: left;
    padding: 15px;
    font-size: 13px;
    text-transform: uppercase;
    opacity: 0.6;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  td {
    padding: 10px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    vertical-align: middle;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .num {
    width: 60px;
    font-weight: 700;
    color: var(--eki-secondary-color);
  }

  .info-cell {
    display: flex;
    align-items: center;
    gap: 15px;
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

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .song-details {
    display: flex;
    flex-direction: column;
  }

  .song-title {
    font-weight: 600;
    font-size: 15px;
  }

  .song-genre {
    font-size: 12px;
    opacity: 0.6;
  }

  .artist-name {
    opacity: 0.8;
  }

  .actions {
    text-align: right;
    width: 80px;
  }
}

.loading { display: flex; justify-content: center; padding: 50px; }
.see-all { display: flex; justify-content: center; margin-top: 30px; }
</style>