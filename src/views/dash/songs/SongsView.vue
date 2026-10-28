<template>
  <div class="eki-content">
    <h1 class="title">{{ $t('song.plural') }}</h1>
    <div class="eki-cards">
      <div v-for="song in songs" :key="song.id" class="eki-card">
        <div class="img-container">
          <div
            class="thumbnail"
            :style="{ backgroundImage: `url(${song.gen?.img})` }"
            @click="playSong(song)"
          >
            <div class="num-songs-info">{{ song.num }} - {{ song.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useRequesterStore } from '@/stores/requester'

const playerStore = usePlayerStore()
const requesterStore = useRequesterStore()
const songs = ref([])

async function loadSongs() {
  try {
    const { data } = await requesterStore.Get({ route: '/songs/1?limit=50', withAuth: true })
    songs.value = data?.songs || []
  } catch (e) {
    console.error(e)
  }
}

function playSong(song) {
  playerStore.playKeepingQueue(song)
}

onMounted(loadSongs)
</script>

<style scoped>
.eki-content { padding: 0 20px; }
.eki-content .title { font-size: 40px; margin: 25px 0; }
.eki-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(250px, 45%), 1fr));
  padding-bottom: 50px;
}
.eki-card .img-container {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
}
.eki-card .thumbnail {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
}
.eki-card .thumbnail:hover { background-size: 110%; }
.eki-card .thumbnail .num-songs-info {
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  padding: 7px;
  color: #fff;
  background-color: #0000008c;
  text-align: center;
}
</style>