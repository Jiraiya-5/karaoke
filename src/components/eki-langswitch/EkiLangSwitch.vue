<template>
  <va-dropdown close-on-click-outside :auto-placement="true" stick-to-edges :offset="[15, 0]">
    <template #anchor>
      <div class="lang-switch" :title="$t('config.languageChange')">
        <fa-icon icon="fa-solid fa-language" class="lang-icon" />
        <p class="label">{{ currentLocale.toUpperCase() }}</p>
      </div>
    </template>

    <div class="ekimodal">
      <div
        v-for="l in switchable"
        :key="l.val"
        :title="$t('config.languageChangeTo', { lang: $t(l.label) })"
        class="option"
        @click="changeLang(l.val)"
      >
        {{ $t(l.label) }}
        <div class="lang-code">{{ l.val.toUpperCase() }}</div>
      </div>
    </div>
  </va-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '@/plugins/i18n'
import { useUserStore } from '@/stores/user'

const userX = useUserStore()
const i18nLocale = useI18n()

const currentLocale = computed(() => i18n.global.locale.value)

const availableLocales = computed(() => {
  // i18n.global.availableLocales puede ser un array o un objeto
  const locales = i18n.global.availableLocales
  if (Array.isArray(locales)) return locales
  if (typeof locales === 'object' && locales !== null) return Object.keys(locales)
  return ['es', 'en']
})

const switchable = computed(() => {
  const locales = availableLocales.value || []
  return locales
    .filter((val) => val !== currentLocale.value)
    .map((val) => ({
      val,
      label: `languages.${val}`
    }))
})

function changeLang(lang) {
  userX.settings.language.default = lang
  i18n.global.locale.value = lang
  localStorage.setItem('app-language', lang)
}
</script>

<style scoped lang="scss" src="./langswitcher.scss"></style>