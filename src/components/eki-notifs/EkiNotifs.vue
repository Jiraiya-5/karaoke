<template>
  <div class="eki-notif" :class="[notif.type, notif.position, visibility]">
    <fa-icon v-if="notif.type === 'info'" icon="fa-solid fa-circle-info" class="notif-icon" />
    <fa-icon v-if="notif.type === 'warning'" icon="fa-solid fa-triangle-exclamation" class="notif-icon" />
    <fa-icon v-if="notif.type === 'error'" icon="fa-solid fa-circle-xmark" class="notif-icon" />
    <fa-icon v-if="notif.type === 'success'" icon="fa-solid fa-circle-check" class="notif-icon" />

    <div class="notif-info">
      <div class="title">{{ translateSafe(notif.title) }}</div>
      <div class="message">{{ translateSafe(notif.message) }}</div>
    </div>

    <fa-icon
      icon="fa-solid fa-circle-xmark"
      class="notif-closer"
      @click="utilsStore.closeNotif"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUtilsStore } from '@/stores/utils'

const utilsStore = useUtilsStore()
const { t, te } = useI18n() // 👈 te() comprueba si la clave existe

const notif = computed(() => utilsStore.notif)
const visibility = computed(() => (notif.value.isVisible ? 'visible' : 'invisible'))

function translateSafe(text) {
  if (!text) return ''
  
  // Si la clave existe en el diccionario, la traduce
  if (te(text)) {
    return t(text)
  }
  
  // Si no existe, devuelve el texto tal cual
  return text
}
</script>

<style scoped>
.eki-notif {
  position: fixed;
  width: 400px;
  height: auto;
  background: #fff;
  z-index: 70;
  min-height: 60px;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.5s ease;
}

.eki-notif .notif-icon {
  text-align: center;
  line-height: 35px;
  width: 60px;
  height: 35px;
  font-size: 35px;
}

.eki-notif .notif-info {
  width: calc(100% - 100px);
}

.eki-notif .notif-info .title {
  font-size: 14px;
  font-weight: 600;
  margin: 10px 0 3px;
  text-transform: uppercase;
}

.eki-notif .notif-info .message {
  color: #000;
  margin-bottom: 10px;
}

.eki-notif .notif-closer {
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.3);
}

.eki-notif .notif-closer:hover {
  font-size: 25px;
}

.eki-notif.info { color: #4480ae; border-top: 3px solid #4480ae; background: #cde8f6; }
.eki-notif.warning { color: #ffc823; border-top: 3px solid #ffc823; background: #f8f3d7; }
.eki-notif.error { color: #b3302d; border-top: 3px solid #b3302d; background: #ecc8c5; }
.eki-notif.success { color: #5a7152; border-top: 3px solid #5a7152; background: #dff3d6; }

.eki-notif.top-center {
  top: 15px;
  left: 50%;
  border-radius: 2px 2px 15px 15px;
  transform: translateX(-50%);
}
.eki-notif.top-center.invisible { top: -25px; }
.eki-notif.visible { opacity: 1; }
.eki-notif.invisible { opacity: 0; transform: scale(0); }

@media screen and (max-width: 420px) {
  .eki-notif { width: 95%; }
}
</style>