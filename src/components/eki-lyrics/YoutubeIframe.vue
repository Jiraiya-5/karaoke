<template>
  <div ref="youtubeContainer" class="youtube-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  videoId: { type: String, required: true },
  playerVars: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['ready', 'state-change', 'error'])
const youtubeContainer = ref(null)
let player = null

function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT)
    // Si ya hay un script cargándose, esperamos
    if (window.onYouTubeIframeAPIReady) {
      const oldCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        oldCallback()
        resolve(window.YT)
      }
      return
    }
    window.onYouTubeIframeAPIReady = () => resolve(window.YT)
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
}

onMounted(async () => {
  const YT = await loadYouTubeAPI()
  player = new YT.Player(youtubeContainer.value, {
    width: '100%',
    height: '100%',
    videoId: props.videoId,
    playerVars: props.playerVars,
    events: {
      onReady: (e) => {
        console.log('YouTube Player listo')
        emit('ready', e)
      },
      onStateChange: (e) => emit('state-change', e),
      onError: (e) => {
        console.error('YouTube Player Error:', e.data)
        emit('error', e)
      }
    }
  })
})

onUnmounted(() => {
  if (player) player.destroy()
})

// Exponer la instancia y métodos
defineExpose({
  get instance() { return player },
  togglePlay() {
    if (!player) return
    const state = player.getPlayerState()
    if (state === 1) player.pauseVideo()
    else player.playVideo()
  }
})
</script>

<style scoped>
.youtube-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>