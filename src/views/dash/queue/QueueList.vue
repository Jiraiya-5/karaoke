<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('queue.single') }} <span class="count-badge">{{ playerX.queue.length }}</span></h1>
      <va-button v-if="playerX.queue.length > 0" icon="fa-solid fa-trash" color="danger" @click="clearQueue">
        {{ $t('queue.clear') }}
      </va-button>
    </div>

    <div v-if="playerX.queue.length === 0" class="empty">
      {{ $t('noResults') }}
    </div>

    <div v-else class="table-container">
      <table class="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('song.title') }}</th>
            <th>{{ $t('artist.single') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(song, index) in playerX.queue" :key="index">
            <td class="num">{{ index + 1 }}</td>
            <td class="info-cell">
              <div class="song-img">
                <!-- 👇 PROTEGIDO CON ?. -->
                <img 
                  v-if="song?.gen?.img || song?.art?.img" 
                  :src="song?.gen?.img || song?.art?.img" 
                  :alt="song?.title" 
                />
                <div v-else class="placeholder">
                  <fa-icon icon="fa-solid fa-music" />
                </div>
              </div>
              <div class="song-details">
                <div class="song-title">{{ song?.title || 'Desconocido' }}</div>
                <div class="song-genre">{{ song?.gen?.name || 'Sin género' }}</div>
              </div>
            </td>
            <td class="artist-name">{{ song?.art?.name || 'Desconocido' }}</td>
            <td class="actions">
              <va-button
                icon="fa-solid fa-play"
                color="success"
                size="small"
                round
                @click="playerX.skipTo(index)"
              />
              <va-button
                icon="fa-solid fa-times"
                color="danger"
                size="small"
                round
                @click="playerX.removeFromQueue(index)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player'

const playerX = usePlayerStore()

function clearQueue() {
  playerX.cleanQueue()
}
</script>

<style scoped>
/* Mismos estilos que HistoryList */
.eki-content { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 28px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 10px; }
.count-badge { background: var(--eki-secondary-color); color: #fff; font-size: 16px; padding: 2px 10px; border-radius: 12px; }
.empty { text-align: center; padding: 60px; opacity: 0.5; font-style: italic; font-size: 18px; }
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
.actions { text-align: right; width: 120px; display: flex; gap: 5px; justify-content: flex-end; }
</style>