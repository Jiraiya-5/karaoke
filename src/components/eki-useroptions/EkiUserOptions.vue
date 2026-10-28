<template>
  <VaDropdown
    close-on-click-outside
    :auto-placement="true"
    :stick-to-edges="true"
    :offset="[25, 0]"
  >
    <template #anchor>
      <VaButton
        class="user-icon"
        :title="$t('profile.options')"
        plain
        color="font"
      >
        <fa-icon class="icon" icon="fa-solid fa-user" />
      </VaButton>
    </template>

    <div class="ekimodal">
      <RouterLink
        v-if="!userStore.isLoggedIn"
        class="option"
        :title="$t('auth.login')"
        :to="{ name: 'login' }"
      >
        {{ $t('auth.login') }}
        <fa-icon class="modal-icon" icon="fa-solid fa-arrow-right-to-bracket" />
      </RouterLink>

      <RouterLink
        v-if="!userStore.isLoggedIn"
        class="option"
        :title="$t('auth.register')"
        :to="{ name: 'register' }"
      >
        {{ $t('auth.register') }}
        <fa-icon class="modal-icon" icon="fa-solid fa-pen-to-square" />
      </RouterLink>

      <RouterLink
        v-if="userStore.isLoggedIn"
        class="option"
        :title="$t('profile.goTo')"
        :to="{ name: 'profile' }"
      >
        {{ $t('profile.single') }}
        <fa-icon class="modal-icon" icon="fa-solid fa-user" />
      </RouterLink>

      <div
        v-if="userStore.isLoggedIn"
        class="option"
        :title="$t('auth.logout')"
        @click="logout"
      >
        {{ $t('auth.logout') }}
        <fa-icon class="modal-icon" icon="fa-solid fa-arrow-right-from-bracket" />
      </div>
    </div>
  </VaDropdown>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useUtilsStore } from '@/stores/utils'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const utilsStore = useUtilsStore()
const router = useRouter()

async function logout() {
  userStore.setApiUser(null)
  userStore.cleanConfig()
  utilsStore.setNotif({
    title: 'auth.loggingOut',
    message: 'auth.logoutSuccess',
    type: 'success'
  })
  router.push({ name: 'login' })
}
</script>

<style scoped>
.user-icon .icon {
  opacity: 0.8;
  font-size: 20px;
  transition: all 0.3s ease;
}

.user-icon:hover .icon {
  opacity: 1;
  color: var(--eki-secondary-color);
}

.ekimodal {
  background: var(--eki-black-color);
  width: 200px;
  height: auto;
}

.ekimodal .option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
  color: var(--eki-font-color);
  opacity: 0.65;
  font-weight: 400;
  cursor: pointer;
  font-size: 15px;
}

.ekimodal .option .modal-icon {
  transition: all 0.3s ease;
  width: 18px;
  height: 18px;
}

.ekimodal .option:hover {
  opacity: 1;
}

.ekimodal .option:hover .modal-icon {
  color: var(--eki-secondary-color);
}
</style>