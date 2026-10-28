<template>
  <div class="eki-viewport">
    <!-- Cookie Banner -->
    <EkiCookieBanner
      v-if="showCookieBanner"
      @allowed="runCookieDependencies"
      @denied="showCookieBanner = false"
    />

    <!-- Score Modal -->
    <EkiScore
      v-if="showScore && settings.functionallity.showCalification"
    />

    <!-- Title Animation -->
    <EkiTitle />

    <!-- Lights -->
    <EkiLights />

    <!-- Notifications -->
    <EkiNotifs />

    <!-- Router View -->
    <RouterView />
  </div>
</template>

<script setup>

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useTauriFetchApi } from "@/composables/useTauriFetchApi";
import { computed } from 'vue'
import { useUtilsStore } from '@/stores/utils'
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import EkiCookieBanner from '@/components/eki-cookie-banner/EkiCookieBanner.vue'
import EkiScore from '@/components/eki-score/EkiScore.vue'
import EkiTitle from '@/components/eki-title/EkiTitle.vue'
import EkiLights from '@/components/eki-lights/EkiLights.vue'
import EkiNotifs from '@/components/eki-notifs/EkiNotifs.vue'

const utilsStore = useUtilsStore()
const userStore = useUserStore()
const userX = useUserStore()

const showCookieBanner = computed(() => utilsStore.showCookieBanner)
const showScore = computed(() => utilsStore.showScore)
const settings = computed(() => userStore.settings)

function runCookieDependencies() {
  utilsStore.runCookieDependencies()
}
function onFullscreenChange() {
  userX.settings.visual.fullScreenActive = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>