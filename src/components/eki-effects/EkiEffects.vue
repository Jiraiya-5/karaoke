<template>
  <div
    class="effects-container"
    :class="{ visible: showEffects, fullscreen: fullscreen }"
  >
    <va-scroll-container vertical size="small">
      <!-- Botón de volver (solo si NO es fullscreen) -->
      <div v-if="!fullscreen" class="expander section" @click="$emit('closeEffects')">
        <div class="head">
          <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
          <div>{{ $t("effect.simpleLabel") }}</div>
        </div>
      </div>

      <!-- Acordeón: Efectos de sonido -->
      <VaCollapse
        v-model="showSoundEffects"
        class="min-w-96"
        :header="$t('effect.label')"
        :title="$t(`effect.${showSoundEffects ? 'close' : 'open'}`)"
      >
        <template #header="{ value, attrs, iconAttrs, text }">
          <div v-bind="attrs" class="expander">
            <div class="head">
              <VaIcon class="head-icon" name="msr-graphic_eq" size="20px" />
              <div>{{ text }}</div>
            </div>
            <VaIcon
              :name="value ? 'msr-expand_less' : 'msr-expand_more'"
              v-bind="iconAttrs"
              size="28px"
            />
          </div>
        </template>

        <template #body>
          <div class="effects">
            <div
              class="effect"
              v-for="(effect, index) in effects"
              :key="effect.short"
              :title="$t('playEffect', { name: effect.name })"
              @click="playEffect(index)"
            >
              <div class="dropdown">
                <fa-icon class="effect-icon" :icon="['fa-solid', effect.icon]" />
                <span class="mobile-label">{{ effect.name }}</span>
              </div>
            </div>
          </div>
        </template>
      </VaCollapse>

      <!-- Acordeón: Reacciones -->
      <VaCollapse
        v-model="showReactions"
        class="min-w-96"
        :header="$t('react.label')"
        :title="$t(`react.${showReactions ? 'close' : 'open'}`)"
      >
        <template #header="{ value, attrs, iconAttrs, text }">
          <div v-bind="attrs" class="expander">
            <div class="head">
              <VaIcon class="head-icon" name="msr-mood" size="20px" />
              <div>{{ text }}</div>
            </div>
            <VaIcon
              :name="value ? 'msr-expand_less' : 'msr-expand_more'"
              v-bind="iconAttrs"
              size="28px"
            />
          </div>
        </template>

        <template #body>
          <div class="effects">
            <div
              class="effect"
              v-for="reaction in reactions"
              :key="reaction"
              @click="playReaction(reaction)"
            >
              <div class="dropdown">
                <div class="effect-icon">{{ reaction }}</div>
              </div>
            </div>
          </div>
        </template>
      </VaCollapse>
    </va-scroll-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { useUtilsStore } from '@/stores/utils'

const playerX = usePlayerStore()
const utilsX = useUtilsStore()

const props = defineProps({
  showEffects: { type: Boolean, required: true },
  fullscreen: { type: Boolean, default: false }
})

const emit = defineEmits(['closeEffects'])

const showSoundEffects = ref(false)
const showReactions = ref(false)

const effects = ref([
  { icon: 'hands-clapping', short: 'Ctrl+A', url: '1.MP3', name: 'Aplausos', shortCode: 'KeyA' },
  { icon: 'people-line', short: 'Ctrl+B', url: '2.mp3', name: 'Euforia', shortCode: 'KeyB' },
  { icon: 'hands-bubbles', short: 'Ctrl+C', url: '3.mp3', name: 'Grito', shortCode: 'KeyC' },
  { icon: 'skull-crossbones', short: 'Ctrl+D', url: '4.mp3', name: 'Abucheo', shortCode: 'KeyD' },
  { icon: 'democrat', short: 'Ctrl+E', url: '5.mp3', name: 'Burro', shortCode: 'KeyE' },
  { icon: 'face-laugh-beam', short: 'Ctrl+F', url: '6.mp3', name: 'Risa', shortCode: 'KeyF' },
  { icon: 'face-laugh-squint', short: 'Ctrl+G', url: '7.mp3', name: 'Risa Burlona', shortCode: 'KeyG' },
  { icon: 'face-frown', short: 'Ctrl+H', url: '8.mp3', name: 'Mal', shortCode: 'KeyH' },
  { icon: 'face-grimace', short: 'Ctrl+I', url: '9.mp3', name: 'Mal 2', shortCode: 'KeyI' },
  { icon: 'thumbs-up', short: 'Ctrl+J', url: 'bien.wav', name: 'Bien', shortCode: 'KeyJ' },
  { icon: 'award', short: 'Ctrl+K', url: 'cien.wav', name: 'Cien', shortCode: 'KeyK' },
  { icon: 'stopwatch', short: 'Ctrl+L', url: 'conteo.wav', name: 'Conteo', shortCode: 'KeyL' },
  { icon: 'bell-concierge', short: 'Ctrl+M', url: 'Intro.wav', name: 'Intro', shortCode: 'KeyM' },
  { icon: 'thumbs-down', short: 'Ctrl+Z', url: 'mal.wav', name: 'Mal 3', shortCode: 'KeyZ' },
  { icon: 'face-smile-wink', short: 'Ctrl+O', url: 'normal.wav', name: 'Normal', shortCode: 'KeyO' },
  { icon: 'hand-peace', short: 'Ctrl+Y', url: 'regular.wav', name: 'Regular', shortCode: 'KeyY' }
])

const reactions = ref(['💯', '🥳', '🤮', '❤️', '😍', '🤩', '🤯', '🙉', '🔥', '👎', '👍'])

function playEffect(index) {
  playerX.playEffect(index)
}

function playReaction(reaction) {
  utilsX.playReaction(reaction)
}

onMounted(() => {
  playerX.setUpEffects(effects.value)
})
</script>

<style scoped lang="scss" src="./effects.scss"></style>