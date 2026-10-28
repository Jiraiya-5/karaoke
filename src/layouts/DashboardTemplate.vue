<template>
  <div class="eki-viewport">
    <EkiReactions />

    <EkiFullScreen v-if="settings.visual.fullScreenActive" />

    <!-- Se muestran SIEMPRE, igual que en la PC -->
    <EkiSideNav :class="{ hide: settings.visual.fullScreenActive, opened: isMenuOpened }" />
    <EkiTopNav :class="{ hide: settings.visual.fullScreenActive, opened: isMenuOpened }" />

    <EkiPlayerControls
      :class="{
        hide: settings.visual.fullScreenActive,
        'on-top': settings.visual.playerPosition === 'Arriba'
      }"
    />

    <EkiDashBody />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import EkiReactions from '@/components/eki-reactions/EkiReactions.vue'
import EkiFullScreen from '@/components/eki-fullscreen/EkiFullScreen.vue'
import EkiSideNav from '@/components/eki-sidenav/EkiSideNav.vue'
import EkiTopNav from '@/components/eki-topnav/EkiTopNav.vue'
import EkiPlayerControls from '@/components/eki-playercontrols/EkiPlayerControls.vue'
import EkiDashBody from '@/components/eki-dashbody/EkiDashBody.vue'
import { useRoute } from 'vue-router' // 👈 Asegúrate de importar

const route = useRoute()
const isControlRemote = computed(() => route.meta.isControlRemote === true)

const userStore = useUserStore()
const utilsStore = useUtilsStore()

const settings = computed(() => userStore.settings)
const isMenuOpened = computed(() => utilsStore.isMenuOpened)
</script>

<style scoped>
.eki-viewport {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--eki-bg-color);
}
</style>