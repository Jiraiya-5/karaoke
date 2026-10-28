<template>
  <div class="footer-container">
    <div class="footer-nav">
      <div class="section">
        <RouterLink :to="{ name: 'home' }" title="Ir al Inicio">
          <img width="150" height="150" :src="ekiLogo" alt="ekilogo.webp" />
        </RouterLink>
      </div>
      <div class="section">
        <div class="title">ekiu-karaoke</div>
        <div class="links-list">
          <RouterLink class="foot-link" :to="{ name: 'profile' }">Mi Perfil</RouterLink>
          <RouterLink class="foot-link" :to="{ name: 'profile' }">Configuración</RouterLink>
          <RouterLink class="foot-link" :to="{ name: 'profile' }">Control Remoto</RouterLink>
        </div>
      </div>
      <div class="section">
        <div class="title">Buscar</div>
        <div class="links-list">
          <RouterLink class="foot-link" :to="{ name: 'songs' }">Canciones</RouterLink>
          <RouterLink class="foot-link" :to="{ name: 'genres' }">Géneros</RouterLink>
          <RouterLink class="foot-link" :to="{ name: 'artists' }">Artistas</RouterLink>
        </div>
      </div>
      <div class="section">
        <div class="title">Ayuda</div>
        <div class="links-list">
          <a class="foot-link" href="#" target="_blank">Ver tutorial de uso</a>
          <RouterLink class="foot-link" :to="{ name: 'home' }">Reportar problema</RouterLink>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="credits">© ekiu-karaoke I., {{ currentYear }}. Creado por EKI.</div>
    </div>
  </div>
</template>

<script setup>
import ekiLogo from '@/assets/ekiLogo.webp'
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer-container {
  background-color: var(--eki-border-color);
  width: 100%;
  min-height: 100px;
  padding: 25px 25px 0;
  margin-top: 100px;
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 30px 0;
}

.footer-nav .section {
  width: 25%;
}

.footer-nav .section .title {
  font-weight: 600;
}

.footer-nav .section .links-list {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
}

.footer-nav .section .links-list .foot-link {
  padding: 5px 0;
  margin: 5px 0;
  text-decoration: none;
  color: var(--eki-font-color);
  transition: all 0.3s ease;
  opacity: 0.65;
  cursor: pointer;
}

.footer-nav .section .links-list .foot-link:hover {
  opacity: 1;
  color: var(--eki-secondary-color);
}

.footer {
  border-top: 1px solid rgb(94, 94, 94);
  padding: 25px 0;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}

.footer .credits {
  opacity: 0.65;
  font-size: 15px;
}

@media screen and (max-width: 900px) {
  .footer-nav .section { width: 35%; margin-bottom: 50px; }
}

@media screen and (max-width: 450px) {
  .footer-nav .section { width: 100%; text-align: center; }
}
</style>