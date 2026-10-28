<template>
  <div class="side-nav" ref="sideNavElement">
    <div class="logo">
      <img width="45" height="45" :src="ekiLogo" alt="ekilogo.webp" />
      <div class="app-name">Ecuakaraoke</div>
      <div class="mobile-nav">
        <fa-icon class="icon" icon="fa-solid fa-bars" @click="utilsX.isMenuOpened = !utilsX.isMenuOpened" />
      </div>
    </div>

    <va-scroll-container vertical class="nav-container" size="small">
      <nav class="nav-links">
        <router-link class="nav-link" :to="{ name: 'home' }" :title="$t('home.goTo')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-home"></fa-icon>
          {{ $t('home.single') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'seeker', query: { q: '', type: 'all' } }" :title="$t('search')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-search"></fa-icon>
          {{ $t('search') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'songsList' }" :title="$t('song.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-compact-disc"></fa-icon>
          {{ $t('song.mySongs') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'newSongs' }" :title="$t('song.goToNew')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-cart-plus"></fa-icon>
          {{ $t('song.new') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'artistsList' }" :title="$t('artist.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-microphone"></fa-icon>
          {{ $t('artist.plural') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'genresList' }" :title="$t('genre.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-layer-group"></fa-icon>
          {{ $t('genre.plural') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'historyList' }" :title="$t('history.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-clock-rotate-left"></fa-icon>
          {{ $t('history.single') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'queueList' }" :title="$t('queue.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-list-ol"></fa-icon>
          {{ $t('queue.single') }}
        </router-link>
        <router-link class="nav-link" :to="{ name: 'playlistsList' }" :title="$t('playlist.goToList')" @click="closeMenu">
          <fa-icon class="link-icon" icon="fa-solid fa-list"></fa-icon>
          {{ $t('playlist.plural') }}
        </router-link>
      </nav>
    </va-scroll-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUtilsStore } from '@/stores/utils'
import { useUserStore } from '@/stores/user'
import { useClickOutside } from '@/composables/useClickOutside'
import ekiLogo from '@/assets/ekiLogo.webp'

const utilsX = useUtilsStore()
const userX = useUserStore()
const sideNavElement = ref()

useClickOutside(sideNavElement, () => {
  utilsX.isMenuOpened = false
})

function closeMenu() {
  utilsX.isMenuOpened = false
}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>