import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUtilsStore = defineStore('utils', () => {
  const notif = ref({
    title: '', message: '', type: 'info',
    isVisible: false, timeVisible: 3, position: 'top-center',
    showTimeout: null, closeTimeout: null
  })
  const isMenuOpened = ref(false)
  const showScore = ref(false)
  const showCookieBanner = ref(
    localStorage.getItem('cookies_consent') !== 'true'
  )
  const cookiesAllowed = ref(localStorage.getItem('cookies_consent') === 'true')
  const currentReaction = ref(null)
  const reactionsCount = ref([])
  const errorState = ref(false)

  function setNotif({ title, message, type = 'info', timeVisible = 3, position = 'top-center' }) {
    if (notif.value.isVisible) closeNotif()
    notif.value = {
      title, message, type, timeVisible, position,
      isVisible: false,
      showTimeout: setTimeout(() => { notif.value.isVisible = true }, 100),
      closeTimeout: setTimeout(() => { closeNotif() }, timeVisible * 1000)
    }
  }

  function closeNotif() {
    notif.value.isVisible = false
    clearTimeout(notif.value.closeTimeout)
    clearTimeout(notif.value.showTimeout)
  }

  function deffaultError() {
    setNotif({ title: 'error.single', message: 'error.something', type: 'error', timeVisible: 5 })
  }

  function loginFirst() {
    setNotif({ title: 'error.warning', message: 'error.loginFirst', type: 'warning', timeVisible: 5 })
  }

  function playReaction(emoji) {
    const idx = reactionsCount.value.findIndex(r => r.emoji === emoji)
    if (idx !== -1) {
      reactionsCount.value[idx].count++
      currentReaction.value = reactionsCount.value[idx]
    } else {
      reactionsCount.value.push({ emoji, count: 1 })
      currentReaction.value = { emoji, count: 1 }
    }
  }

  function runCookieDependencies() {
    localStorage.setItem('cookies_consent', 'true')
    cookiesAllowed.value = true
    showCookieBanner.value = false
  }

  return {
    notif, isMenuOpened, showScore, showCookieBanner, cookiesAllowed,
    currentReaction, reactionsCount, errorState,
    setNotif, closeNotif, deffaultError, loginFirst, playReaction,
    runCookieDependencies
  }
})