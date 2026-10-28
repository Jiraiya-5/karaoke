<template>
    <div class="side-nav" ref="sideNavElement">
        <div class="logo">
            <img width="45" height="45" class="panel-icon" src="/images/ek-logos/ekiLogo.webp" alt="ekilogo.webp">
            <div class="app-name">Ecuakaraoke</div>
            <div class="mobile-nav">
                <fa-icon class="icon" icon="fa-solid fa-bars" @click="utilsX.isMenuOpened = !utilsX.isMenuOpened" />
            </div>
        </div>
        <va-scroll-container vertical class="nav-container" size="small">
            <nav class="nav-links">
                <router-link class="nav-link" :to="{ name: preventNavCustom('dashPreview') ?? 'home' }"
                    :title="$t('home.goTo')" @click="utilsX.isMenuOpened = false; requestNotifs()">
                    <fa-icon class="link-icon" icon="fa-solid fa-home"></fa-icon>
                    {{ $t('home.single') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'seeker', query: { q: '', type: 'all' } }"
                    :title="$t('search')" @click="utilsX.isMenuOpened = false; requestNotifs()">
                    <fa-icon class="link-icon" icon="fa-solid fa-search"></fa-icon>
                    {{ $t('search') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'songs' }" :title="$t('song.goToList')"
                    @click="utilsX.isMenuOpened = false; requestNotifs()">
                    <fa-icon class="link-icon" icon="fa-solid fa-compact-disc"></fa-icon>
                    {{ $t('song.mySongs') }}
                </router-link>

                <!--router-link class="nav-link" :to="{ name: 'downloadedSongs' }" :title="$t('song.goToDownload')"
                    @click="utilsX.isMenuOpened = false; requestNotifs()" v-if="hasDownloadedSongs">
                    <fa-icon class="link-icon" icon="fa-solid fa-download"></fa-icon>
                    {{ $t('song.downloadedSongs') }}
                </router-link-->

                <router-link class="nav-link" :to="{ name: 'newSongs' }" :title="$t('song.goToNew')"
                    @click="utilsX.isMenuOpened = false; requestNotifs()" v-if="isOnline">
                    <fa-icon class="link-icon" icon="fa-solid fa-cart-plus"></fa-icon>
                    {{ $t('song.new') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'artists' }" :title="$t('artist.goToList')"
                    @click="utilsX.isMenuOpened = false">
                    <fa-icon class="link-icon" icon="fa-solid fa-microphone"></fa-icon>
                    {{ $t('artist.plural') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'genres' }" :title="$t('genre.goToList')"
                    @click="utilsX.isMenuOpened = false">
                    <fa-icon class="link-icon" icon="fa-solid fa-layer-group"></fa-icon>
                    {{ $t('genre.plural') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'history' }" :title="$t('history.goToList')"
                    @click="utilsX.isMenuOpened = false">
                    <fa-icon class="link-icon" icon="fa-solid fa-clock-rotate-left"></fa-icon>
                    {{ $t('history.single') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'queue' }" :title="$t('queue.goToList')"
                    @click="utilsX.isMenuOpened = false">
                    <fa-icon class="link-icon" icon="fa-solid fa-list-ol"></fa-icon>
                    {{ $t('queue.single') }}
                </router-link>
                <router-link class="nav-link" :to="{ name: 'playlists' }" :title="$t('playlist.goToList')"
                    @click="utilsX.isMenuOpened = false">
                    <fa-icon class="link-icon" icon="fa-solid fa-list"></fa-icon>
                    {{ $t('playlist.plural') }}
                </router-link>
            </nav>
        </va-scroll-container>
    </div>
</template>

<script setup>
import { usePreventers } from "@/composables/usePreventers";
import { useUtilsStore } from "@/stores/utils";
import { useUserStore } from "@/stores/user";
import { useClickOutside } from "@/composables/useClickOutside";
import { ref, onBeforeMount } from "vue";

const { preventNavCustom } = usePreventers();
const utilsX = useUtilsStore();
const userX = useUserStore();
const requested = ref(false);
const sideNavElement = ref();
const isOnline = ref(null);
const hasDownloadedSongs = ref(false);

useClickOutside(sideNavElement, () => {
    utilsX.isMenuOpened = false;
});
onBeforeMount(async()=>{
    isOnline.value = navigator.onLine;
    setTimeout(()=>{
        hasDownloadedSongs.value = userX.localSongs.length > 0;
    },5000);
    
});
async function requestNotifs() {
    if (!requested.value) {
        const { useFirebaseStore } = await import("@/stores/firebase");
        const firebaseX = useFirebaseStore();
        firebaseX.requestPermission();
        requested.value = true;
    }
}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>
