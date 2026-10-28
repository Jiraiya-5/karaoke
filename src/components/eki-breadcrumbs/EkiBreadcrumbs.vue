<template>
  <!-- Banner de nueva oferta de suscripción -->
  <va-alert
    v-if="availableUpdates.packages.length >= 2 && route.name !== 'planUpgrade'"
    color="error"
    closeable
    icon="fa-solid fa-circle-info"
    class="subscription-alert"
  >
    <template #close>
      <fa-icon class="modal-icon" icon="fa-solid fa-close" />
    </template>
    <div class="info">
      <div class="title">
        {{ availableUpdates.packages[1].purchaseButton.message[locale] }}
      </div>
      <va-button
        v-if="availableUpdates.packages[1].purchaseButton.external"
        id="new-offer-btn"
        :aria-label="$t('upgrade.viewOffer')"
        class="action-btn"
        color="warning"
        size="small"
        :href="`${availableUpdates.packages[1].purchaseButton.link}/?src=ekiapp&liame=${apiUser.user.email}&eman=${apiUser.user.fullname}`"
        target="_blank"
      >
        {{ $t('upgrade.viewOffer') }}
      </va-button>
      <va-button
        v-else
        id="new-offer-btn"
        :aria-label="$t('upgrade.viewOffer')"
        class="action-btn"
        color="warning"
        :to="{ name: 'planUpgrade' }"
        size="small"
      >
        {{ $t('upgrade.viewOffer') }}
      </va-button>
    </div>
  </va-alert>

  <!-- Banner de instalación PWA -->
  <va-alert
    v-if="showInstallPrompt && isSubscribed && isLoggedIn"
    color="complementary"
    icon="fa-solid fa-download"
    class="subscription-alert"
  >
    <div class="info">
      <div class="title">{{ $t('installBanner') }}</div>
      <va-button
        id="install"
        :loading="installing"
        :aria-label="$t('install')"
        class="action-btn"
        color="contrast"
        size="small"
        @click="installApp"
      >
        {{ $t('install') }}
      </va-button>
    </div>
  </va-alert>

  <!-- Banner de actualización -->
  <va-alert
    v-else-if="needRefresh && isSubscribed && isLoggedIn"
    color="warning"
    icon="fa-solid fa-download"
    class="subscription-alert"
  >
    <div class="info">
      <div class="title">{{ $t('updateBanner') }}</div>
      <va-button
        id="install"
        :loading="installing"
        :aria-label="$t('update')"
        class="action-btn"
        color="black"
        size="small"
        @click="updateApp"
      >
        {{ $t('update') }}
      </va-button>
    </div>
  </va-alert>

  <!-- Alerta de sin suscripción -->
  <va-alert
    v-else-if="!isSubscribed && isLoggedIn && route.name !== 'finishOrder'"
    color="warning"
    icon="msr-warning"
    class="subscription-alert"
  >
    <div class="info">
      <div class="title">{{ $t('error.noSubscription') }}</div>
      <va-button
        id="subscribe"
        :aria-label="$t('subscribe')"
        class="action-btn"
        color="primary"
        href="http://localhost/eki.ecuakaraoke.com.ec/eki-promo/"
        target="_blank"
      >
        {{ $t('subscribe') }}
      </va-button>
    </div>
  </va-alert>

  <!-- Breadcrumbs -->
  <va-scroll-container
    v-if="route.meta.breadCrumb"
    class="eki-crumbs-container"
    horizontal
    size="small"
    color="secondary"
  >
    <va-breadcrumbs
      class="eki-crumbs"
      color="secondary"
      separatorColor="secondary"
      separator="•"
    >
      <va-breadcrumbs-item
        v-for="crumb in route.meta.breadCrumb"
        :key="crumb.label"
        :label="crumb.label === 'eki-item-detail'
          ? userStore.crumbDetail
          : $t(crumb.label)"
        :to="crumb.to ?? null"
        :title="crumb.to ? $t(crumb.title) : ''"
      />
    </va-breadcrumbs>
  </va-scroll-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'                              // 👈 NUEVO
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const route = useRoute()
const userStore = useUserStore()
const utilsStore = useUtilsStore()
const { locale } = useI18n()                                    // 👈 NUEVO

const {
  offlineReady,
  needRefresh,
  updateServiceWorker
} = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    // Opcional: setInterval para comprobar actualizaciones cada hora
  }
})

const showInstallPrompt = ref(false)
const installing = ref(false)
const deferredPrompt = ref(null)

const availableUpdates = computed(() => {
  return userStore.availableUpdates || { packages: [] }
})

const isSubscribed = computed(() => userStore.isSubscribed)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const apiUser = computed(() => userStore.apiUser)

// ===== PWA install =====
function onBeforeInstallPrompt(e) {
  e.preventDefault()
  deferredPrompt.value = e
  showInstallPrompt.value = true
}

function onAppInstalled() {
  showInstallPrompt.value = false
  deferredPrompt.value = null
}

async function installApp() {
  if (!deferredPrompt.value) return
  installing.value = true
  try {
    deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
  } catch (e) {
    console.error(e)
  } finally {
    installing.value = false
  }
}

async function updateApp() {
  installing.value = true
  try {
    await updateServiceWorker()
  } catch (e) {
    installing.value = false
  }
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)

  // 👇 NUEVO: cargar ofertas disponibles
  if (userStore.isLoggedIn) {
    userStore.fetchAvailableUpdates()
  }
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})
</script>

<style scoped>
.subscription-alert {
  padding: 0 15px;
}

.subscription-alert .info {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subscription-alert .info .title {
  font-size: 13px;
  font-style: italic;
}

.subscription-alert .info .action-btn {
  margin-bottom: 10px;
  min-width: max-content;
}

.eki-crumbs-container {
  width: 100%;
  height: 70px;
  padding: 30px 0;
}

.eki-crumbs-container .eki-crumbs {
  width: max-content;
  padding: 0 15px;
  height: 100%;
}

.eki-crumbs-container .eki-crumbs .va-breadcrumb-item--link:hover {
  opacity: 0.9;
}

.eki-crumbs-container .eki-crumbs .va-breadcrumbs__separator {
  padding: 0 10px;
}

@media screen and (max-width: 500px) {
  .subscription-alert .info {
    justify-content: center;
    flex-wrap: wrap;
  }
  .subscription-alert .info .title {
    width: 100%;
    text-align: center;
    margin: 10px 5px;
  }
}

@media screen and (min-width: 500px) {
  .action-btn {
    margin-top: 10px;
  }
}
</style>