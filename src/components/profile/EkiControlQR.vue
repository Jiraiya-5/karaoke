<template>
  <div class="qr-main">
    <h2 v-if="!fullscreen" class="qr-title">{{ $t('qr.scan') }}</h2>

    <div class="qr-id" :class="{ fullscreen }">
      <span>{{ $t('qr.id') }}</span>
      <va-button color="border" @click="copyId" :disabled="loading">
        <h2 class="room">{{ controlId ?? '------' }}</h2>
      </va-button>
      <va-button v-if="!fullscreen" preset="plain" icon="msr-cached" color="complementary" @click="regenQr" :disabled="loading" />
    </div>

    <div class="qr-container">
      <div class="loading" v-show="loading">
        <va-progress-circle indeterminate size="80px" color="warning" />
      </div>
      
      <a :href="qrHref" target="_blank" class="qrcode" :class="{ visible: !loading }">
        <qr-code 
          v-if="qrHref" 
          :value="qrHref" 
          class="qrcode__qr" 
          tag="img" 
          width="250px" 
          height="250px"
          :options="{
            errorCorrectionLevel: 'Q',
            margin: 0,
            color: {
              dark: '#c3c4f7',
              light: '#16151a'
            },
            width: 500,
          }" 
          @ready="qrReady"
        />
      </a>

      <va-button v-if="!fullscreen" @click="copyLink" :disabled="loading" color="primary">
        <fa-icon icon="fa-solid fa-copy" class="mr-2" />
        {{ $t('qr.copy') }}
      </va-button>
    </div>

    <p v-if="!fullscreen" class="qr-notes">{{ $t('qr.info') }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRequesterStore } from '@/stores/requester'
import { useSocketStore } from '@/stores/socket'
import { useUtilsStore } from '@/stores/utils'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  fullscreen: { type: Boolean, default: false }
})

const requesterX = useRequesterStore()
const socketX = useSocketStore()
const utilsX = useUtilsStore()
const userX = useUserStore()

const qrHref = ref(null)
const controlId = ref(null)
const loading = ref(true)

function qrReady() {
  loading.value = false
}

async function generateQR() {
  try {
    // 👇 1. Buscar si ya hay una sala guardada
    const savedRoom = localStorage.getItem('ekiControlRoom')
    
    if (savedRoom) {
      console.log('🔑 Usando sala guardada:', savedRoom)
      controlId.value = savedRoom
      qrHref.value = `http://192.168.10.191:5173/control/${savedRoom}`
      socketX.connectControl(savedRoom)
      return
    }

    // 2. Si no hay, generar una nueva
    console.log('🔑 Generando nueva sala...')
    const { data, error } = await requesterX.Get({ 
      route: '/control/get-access', 
      withAuth: true 
    })
    
    if (error) {
      console.error('❌ Error del backend:', error)
      return
    }
    
    console.log('🔑 Sala generada:', data.id)
    
    controlId.value = data.id
    qrHref.value = `http://192.168.10.191:5173/control/${data.id}`
    
    // 👇 Guardar la sala en localStorage
    localStorage.setItem('ekiControlRoom', data.id)
    
    socketX.connectControl(data.id)
  } catch (error) {
    console.error('❌ Error generando QR:', error)
  }
}

onMounted(generateQR)

async function copyLink() {
  await navigator.clipboard.writeText(qrHref.value)
  utilsX.setNotif({ title: 'success', message: 'qr.copied', type: 'success' })
}

async function regenQr() {
  try {
    loading.value = true
    
    // 👇 1. Borrar la sala guardada
    localStorage.removeItem('ekiControlRoom')
    
    // 2. Desconectar el socket actual
    socketX.disconnectControl()
    
    // 3. Generar una nueva
    const { data, error } = await requesterX.Get({ 
      route: '/control/reset-room', 
      withAuth: true 
    })
    
    if (error) {
      console.error('❌ Error del backend:', error)
      return
    }
    
    console.log('🔄 Nueva sala generada:', data.id)
    
    controlId.value = data.id
    qrHref.value = `http://192.168.10.191:5173/control/${data.id}`
    
    // 4. Guardar la nueva sala
    localStorage.setItem('ekiControlRoom', data.id)
    
    // 5. Reconectar
    socketX.connectControl(data.id)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function copyId() {
  await navigator.clipboard.writeText(controlId.value)
  utilsX.setNotif({ title: 'success', message: 'qr.copied-id', type: 'success' })
}
</script>

<style scoped>
.qr-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.qr-title {
  font-size: 24px;
  font-weight: bold;
}

.qr-id {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room {
  font-size: 32px;
  font-weight: 900;
  color: var(--eki-secondary-color);
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.qrcode {
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.qrcode.visible {
  opacity: 1;
}

.mr-2 {
  margin-right: 8px;
}
</style>