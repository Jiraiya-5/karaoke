<template>
  <div class="eki-content">
    <h1 class="title">{{ $t('history.single') }}</h1>
    <div class="table-container">
      <table class="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('song.title') }}</th>
            <th>{{ $t('artist.single') }}</th>
            <th>{{ $t('history.playedAt') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td class="num">{{ item.num }}</td>
            <td class="info-cell">
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
              <div class="song-details">
                <div class="song-title">{{ item.title }}</div>
                <div class="song-genre">{{ item.genre_name }}</div>
              </div>
            </td>
            <td class="artist-name">{{ item.artist_name }}</td>
            <td class="played-at">{{ formatDate(item.played_at) }}</td>
            <td class="actions">
              <va-button
                icon="fa-solid fa-cart-plus"
                color="primary"
                size="small"
                round
                @click="addToQueue(item)"
              />
            </td>
          </tr>
        </tbody>
      </table>
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

const history = ref([])

onMounted(async () => {
  try {
    // ⚠️ Asegúrate de que esta ruta devuelva 'artist_image', 'genre_image' e 'image'
    const res = await requesterX.Get({ route: '/get-history?limit=50', withAuth: true })
    history.value = res.data
  } catch (e) {
    console.error('Error cargando historial:', e)
  }
})

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function addToQueue(item) {
  playerX.addToQueue({
    id: item.song_id,
    num: item.num,
    title: item.title,
    art: { id: item.artist_id, name: item.artist_name, img: item.artist_image },
    gen: { id: item.genre_id, name: item.genre_name, img: item.genre_image }
  })
  utilsX.setNotif({ title: 'song.addedToQueue', message: 'song.addedToQueueMsg', type: 'success' })
}
</script>

<style scoped>
/* Mismos estilos que SongsList */
.eki-content { padding: 20px; }
.title { font-size: 28px; font-weight: 700; margin-bottom: 20px; }
.table-container { background: var(--eki-border-color); border-radius: 12px; overflow: hidden; }
.song-table { width: 100%; border-collapse: collapse; color: var(--eki-font-color); }
.song-table th { text-align: left; padding: 15px; font-size: 13px; text-transform: uppercase; opacity: 0.6; border-bottom: 2px solid rgba(255,255,255,0.1); }
.song-table td { padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
.song-table tr:hover { background: rgba(255,255,255,0.05); }
.num { width: 60px; font-weight: 700; color: var(--eki-secondary-color); }
.info-cell { display: flex; align-items: center; gap: 15px; }
.song-img { width: 40px; height: 40px; border-radius: 6px; overflow: hidden; background: #6022C6; display: flex; align-items: center; justify-content: center; }
.song-img img { width: 100%; height: 100%; object-fit: cover; }
.song-img .placeholder { color: rgba(255,255,255,0.5); }
.song-details { display: flex; flex-direction: column; }
.song-title { font-weight: 600; font-size: 15px; }
.song-genre { font-size: 12px; opacity: 0.6; }
.artist-name { opacity: 0.8; }
.played-at { opacity: 0.6; font-size: 13px; }
.actions { text-align: right; width: 80px; }
</style>