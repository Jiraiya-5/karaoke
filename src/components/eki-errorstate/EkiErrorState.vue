<template>
  <div class="error-msg">
    <VaProgressCircle indeterminate thickness="0.2" size="150px" color="warning">
      <img src="/images/ek-logos/pwa-192x192.png" width="100px" style="border-radius: 50%" />
    </VaProgressCircle>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUtilsStore } from '@/stores/utils'

const utilsStore = useUtilsStore()

onMounted(() => {
  setTimeout(() => {
    utilsStore.errorState = false
  }, 2000)
})
</script>

<style scoped>
.error-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
  height: 100%;
  background-color: #000;
  width: 100%;
  gap: 1.5rem;
  padding: 25px;
  position: absolute;
  z-index: 9;
  opacity: 0.6;

  .error-msg .error-title {
  color: var(--eki-warning-color);
  line-height: clamp(25px, 5vh, 4vw);
  font-size: clamp(16px, 4vh, 3vw);
  text-align: center;
}

.error-msg .error-title .error-icon {
  font-size: 50px;
  margin-top: 17vh;
}
}
</style>