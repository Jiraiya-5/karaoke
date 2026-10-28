<template>
  <div v-if="currentSong" class="song-info">
    <RouterLink
      class="title"
      :to="{ name: 'songs', params: { id: currentSong.id } }"
      :title="$t('song.goToDetail')"
    >
      {{ currentSong.title }}
    </RouterLink>
    <span> - </span>
    <RouterLink
      class="artist"
      :to="{ name: 'artists', params: { id: currentSong.art?.id } }"
      :title="$t('artist.goToDetail')"
    >
      {{ currentSong.art?.name }}
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'

const playerStore = usePlayerStore()
const currentSong = computed(() => playerStore.currentSong)
</script>

<style scoped>
.song-info {
  margin-bottom: 12px;
  font-size: 15px;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 0.5rem;
  user-select: none;
}

.song-info .title {
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--eki-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.song-info .title:hover {
  color: var(--eki-secondary-color);
}

.song-info .artist {
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--eki-font-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.song-info .artist:hover {
  opacity: 0.9;
  color: var(--eki-secondary-color);
}
</style>