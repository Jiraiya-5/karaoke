<template>
  <div class="form-container">
    <VaForm class="form" @submit.prevent="login">
      <img class="main-icon" width="150" height="150" :src="ekiLogo" alt="ekilogo.webp" />
      <div class="info-text">{{ $t('auth.loginMsg') }}</div>

      <div class="form-group">
        <div class="form-label">{{ $t('auth.emailLabel') }} *</div>
        <VaInput
          v-model="email"
          class="form-inputs"
          preset="solid"
          type="email"
          placeholder="Ingresa tu email"
        />
      </div>

      <div class="form-group">
        <div class="form-label">{{ $t('auth.passwordLabel') }} *</div>
        <VaInput
          v-model="password"
          class="form-inputs"
          preset="solid"
          type="password"
          placeholder="Ingresa tu contraseña"
        />
      </div>

      <div class="options">
        <RouterLink class="small-link" :to="{ name: 'register' }">
          {{ $t('auth.register') }}
        </RouterLink>
        <RouterLink class="small-link" :to="{ name: 'register' }">
          {{ $t('auth.recover') }}
        </RouterLink>
      </div>

      <VaButton
        type="submit"
        color="complementary"
        :loading="loading"
        style="width: 60%"
      >
        {{ $t('auth.login') }}
      </VaButton>
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

const email = ref('')
const password = ref('')
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    // TODO: Reemplaza esto con tu lógica real de autenticación
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await response.json()
    if (response.ok) {
      userStore.setApiUser(data)
      utilsStore.setNotif({
        title: 'auth.loggingIn',
        message: 'auth.loginSuccess',
        type: 'success'
      })
      router.push({ name: 'home' })
    } else {
      utilsStore.setNotif({
        title: 'auth.loggingIn',
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
  align-items: center;
  gap: 5px;
}

.form .main-icon {
  width: 150px;
  height: 150px;
  margin: 5px;
}

.form .info-text {
  text-align: center;
  margin: 20px 0;
  font-weight: 700;
  padding: 0 20px;
  font-size: 18px;
  color: #fff;
}

.form .form-group {
  width: 85%;
  margin: 5px 0;
}

.form .form-group .form-label {
  font-size: 13px;
  font-weight: 600;
  padding-bottom: 7px;
  color: #fff;
}

.form .options {
  margin: 5px 0 20px;
  width: 85%;
  display: flex;
  justify-content: space-between;
}

.form .options .small-link {
  color: #fff;
  font-style: italic;
  text-decoration: underline;
  transition: all 0.3s ease;
  font-size: 13px;
}

.form .options .small-link:hover {
  color: var(--eki-complementary-color);
}
</style>