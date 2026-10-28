<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('artist.plural') }}</h1>
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

    <div v-if="loading && artists.length === 0" class="loading">
      <va-progress-circle indeterminate />
    </div>

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
import EkiCard from '@/components/eki-card/EkiCard.vue'

const router = useRouter()
const requesterX = useRequesterStore()

const artists = ref([])
const loading = ref(false)
const hasMore = ref(true)
const searchQuery = ref('')
let page = 1
const limit = 20
let debounceTimer = null

onMounted(() => loadArtists())

async function loadArtists(reset = false) {
  if (reset) {
    page = 1
    artists.value = []
  }
  loading.value = true
  try {
    const res = await requesterX.Get({
      route: `/get-artists?limit=${limit}&offset=${(page - 1) * limit}&q=${searchQuery.value}`
    })
    if (res.data.length < limit) hasMore.value = false
    else hasMore.value = true
    artists.value = [...artists.value, ...res.data]
    page++
  } catch (e) {
    console.error('Error cargando artistas:', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  loadArtists()
}

function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadArtists(true)
  }, 500)
}

function goToArtist(id) {
  router.push({ name: 'artistDetail', params: { id } })
}
</script>

<style scoped lang="scss">
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 50px;
}
.see-all {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>