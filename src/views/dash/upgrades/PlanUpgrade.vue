<template>
  <div class="plan-upgrade">
    <h1 class="title">Planes de suscripción</h1>

    <div class="plans-grid">
      <!-- Plan Básico -->
      <div class="plan-card">
        <h2>Básico</h2>
        <div class="price">$10 <span>/mes</span></div>
        <ul class="features">
          <li><fa-icon icon="fa-solid fa-check" /> 15 canciones</li>
          <li><fa-icon icon="fa-solid fa-check" /> 1 dispositivo</li>
          <li><fa-icon icon="fa-solid fa-check" /> Voz guía</li>
        </ul>
        <va-button color="primary" block @click="openCheckout('basic')">Suscribirme</va-button>
      </div>

      <!-- Plan Premium -->
      <div class="plan-card popular">
        <div class="badge-popular">Más popular</div>
        <h2>Premium</h2>
        <div class="price">$25 <span>/mes</span></div>
        <ul class="features">
          <li><fa-icon icon="fa-solid fa-check" /> 50 canciones</li>
          <li><fa-icon icon="fa-solid fa-check" /> 3 dispositivos</li>
          <li><fa-icon icon="fa-solid fa-check" /> Voz guía</li>
          <li><fa-icon icon="fa-solid fa-check" /> Sin publicidad</li>
        </ul>
        <va-button color="primary" block @click="openCheckout('premium')">Suscribirme</va-button>
      </div>

      <!-- Plan VIP -->
      <div class="plan-card">
        <h2>VIP</h2>
        <div class="price">$50 <span>/mes</span></div>
        <ul class="features">
          <li><fa-icon icon="fa-solid fa-check" /> Canciones ilimitadas</li>
          <li><fa-icon icon="fa-solid fa-check" /> 5 dispositivos</li>
          <li><fa-icon icon="fa-solid fa-check" /> Voz guía</li>
          <li><fa-icon icon="fa-solid fa-check" /> Sin publicidad</li>
          <li><fa-icon icon="fa-solid fa-check" /> Soporte prioritario</li>
        </ul>
        <va-button color="primary" block @click="openCheckout('vip')">Suscribirme</va-button>
      </div>
    </div>

    <!-- MODAL DE PAGO -->
    <va-modal
      v-model="showCheckout"
      :title="`Suscripción - Plan ${selectedPlan.toUpperCase()}`"
      hide-default-actions
      size="large"
      class="checkout-modal"
    >
      <div class="checkout-content">
        <div class="checkout-summary">
          <h3>Resumen de compra</h3>
          <p><strong>Plan:</strong> {{ selectedPlan }}</p>
          <p><strong>Email:</strong> {{ userX.apiUser?.email || 'No logueado' }}</p>
          <p><strong>Precio:</strong> ${{ planPrices[selectedPlan] }} / mes</p>
        </div>

        <div class="checkout-iframe-container">
          <iframe
            v-if="checkoutUrl"
            :src="checkoutUrl"
            class="checkout-iframe"
            frameborder="0"
            allow="payment"
          ></iframe>
        </div>

        <div class="checkout-actions">
          <va-button preset="plain" @click="showCheckout = false">Cancelar</va-button>
          <va-button color="primary" @click="simulatePayment">Confirmar pago (Simulado)</va-button>
        </div>
      </div>
    </va-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import { useRequesterStore } from '@/stores/requester'

const userX = useUserStore()
const utilsX = useUtilsStore()
const requesterX = useRequesterStore()

const showCheckout = ref(false)
const selectedPlan = ref('basic')
const checkoutUrl = ref('')

const planPrices = {
  basic: 10,
  premium: 25,
  vip: 50
}

function openCheckout(planName) {
  selectedPlan.value = planName
  const baseUrl = import.meta.env.VITE_PURCHASE_LINK || 'http://localhost/eki.ecuakaraoke.com.ec/eki-promo/'
  
  // Construimos la URL pasándole parámetros para que la pasarela sepa qué plan cobrar
  checkoutUrl.value = `${baseUrl}?plan=${planName}&email=${encodeURIComponent(userX.apiUser?.email || '')}`
  
  // Mostramos el modal
  showCheckout.value = true
}

async function simulatePayment() {
  try {
    // Llamar al backend para guardar la suscripción
    const res = await requesterX.Post({
      route: '/subscribe',
      withAuth: true,
      body: { plan: selectedPlan.value }
    })

    if (res.status === 200) {
      // Actualizar el estado local
      userX.updateUserIsSubscribed(true)
      
      showCheckout.value = false
      utilsX.setNotif({
        title: '¡Felicidades!',
        message: `Te has suscrito al plan ${selectedPlan.value.toUpperCase()}.`,
        type: 'success',
        timeVisible: 5
      })
    } else {
      throw new Error('Error en el servidor')
    }
  } catch (e) {
    console.error(e)
    utilsX.setNotif({ 
      title: 'Error', 
      message: 'No se pudo procesar el pago', 
      type: 'error' 
    })
  }
}
</script>

<style scoped>
.plan-upgrade { padding: 30px 20px; max-width: 1200px; margin: 0 auto; }
.title { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 40px; }
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
.plan-card { background: var(--eki-border-color); border-radius: 16px; padding: 30px; position: relative; display: flex; flex-direction: column; gap: 20px; border: 2px solid transparent; transition: transform 0.3s ease; }
.plan-card:hover { transform: translateY(-5px); }
.plan-card.popular { border-color: var(--eki-secondary-color); background: linear-gradient(135deg, #6022C6 0%, #8960FC 100%); }
.badge-popular { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--eki-warning-color); color: #000; font-weight: 700; padding: 4px 15px; border-radius: 20px; font-size: 12px; }
.plan-card h2 { font-size: 24px; text-align: center; margin: 0; }
.price { font-size: 40px; font-weight: 900; text-align: center; }
.price span { font-size: 16px; font-weight: 400; opacity: 0.7; }
.features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.features li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.features li fa-icon { color: var(--eki-success-color); }

/* ESTILOS DEL MODAL DE PAGO */
.checkout-modal { background: var(--eki-bg-color); }
.checkout-content { display: flex; flex-direction: column; gap: 20px; width: 100%; }
.checkout-summary { background: var(--eki-border-color); padding: 15px; border-radius: 8px; }
.checkout-summary h3 { margin-top: 0; color: var(--eki-secondary-color); }
.checkout-summary p { margin: 5px 0; font-size: 14px; }
.checkout-iframe-container { width: 100%; height: 400px; background: #fff; border-radius: 8px; overflow: hidden; }
.checkout-iframe { width: 100%; height: 100%; }
.checkout-actions { display: flex; justify-content: flex-end; gap: 10px; }
</style>