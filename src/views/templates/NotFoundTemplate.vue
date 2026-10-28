<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <RouterLink :to="{ name: 'home' }">Volver al inicio</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}
</style>