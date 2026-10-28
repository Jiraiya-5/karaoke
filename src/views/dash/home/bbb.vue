<template>
  <div class="home-view">
    <!-- Carrusel -->
    <div class="carousel">
      <div class="carousel-slide" v-for="(slide, index) in slides" :key="index" v-show="currentSlide === index">
        <img :src="slide.image" :alt="slide.title" />
        <div class="carousel-content">
          <h2 class="slide-title">{{ slide.title }}</h2>
          <p class="slide-subtitle">{{ slide.subtitle }}</p>
          <va-button v-if="slide.link" :to="slide.link" color="primary" size="large">
            {{ slide.buttonText }}
          </va-button>
        </div>
      </div>
      
      <!-- Controles del carrusel -->
      <button class="carousel-prev" @click="prevSlide">
        <fa-icon icon="fa-solid fa-chevron-left" />
      </button>
      <button class="carousel-next" @click="nextSlide">
        <fa-icon icon="fa-solid fa-chevron-right" />
      </button>
      
      <!-- Puntos de navegación -->
      <div class="carousel-dots">
        <span 
          v-for="(slide, index) in slides" 
          :key="index" 
          :class="{ active: currentSlide === index }"
          @click="currentSlide = index"
        ></span>
      </div>
    </div>

    <!-- Artistas Populares -->
    <section class="section">
      <h2 class="section-title">{{ $t('home.popularArtists') }}</h2>
      <div class="grid">
        <div 
          v-for="artist in artists" 
          :key="artist.id" 
          class="card"
          @click="goToArtist(artist.id)"
        >
          <div class="card-image">
            <img v-if="artist.image" :src="artist.image" :alt="artist.name" />
            <div v-else class="placeholder">
              <fa-icon icon="fa-solid fa-microphone" />
            </div>
            <div class="song-count">
              <fa-icon icon="fa-solid fa-list-ul" /> {{ artist.song_count }}
            </div>
          </div>
          <div class="card-name">{{ artist.name }}</div>
        </div>
      </div>
      <div class="see-all">
        <va-button :to="{ name: 'artistsList' }" color="primary" size="large">
          {{ $t('home.seeAll') }}
        </va-button>
      </div>
    </section>

    <!-- Géneros Populares -->
    <section class="section">
      <h2 class="section-title">{{ $t('home.popularGenres') }}</h2>
      <div class="grid">
        <div 
          v-for="genre in genres" 
          :key="genre.id" 
          class="card"
          @click="goToGenre(genre.id)"
        >
          <div class="card-image">
            <img v-if="genre.image" :src="genre.image" :alt="genre.name" />
            <div v-else class="placeholder">
              <fa-icon icon="fa-solid fa-music" />
            </div>
            <div class="song-count">
              <fa-icon icon="fa-solid fa-list-ul" /> {{ genre.song_count }}
            </div>
          </div>
          <div class="card-name">{{ genre.name }}</div>
        </div>
      </div>
      <div class="see-all">
        <va-button :to="{ name: 'genresList' }" color="primary" size="large">
          {{ $t('home.seeAll') }}
        </va-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRequesterStore } from '@/stores/requester'

const router = useRouter()
const requesterX = useRequesterStore()

const slides = ref([
  {
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80',
    title: 'Manejo desde otras pantallas',
    subtitle: 'Controla la aplicación desde otras pantallas, puedes configurar hasta 5 pantallas secundarias.',
    link: { name: 'planUpgrade' },
    buttonText: 'Conoce nuestros planes'
  },
  {
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    title: 'Canta con tus artistas favoritos',
    subtitle: 'Miles de canciones de todos los géneros, actualizadas cada semana.',
    link: { name: 'songsList' },
    buttonText: 'Ver catálogo'
  },
  {
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    title: 'Experiencia profesional',
    subtitle: 'Audio de alta calidad, letras sincronizadas y efectos especiales.',
    link: { name: 'planUpgrade' },
    buttonText: 'Ver planes'
  }
])

const currentSlide = ref(0)
const artists = ref([])
const genres = ref([])
let carouselInterval = null

onMounted(async () => {
  await loadArtists()
  await loadGenres()
  startCarousel()
})

async function loadArtists() {
  try {
    const res = await requesterX.Get({ route: '/get-artists' })
    artists.value = res.data
  } catch (e) {
    console.error('Error cargando artistas:', e)
  }
}

async function loadGenres() {
  try {
    const res = await requesterX.Get({ route: '/get-genres' })
    genres.value = res.data
  } catch (e) {
    console.error('Error cargando géneros:', e)
  }
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

function startCarousel() {
  carouselInterval = setInterval(nextSlide, 5000)
}

function goToArtist(id) {
  router.push({ name: 'artistDetail', params: { id } })
}

function goToGenre(id) {
  router.push({ name: 'genreDetail', params: { id } })
}
</script>

<style scoped>
.home-view {
  padding: 0 0 40px 0;
  color: var(--eki-font-color);
}

/* ===== CARRUSEL ===== */
.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 30px;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.5);
}

.carousel-content {
  position: absolute;
  bottom: 40px;
  left: 40px;
  max-width: 500px;
  color: #fff;
}

.slide-title {
  font-size: 38px;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.slide-subtitle {
  font-size: 18px;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.carousel-prev,
.carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.3s ease;
}

.carousel-prev { left: 20px; }
.carousel-next { right: 20px; }

.carousel-prev:hover,
.carousel-next:hover {
  background: rgba(137, 96, 252, 0.8);
}

.carousel-dots {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
}

.carousel-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dots span.active {
  background: #ffda6c;
  transform: scale(1.2);
}

/* ===== SECCIONES ===== */
.section {
  margin-bottom: 40px;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--eki-font-color);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: var(--eki-border-color);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--eki-bg-color);
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: var(--eki-secondary-color);
  background: linear-gradient(135deg, #6022C6 0%, #8960FC 100%);
}

.song-count {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-name {
  padding: 12px;
  font-weight: 600;
  font-size: 15px;
  text-align: center;
  color: var(--eki-font-color);
}

.see-all {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media screen and (max-width: 900px) {
  .carousel { height: 250px; }
  .slide-title { font-size: 24px; }
  .slide-subtitle { font-size: 14px; }
  .carousel-content { bottom: 20px; left: 20px; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; }
}
</style>