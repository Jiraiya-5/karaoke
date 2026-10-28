<template>
  <div
    class="dashbody"
    :class="{
      'top-space': topSpace,
      fullscreen: userX.settings.visual.fullScreenActive
    }"
  >
    <va-scroll-container
      id="eki-body-content"
      size="small"
      vertical
      class="body-content-container"
    >
      <EkiShortQueue />
      <EkiBreadcrumbs />
      <EkiErrorState v-if="utilsX.errorState" />
      <router-view />
      <EkiFooter />
      <EkiLyrics />
    </va-scroll-container>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'
import { useUtilsStore } from '@/stores/utils'

import EkiShortQueue from '@/components/eki-shortqueue/EkiShortQueue.vue'
import EkiBreadcrumbs from '@/components/eki-breadcrumbs/EkiBreadcrumbs.vue'
import EkiErrorState from '@/components/eki-errorstate/EkiErrorState.vue'
import EkiFooter from '@/components/eki-footer/EkiFooter.vue'
import EkiLyrics from '@/components/eki-lyrics/EkiLyrics.vue'

const userX = useUserStore()
const playerX = usePlayerStore()
const utilsX = useUtilsStore()
const route = useRoute()

const topSpace = computed(() => {
  if (userX.settings.visual.playerPosition === 'Arriba') {
    if (playerX.playing) return true
  } else {
    if (userX.settings.visual.showQueue) return true
  }
  return false
})

watch(
  [() => route.name, () => route.query],
  () => {
    const bodyDiv = document.getElementById('eki-body-content')
    if (bodyDiv) bodyDiv.scrollTop = 0
  }
)
</script>

<style scoped lang="scss" src="./dashbody.scss"></style>