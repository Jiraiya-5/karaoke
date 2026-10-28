<template>
  <div class="eki-content">
    <div class="header">
      <h1 class="title">{{ $t('playlist.plural') }}</h1>
      <va-button icon="fa-solid fa-plus" color="warning" @click="showCreateModal = true">
        {{ $t('playlist.create') }}
      </va-button>
    </div>

    <div v-if="playlists.length === 0" class="empty">
      {{ $t('playlist.noPlaylists') }}
    </div>

    <div v-else class="grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card"
        @click="goToPlaylist(playlist.id)"
      >
        <div class="playlist-image">
          <div class="placeholder">{{ (playlist.name || '??').substring(0, 2).toUpperCase() }}</div>
          <div class="actions">
            <va-button icon="fa-solid fa-edit" size="small" round color="primary" @click.stop="editPlaylist(playlist)" />
            <va-button icon="fa-solid fa-trash" size="small" round color="danger" @click.stop="deletePlaylist(playlist.id)" />
          </div>
        </div>
        <div class="playlist-name">{{ playlist.name }}</div>
        <div class="playlist-count">{{ playlist.songs?.length || 0 }} {{ $t('song.plural') }}</div>
      </div>
    </div>

    <!-- Modal Crear -->
    <va-modal v-model="showCreateModal" :title="$t('playlist.create')" hide-default-actions>
      <va-input v-model="newPlaylistName" :label="$t('playlist.name')" class="mb-4" />
      <div class="modal-actions">
        <va-button preset="plain" @click="showCreateModal = false">{{ $t('cancel') }}</va-button>
        <va-button color="primary" @click="createPlaylist">{{ $t('save') }}</va-button>
      </div>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRequesterStore } from '@/stores/requester'
import { useUtilsStore } from '@/stores/utils'

const router = useRouter()
const requesterX = useRequesterStore()
const utilsX = useUtilsStore()

const playlists = ref([])
const showCreateModal = ref(false)
const newPlaylistName = ref('')

onMounted(() => loadPlaylists())

async function loadPlaylists() {
  try {
    const res = await requesterX.Get({ route: '/get-playlists', withAuth: true })
    playlists.value = res.data
  } catch (e) {
    console.error('Error cargando playlists:', e)
  }
}

async function createPlaylist() {
  if (!newPlaylistName.value) return
  try {
    await requesterX.Post({
      route: '/create-playlist',
      withAuth: true,
      body: { name: newPlaylistName.value }
    })
    showCreateModal.value = false
    newPlaylistName.value = ''
    await loadPlaylists()
    utilsX.setNotif({ title: 'success', message: 'playlist.created', type: 'success' })
  } catch (e) {
    console.error('Error creando playlist:', e)
  }
}

async function deletePlaylist(id) {
  try {
    await requesterX.Delete({ route: `/delete-playlist/${id}`, withAuth: true })
    await loadPlaylists()
    utilsX.setNotif({ title: 'success', message: 'playlist.deleted', type: 'success' })
  } catch (e) {
    console.error('Error eliminando playlist:', e)
  }
}

function goToPlaylist(id) {
  router.push({ name: 'playlistDetail', params: { id } })
}

function editPlaylist(playlist) {
  // TODO: modal de edición
  console.log('Editar playlist:', playlist)
}
</script>

<style scoped>
.eki-content { padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.title { font-size: 28px; font-weight: 700; margin: 0; }
.empty { text-align: center; padding: 60px; opacity: 0.5; font-style: italic; font-size: 18px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
.playlist-card { background: var(--eki-border-color); border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s; }
.playlist-card:hover { transform: translateY(-5px); }
.playlist-image { position: relative; aspect-ratio: 1; background: #d0d0d0; display: flex; align-items: center; justify-content: center; }
.playlist-image .placeholder { font-size: 60px; font-weight: 700; color: #666; }
.playlist-image .actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 5px; }
.playlist-name { padding: 12px; font-weight: 600; }
.playlist-count { padding: 0 12px 12px; font-size: 13px; opacity: 0.6; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.mb-4 { margin-bottom: 16px; }
</style>