<template>
  <div class="eki-fullscreen" :class="{ 'show-bars': !playerX.playing || showConfig || showEffects || isHovered }"
    @mousemove="showControlsTemporarily" @touchstart.passive="showControlsTemporarily"
    @click="showControlsTemporarily">
    
    <EkiShortQueue customIdentifier="fs"></EkiShortQueue>
    <EkiCustomMessage></EkiCustomMessage>

    <!-- 👇 AÑADIR ESTO: El componente de letras y video -->
    <EkiLyrics />
    
    <!-- HEADER -->
    <div class="head" :class="{
      'add-space-multi': userX.settings.visual.showQueue && userX.settings.visual.showCustomMessage,
      'add-space': userX.settings.visual.showQueue || userX.settings.visual.showCustomMessage
    }">
      <!-- Izquierda: Canción -->
      <div class="head-left">
        <EkiNextSong fullscreen :showSala="userX.settings.visual.showSala"></EkiNextSong>
      </div>

      <!-- Derecha: Configuración -->
      <div class="head-right">
        <va-dropdown :modelValue="showConfig" :stateful="false" @clickOutside="showConfig = false"
          :auto-placement="true" stickToEdges :offset="[10, 0]">
          <template #anchor>
            <va-button icon="msr-settings" color="font" plain size="large" @click="showConfig = !showConfig"></va-button>
          </template>
          <div class="fullscreen-modal">
            <EkiConfigs @closeConfig="showConfig = false" />
          </div>
        </va-dropdown>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="foot">
      <div class="progress">
        <va-slider v-model="songControl" :disabled="!playerX.playing" :readonly="!playerX.playing"
          @drag-start="preventUpdate()" @drag-end="continueUpdate()" :min="0" horizontal :max="100"
          color="secondary" track-color="border">
        </va-slider>
      </div>

      <div class="controls left">
        <va-button id="pause-play" :aria-label='$t("song.pausePlay")' :loading="playerX.loading"
          :title="$t('song.pausePlay')" color="font" plain @click="playerX.pausePlay()"
          :icon="`msr-${playerX.playing ? 'pause' : 'play_arrow'}`" size="large"></va-button>

        <va-button id="skip-prev" :aria-label='$t("song.prev")' :title="$t('song.prev')"
          @click="playerX.skip('prev')" icon="msr-skip_previous" color="font" plain size="large"
          :disabled="playerX.reproducedQueue.length === 0"></va-button>

        <va-button id="skip-next" :aria-label='$t("song.next")' :title="$t('song.next')"
          @click="playerX.skip('next')" icon="msr-skip_next" color="font" plain size="large"
          :disabled="playerX.queue.length === 0"></va-button>

        <div ref="volControlElement">
          <va-slider class="volume-control" :class="{ visible: showVol }" v-model="volumeControl" :min="0"
            horizontal :max="100" color="secondary" track-color="border" :title="$t('control.songVolume')">
            <template #prepend>
              <va-icon :name="`msr-volume_${volIcon}`" color="font" plain size="large"
                @click="showVol = !showVol"></va-icon>
            </template>
          </va-slider>
        </div>

        <div class="time">{{ currentTime }} / {{ totalTime }}</div>
      </div>

      <div class="controls right">
        <va-button id="activate-voice" :aria-label='$t("control.activateVozGuia")'
          :disabled="playerX.blockSecondAudio || !playerX.playing || !playerX.currentSong?.hasVoice"
          :title="playerX.blockSecondAudio ? $t('error.voiceGuideDevice') : (playerX.isSongVoiceActive ? $t('control.deactivateVozGuia') : $t('control.activateVozGuia'))"
          @click="playerX.pausePlayVoice();" preset="secondary"
          :color="playerX.isSongVoiceActive ? 'secondary' : 'font'" plain size="large"
          icon="msr-voice_selection">
        </va-button>

        <va-dropdown :modelValue="showEffects" :stateful="false" @clickOutside="showEffects = false"
          :auto-placement="true" stickToEdges :offset="[30, -5]">
          <template #anchor>
            <va-button icon="msr-mood" color="font" plain size="large" @click="showEffects = !showEffects"></va-button>
          </template>
          <div class="fullscreen-modal effects-modal">
            <EkiEffects showEffects fullscreen @closeEffects="showEffects = false" />
          </div>
        </va-dropdown>

        <va-button icon="msr-fullscreen_exit" color="font" plain size="large" @click="userX.requestFullScreen()"></va-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import EkiLyrics from "@/components/eki-lyrics/EkiLyrics.vue";
import EkiEffects from "@/components/eki-effects/EkiEffects.vue";
import EkiShortQueue from "@/components/eki-shortqueue/EkiShortQueue.vue";
import EkiConfigs from "@/components/eki-configs/EkiConfigs.vue";
import EkiNextSong from "@/components/eki-nextsong/EkiNextSong.vue";
import EkiCustomMessage from "@/components/eki-custom-message/EkiCustomMessage.vue";
import { usePlayerStore } from '@/stores/player';
import { useUserStore } from "@/stores/user";
import { useTimeFormat } from "@/composables/useTimeFormat";
import { useClickOutside } from "@/composables/useClickOutside";

import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';

const { currentTime, totalTime } = useTimeFormat();
const playerX = usePlayerStore();
const userX = useUserStore();

const songControl = ref(0);
const prevent = ref(false);
const showVol = ref(false);
const showEffects = ref(false);
const showConfig = ref(false);
const volumeControl = ref(1);
const volControlElement = ref();
const isHovered = ref(false);

let mouseMoveTimeout = null;

useClickOutside(volControlElement, () => {
  showVol.value = false;
});

onMounted(() => {
  volumeControl.value = playerX.volume * 100;
  songControl.value = playerX.songProgress;
  showControlsTemporarily();
});

onBeforeUnmount(() => {
  clearTimeout(mouseMoveTimeout);
});

watch(volumeControl, (newVol) => {
  playerX.changeVolume(newVol / 100);
});

watch(() => playerX.volume, (newVol) => {
  volumeControl.value = newVol * 100;
});

const volIcon = computed(() => {
  if (volumeControl.value > 50) return 'up';
  if (volumeControl.value === 0) return 'off';
  return 'down';
});

watch(() => playerX.songProgress, (newProgress) => {
  if (!prevent.value) {
    songControl.value = newProgress;
  }
});

function preventUpdate() {
  if (playerX.playing) prevent.value = true;
}

function continueUpdate() {
  playerX.seek(songControl.value);
  prevent.value = false;
}

function showControlsTemporarily() {
  isHovered.value = true;
  clearTimeout(mouseMoveTimeout);
  mouseMoveTimeout = setTimeout(() => {
    isHovered.value = false;
  }, 2000);
}
</script>

<style scoped lang="scss" src="./fullscreen.scss"></style>