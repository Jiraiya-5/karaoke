<template>
  <div class="form-container">
    <VaForm class="form" @submit.prevent="register">
      <img class="main-icon" width="150" height="150" :src="ekiLogo" alt="ekilogo.webp" />
      <div class="info-text">Crea tu cuenta</div>

      <div class="form-group">
        <div class="form-label">Nombre *</div>
        <VaInput v-model="name" preset="solid" placeholder="Ingresa tu nombre" />
      </div>

      <div class="form-group">
        <div class="form-label">Email *</div>
        <VaInput v-model="email" type="email" preset="solid" placeholder="Ingresa tu email" />
      </div>

      <div class="form-group">
        <div class="form-label">Contraseña *</div>
        <VaInput v-model="password" type="password" preset="solid" placeholder="Ingresa tu contraseña" />
      </div>

      <VaButton type="submit" color="complementary" :loading="loading" style="width: 60%">
        Registrarse
      </VaButton>

      <RouterLink class="small-link" :to="{ name: 'login' }" style="margin-top: 15px">
        Ya tengo una cuenta
      </RouterLink>
    </VaForm>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import ekiLogo from '@/assets/ekiLogo.webp'

const router = useRouter()
const userStore = useUserStore()
const utilsStore = useUtilsStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function register() {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
    })
    const data = await response.json()
    if (response.ok) {
      userStore.setApiUser(data)
      router.push({ name: 'home' })
    } else {
      utilsStore.setNotif({
        title: 'auth.register',
        message: data.msg || 'error.something',
        type: 'error'
      })
    }
  } catch (e) {
    utilsStore.deffaultError()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--eki-bg-color);
}
.form {
  background-color: var(--eki-primary-color);
  width: 450px;
  max-width: 95%;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
}
.form .form-group { width: 85%; margin: 5px 0; }
.form .form-group .form-label { font-size: 13px; font-weight: 600; padding-bottom: 7px; color: #fff; }
.form .info-text { text-align: center; margin: 20px 0; font-weight: 700; color: #fff; }
.form .small-link { color: #fff; text-decoration: underline; }
</style>