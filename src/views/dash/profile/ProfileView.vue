<template>
  <div class="eki-content">
    <!-- Banner del usuario -->
    <div class="detail-banner">
      <div class="banner-img">
        <va-image
          class="img"
          :src="user?.photo_url || defaultAvatar"
          lazy
        />
      </div>
      <div class="banner-text">
        <div class="user-title">{{ user?.fullname || user?.display_name || 'Usuario' }}</div>
        <div class="user-email">{{ user?.email }}</div>
        <div class="app-version">Ecuakaraoke v{{ appVersion }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <va-tabs v-model="currentTab" class="eki-tabs" color="secondary">
      <va-tab name="profile.data">
        <template #default>
          <fa-icon icon="fa-solid fa-id-card" class="tab-icon" />
          {{ $t('profile.data') }}
        </template>
      </va-tab>
      <va-tab name="profile.control">
        <template #default>
          <fa-icon icon="fa-solid fa-gamepad" class="tab-icon" />
          {{ $t('profile.control') }}
        </template>
      </va-tab>
      <va-tab name="profile.config">
        <template #default>
          <fa-icon icon="fa-solid fa-gear" class="tab-icon" />
          {{ $t('profile.config') }}
        </template>
      </va-tab>
      <va-tab name="profile.cookies">
        <template #default>
          <fa-icon icon="fa-solid fa-cookie" class="tab-icon" />
          {{ $t('profile.cookies') }}
        </template>
      </va-tab>
    </va-tabs>

    <!-- Tab: Mis datos -->
    <div v-if="currentTab === 'profile.data'" class="tab-content">
      <div class="profile-grid">
        <!-- Editar mi perfil -->
        <div class="profile-section">
          <h3 class="section-title">Editar mi perfil</h3>
          
          <div class="form-group">
            <label>Nombre de sala personalizado</label>
            <div class="input-row">
              <va-input v-model="customRoom" placeholder="ej. Salón principal, Sala VIP 2" />
              <va-button color="primary" @click="saveRoom">Guardar</va-button>
            </div>
            <small class="help-text">Se guarda solo en este dispositivo. Identifica esta sala física.</small>
          </div>

          <div class="form-group">
            <label>Email *</label>
            <va-input v-model="form.email" disabled />
          </div>

          <div class="form-group">
            <label>Nombre *</label>
            <va-input v-model="form.fullname" />
          </div>

          <div class="form-group">
            <label>CI</label>
            <va-input v-model="form.dni" placeholder="Ingresa tu CI" />
          </div>

          <div class="form-group">
            <label>Fecha de nacimiento</label>
            <va-input v-model="form.birthdate" type="date" />
          </div>

          <div class="form-group">
            <label>Celular</label>
            <va-input v-model="form.phone" placeholder="Ingresa tu número de celular" />
          </div>

          <va-button color="primary" @click="saveProfile">Guardar</va-button>
        </div>

        <!-- Cambiar contraseña -->
        <div class="profile-section">
          <h3 class="section-title">Cambiar mi contraseña</h3>
          <p class="alert-text">
            Alerta: Enviaremos un link de recuperación de contraseña y cerraremos las sesiones activas en este y todos los dispositivos. Presiona Enviar para continuar.
          </p>
          <va-button color="primary" @click="recoverPassword">Enviar</va-button>
        </div>

        <!-- Mi plan -->
        <div class="profile-section">
          <h3 class="section-title">Mi plan</h3>
          <div v-if="!userStore.isSubscribed" class="no-plan">
            <p>No tienes un plan activo, compra una para acceder a todas las funcionalidades.</p>
            <va-button color="primary" :to="{ name: 'planUpgrade' }">Suscribirme</va-button>
          </div>
          <div v-else class="active-plan">
            <p class="success-text">✅ Tienes un plan activo</p>
            <va-button color="secondary" :to="{ name: 'planUpgrade' }">Ver planes</va-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Control remoto -->
    <div v-if="currentTab === 'profile.control'" class="tab-content">
      <EkiControlQR />
    </div>

    <!-- Tab: Configuración -->
    <div v-if="currentTab === 'profile.config'" class="tab-content">
      <div class="config-grid">
        <!-- Visuales -->
        <div class="config-section">
          <h3 class="section-title">Visuales</h3>
          
          <div class="config-item">
            <div class="config-label">
              <span>Video de Fondo <span class="badge">NUEVO</span></span>
            </div>
            <va-select v-model="settings.bgVideo" :options="videoOptions" />
          </div>

          <div class="config-item">
            <div class="config-label">Posición de la letra</div>
            <va-select v-model="settings.visual.playerPosition" :options="['Arriba', 'Abajo']" />
          </div>

          <div class="config-item">
            <span class="config-label">Mostrar canciones en espera</span>
            <va-switch v-model="settings.visual.showQueue" color="secondary" />
          </div>

          <div class="config-item">
            <span class="config-label">Mostrar número de sala</span>
            <va-switch v-model="settings.visual.showSala" color="secondary" />
          </div>

          <div class="config-item">
            <span class="config-label">Mostrar mensaje personalizado</span>
            <va-switch v-model="settings.visual.showCustomMessage" color="secondary" />
          </div>
        </div>

        <!-- Funcionalidades -->
        <div class="config-section">
          <h3 class="section-title">Funcionalidades</h3>
          
          <div class="config-item">
            <span class="config-label">Modo grabación <span class="badge">BETA</span></span>
            <va-switch v-model="settings.functionallity.recordModeActive" color="secondary" />
          </div>

          <div class="config-item">
            <span class="config-label">Mostrar calificación</span>
            <va-switch v-model="settings.functionallity.showCalification" color="secondary" />
          </div>

          <div class="config-item">
            <span class="config-label">Modificar tono <span class="badge">BETA</span></span>
            <va-switch v-model="userStore.isPitchActive" color="secondary" />
          </div>
        </div>

        <!-- Fuente -->
        <div class="config-section">
          <h3 class="section-title">Fuente</h3>
          
          <div class="config-item">
            <div class="config-label">Cambiar tema</div>
            <va-select v-model="settings.font.fontTheme" :options="['Estilo 1', 'Estilo 2', 'Estilo 3']" />
          </div>

          <div class="config-item">
            <div class="config-label">Cambiar estilo</div>
            <va-select v-model="settings.font.fontStyle" :options="['MAYÚSCULAS', 'minúsculas']" />
          </div>

          <div class="example-text" :class="`${userStore.fontStyle} ${userStore.themeStyle}`">
            EJEMPLO
          </div>
        </div>
      </div>

      <div class="config-grid mt-4">
        <!-- Karaoke -->
        <div class="config-section">
          <h3 class="section-title">Karaoke</h3>
          <div class="config-item">
            <span class="config-label">Mostrar letra completa</span>
            <va-switch v-model="settings.karaoke.showAllLyric" color="secondary" />
          </div>
        </div>

        <!-- Sonido -->
        <div class="config-section">
          <h3 class="section-title">Sonido</h3>
          <div class="config-item">
            <span class="config-label">Volumen principal</span>
            <va-slider v-model="volume" :min="0" :max="100" color="secondary" />
          </div>
        </div>

        <!-- Idioma -->
        <div class="config-section">
          <h3 class="section-title">Idioma</h3>
          <div class="config-item">
            <div class="config-label">Preferencia de idioma</div>
            <va-select v-model="currentLocale" :options="localeOptions" />
          </div>
        </div>
      </div>

      <div class="save-config">
        <va-button color="primary" size="large" @click="saveSettings">Guardar</va-button>
      </div>
    </div>

    <!-- Tab: Cookies -->
    <div v-if="currentTab === 'profile.cookies'" class="tab-content">
      <h3 class="section-title">Cookies de rendimiento</h3>
      <p class="cookies-text">
        Nos permite analizar datos de visitas y tráfico, de esta forma podemos mejorar el rendimiento de nuestro sitio.
      </p>
      <va-switch v-model="cookiesEnabled" color="secondary" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'
import { useRequesterStore } from '@/stores/requester'
import { useUtilsStore } from '@/stores/utils'
import EkiControlQR from '@/components/profile/EkiControlQR.vue'

const route = useRoute()
const userStore = useUserStore()
const playerX = usePlayerStore()
const requesterX = useRequesterStore()
const utilsX = useUtilsStore()
const { locale } = useI18n()

// Tabs
const currentTab = ref(route.query.tab || 'profile.data')

// Usuario
const user = computed(() => userStore.apiUser)
const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="%23333"/><circle cx="75" cy="55" r="25" fill="%23666"/><ellipse cx="75" cy="120" rx="45" ry="35" fill="%23666"/></svg>'
const appVersion = '26.10.08'

// Formulario
const form = ref({
  email: user.value?.email || '',
  fullname: user.value?.fullname || '',
  dni: user.value?.dni || '',
  birthdate: user.value?.birthdate || '',
  phone: user.value?.phone || ''
})

// Sala personalizada
const customRoom = ref(localStorage.getItem('eki_custom_room') || '')

// Configuración (referencia directa al store)
const settings = computed(() => userStore.settings)

// Video options
const videoOptions = ['original', 'particles', 'stars', 'mistic', 'campfire', 'none']

// Volumen
const volume = computed({
  get: () => playerX.volume * 100,
  set: (val) => playerX.changeVolume(val / 100)
})

// Idioma
const currentLocale = computed({
  get: () => locale.value,
  set: (val) => {
    locale.value = val
    userStore.settings.language.default = val
    localStorage.setItem('app-language', val)
  }
})
const localeOptions = [
  { text: 'Español', value: 'es' },
  { text: 'Inglés', value: 'en' }
]

// Cookies
const cookiesEnabled = ref(localStorage.getItem('cookies_performance') === 'true')

watch(cookiesEnabled, (val) => {
  localStorage.setItem('cookies_performance', val ? 'true' : 'false')
})

// Guardar
function saveRoom() {
  localStorage.setItem('eki_custom_room', customRoom.value)
  utilsX.setNotif({ title: 'success', message: 'Sala guardada', type: 'success' })
}

async function saveProfile() {
  try {
    await requesterX.Put({
      route: '/update-profile',
      withAuth: true,
      body: form.value
    })
    utilsX.setNotif({ title: 'success', message: 'Perfil actualizado', type: 'success' })
  } catch (e) {
    utilsX.setNotif({ title: 'error', message: 'Error al actualizar', type: 'error' })
  }
}

async function saveSettings() {
  try {
    await requesterX.Post({
      route: '/update-setting',
      withAuth: true,
      body: settings.value
    })
    utilsX.setNotif({ title: 'success', message: 'Configuración guardada', type: 'success' })
  } catch (e) {
    utilsX.setNotif({ title: 'error', message: 'Error al guardar', type: 'error' })
  }
}

function recoverPassword() {
  utilsX.setNotif({
    title: 'success',
    message: 'Se ha enviado un correo de recuperación',
    type: 'success'
  })
}

onMounted(() => {
  if (route.query.tab) {
    currentTab.value = route.query.tab
  }
})
</script>

<style scoped>
.eki-content {
  padding: 20px;
  min-height: 100vh;
}

/* Banner del usuario */
.detail-banner {
  display: flex;
  align-items: center;
  gap: 30px;
  padding-bottom: 30px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--eki-border-color);
}
.banner-img {
  width: 125px;
  height: 125px;
  border-radius: 8px;
  overflow: hidden;
  background: #333;
}
.banner-img .img {
  width: 100%;
  height: 100%;
}
.banner-text .user-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--eki-font-color);
}
.banner-text .user-email {
  font-size: 16px;
  opacity: 0.7;
  margin-top: 5px;
}
.banner-text .app-version {
  font-size: 12px;
  color: var(--eki-warning-color);
  font-style: italic;
  margin-top: 10px;
}

/* Tabs */
.eki-tabs {
  margin-bottom: 30px;
}
.tab-icon {
  margin-right: 8px;
}

/* Contenido del tab */
.tab-content {
  padding: 20px 0;
}

/* Mis datos */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
}
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--eki-font-color);
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 13px;
  color: var(--eki-complementary-color);
  font-weight: 600;
}
.input-row {
  display: flex;
  gap: 10px;
}
.help-text {
  font-size: 11px;
  opacity: 0.6;
}
.alert-text {
  font-size: 13px;
  color: var(--eki-complementary-color);
  line-height: 1.5;
}
.no-plan {
  text-align: center;
  padding: 20px;
  background: var(--eki-border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}
.no-plan p {
  color: var(--eki-warning-color);
  font-weight: 600;
}
.success-text {
  color: var(--eki-success-color);
  font-weight: 600;
  font-size: 18px;
}

/* Configuración */
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
}
.config-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding: 5px 0;
}
.config-label {
  font-size: 14px;
  color: var(--eki-complementary-color);
  font-weight: 600;
}
.badge {
  font-size: 10px;
  background: var(--eki-warning-color);
  color: #000;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 5px;
}
.example-text {
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  margin-top: 20px;
}
.example-text.minus { text-transform: lowercase; }
.example-text.mayus { text-transform: uppercase; }
.example-text.color-1 { color: var(--eki-secondary-color); }
.example-text.color-2 { color: var(--eki-complementary-color); }
.example-text.color-3 { color: var(--eki-danger-color); }

.save-config {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Cookies */
.cookies-text {
  font-size: 14px;
  color: var(--eki-complementary-color);
  margin-bottom: 20px;
  max-width: 600px;
  line-height: 1.6;
}

.mt-4 { margin-top: 40px; }
</style>