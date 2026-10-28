<template>
  <div class="control-remote-view">
    <h1>Control Remoto</h1>
    <p>Conectado a la sala: <strong>{{ roomCode }}</strong></p>
    <p>Usa el reproductor de abajo para controlar la música.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomCode = ref(route.params.roomCode)
</script>

<style scoped>
.control-remote-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 20px;
  text-align: center;
}
</style>