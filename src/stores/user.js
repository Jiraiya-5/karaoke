import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

// ===== CONFIGURACIÓN POR DEFECTO =====
const defaultSettings = {
  visual: {
    playerPosition: 'Abajo',        // 'Arriba' | 'Abajo'
    fullScreenActive: false,
    showQueue: false,
    showSala: false,
    showCustomMessage: false,
    customMessage: ''
  },
  bgVideo: 'original',              // 'original' | 'particles' | 'stars' | 'mistic' | 'campfire' | 'none'
  functionallity: {
    showCalification: true,
    recordModeActive: false
  },
  font: {
    fontTheme: 'Estilo 1',          // 'Estilo 1' | 'Estilo 2' | 'Estilo 3'
    fontStyle: 'MAYÚSCULAS'         // 'MAYÚSCULAS' | 'minúsculas'
  },
  karaoke: {
    showAllLyric: false
  },
  language: {
    default: 'es'                   // 'es' | 'en'
  }
}

// ===== STORE =====
export const useUserStore = defineStore('user', () => {
  // ===== ESTADO =====
  const apiUser = ref(JSON.parse(localStorage.getItem('ekiAppUser') || 'null'))
  const firebaseUser = ref(null)
  const settings = ref(
    JSON.parse(localStorage.getItem('ekiAppUserConfig') || 'null') ||
    JSON.parse(JSON.stringify(defaultSettings)) // deep clone
  )
  const isPitchActive = ref(false)
  const localSongs = ref([])
  const downloadProgress = ref(0)

  // 👇 NUEVOS
  const availableUpdates = ref({
    packages: [] // estructura: [{ purchaseButton: { message: {es, en}, link, external } }]
  })
  const crumbDetail = ref('')

  // ===== COMPUTED =====
  const isLoggedIn = computed(() => !!apiUser.value)
  const isSubscribed = computed(() => apiUser.value?.isSubscribed || false)

  const cryptoKey = computed(() =>
    apiUser.value?.key || 'n{;M{6<v2^[H!Q}!'
  )

  const tokens = computed(() => {
  console.log('apiUser.value:', apiUser.value) // 👈 Verifica qué contiene
  return {
    token: apiUser.value?.token || null,
    refreshToken: apiUser.value?.refreshToken || null
  }
})

  const themeStyle = computed(() => {
    switch (settings.value.font.fontTheme) {
      case 'Estilo 2': return 'color-2'
      case 'Estilo 3': return 'color-3'
      default: return 'color-1'
    }
  })

  const fontStyle = computed(() => {
    switch (settings.value.font.fontStyle) {
      case 'minúsculas': return 'minus'
      default: return 'mayus'
    }
  })

  // ===== PERSISTENCIA AUTOMÁTICA DE SETTINGS =====
  // Cada vez que cambie `settings`, lo guarda en localStorage.
  // Esto evita tener que llamar a setUserSettings manualmente.
  watch(
    settings,
    (newVal) => {
      localStorage.setItem('ekiAppUserConfig', JSON.stringify(newVal))
    },
    { deep: true }
  )

  // ===== ACCIONES =====

  function setApiUser(user) {
    apiUser.value = user
    if (user) {
      localStorage.setItem('ekiAppUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('ekiAppUser')
    }
  }

  function logout() {
  // ... código existente ...
  localStorage.removeItem('ekiControlRoom') // 👈 Borrar sala al cerrar sesión
}

  function setUserSettings(newSettings) {
    // Merge profundo (shallow merge es peligroso)
    settings.value = deepMerge(settings.value, newSettings)
  }

  function setSetting(path, value) {
    // Útil para: setSetting('visual.showQueue', true)
    const keys = path.split('.')
    let obj = settings.value
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = value
  }

  function switchShortQueue() {
    settings.value.visual.showQueue = !settings.value.visual.showQueue
  }

  function cleanConfig() {
    localStorage.removeItem('ekiAppUserConfig')
    settings.value = JSON.parse(JSON.stringify(defaultSettings))
    isPitchActive.value = false
  }

  async function requestFullScreen() {
  try {
    if (!document.fullscreenElement) {
      // 👇 Pedir pantalla completa
      await document.documentElement.requestFullscreen()
      settings.value.visual.fullScreenActive = true
    } else {
      // 👇 Salir de pantalla completa
      await document.exitFullscreen()
      settings.value.visual.fullScreenActive = false
    }
  } catch (e) {
    console.error('Error al cambiar pantalla completa:', e)
    // Si falla el navegador, al menos alternamos el estado visual
    settings.value.visual.fullScreenActive = !settings.value.visual.fullScreenActive
  }
}

  function updateUserIsSubscribed(value) {
    if (apiUser.value) {
      apiUser.value.isSubscribed = value
      localStorage.setItem('ekiAppUser', JSON.stringify(apiUser.value))
    }
  }

  // 👇 NUEVA: carga las ofertas disponibles
  async function fetchAvailableUpdates() {
    try {
      // 👇 AJUSTA ESTO a tu API real
      // const { useRequesterStore } = await import('./requester')
      // const requesterX = useRequesterStore()
      // const res = await requesterX.Get({ route: '/available-updates', withAuth: true })
      // availableUpdates.value = res.data

      // Por ahora, dejamos un ejemplo vacío
      availableUpdates.value = { packages: [] }
    } catch (e) {
      console.error('Error fetching available updates:', e)
      availableUpdates.value = { packages: [] }
    }
  }

  // ===== HELPERS =====
  function deepMerge(target, source) {
    const output = { ...target }
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        output[key] = deepMerge(target[key] || {}, source[key])
      } else {
        output[key] = source[key]
      }
    }
    return output
  }

  // ===== RETURN =====
  return {
    // estado
    apiUser, firebaseUser, settings, isPitchActive,
    localSongs, downloadProgress,
    availableUpdates, crumbDetail,

    // computed
    isLoggedIn, isSubscribed, cryptoKey, tokens,
    themeStyle, fontStyle,

    // acciones
    setApiUser, setUserSettings, setSetting,
    switchShortQueue, cleanConfig, requestFullScreen,
    updateUserIsSubscribed, fetchAvailableUpdates,
    me
  }
  // Añadir a stores/user.js

async function me() {
  if (!isLoggedIn.value) return null
  try {
    const { useRequesterStore } = await import('./requester')
    const requesterX = useRequesterStore()
    const { data, error } = await requesterX.Get({ route: '/me', withAuth: true })
    if (!error && data?.user) {
      apiUser.value = { ...apiUser.value, ...data.user }
      localStorage.setItem('ekiAppUser', JSON.stringify(apiUser.value))
      return data.user
    }
  } catch (e) {
    console.error('[user.me]', e)
  }
  return null
}

// Añadir al return:
// me
})