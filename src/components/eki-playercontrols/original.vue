<template>
  <div
    ref="playerControlsElement"
    class="controls-container"
    tabindex="0"
    :class="{
      opened: playerOpened,
    }"
  >
    <div
      class="mobile-control"
      tabindex="0"
      :title="$t('control.openClose')"
      @click="playerOpened = !playerOpened"
    >
      <fa-icon class="icon" icon="fa-solid fa-music"></fa-icon
      >{{ $t("control.player") }}
    </div>

    <EkiEffects
      v-if="userX.isLoggedIn"
      :showEffects="showEffects"
      @closeEffects="showEffects = false"
    ></EkiEffects>

    <div class="song-img">
      <va-image
        v-if="playerX.currentSong != null"
        class="img"
        :src="getImage(playerX.currentSong.gen.img)"
        lazy
      ></va-image>
      <fa-icon v-else class="def-icon" icon="fa-solid fa-music"></fa-icon>
      <div
        class="song-num"
        :class="{
          show: playerX.currentSong,
        }"
      >
        {{ playerX.currentSong?.num }}
      </div>

      <div v-if="userX.isPitchActive" class="tone-control" :class="{ disabled: !playerX.canPitchShift }">
        <va-button
          :disabled="playerX.semitone >= 2"
          icon="fa-solid fa-caret-up"
          size="small"
          color="complementary"
          preset="secondary"
          @click="playerX.semitone < 2 && (playerX.semitone += 0.01)"
        ></va-button>
        <va-button
          icon="fa-solid fa-microphone-lines"
          @click="playerX.semitone = 1"
          size="small"
          color="font"
          preset="secondary"
          plain
          class="tone-icon"
        >
          <span v-if="playerX.semitone != 1" class="value">{{
            Number.parseFloat(playerX.semitone).toFixed(2)
          }}</span>
        </va-button>
        <va-button
          :disabled="playerX.semitone <= 0.6"
          icon="fa-solid fa-caret-down"
          size="small"
          color="complementary"
          preset="secondary"
          @click="playerX.semitone > 0.6 && (playerX.semitone -= 0.01)"
        ></va-button>
      </div>
    </div>

    <EkiNextSong></EkiNextSong>

    <div class="player-controls">
      <div class="left">
        <va-button
          id="reaction"
          :aria-label="$t('effect.open')"
          class="player-icon"
          icon="msr-mood"
          color="font"
          plain
          size="medium"
          :title="$t('effect.open')"
          @click="preventAction() && (showEffects = !showEffects)"
        ></va-button>
      </div>
      <div class="main">
        <va-button
          id="activate-voice"
          class="player-icon"
          :aria-label="$t('control.activateVozGuia')"
          :disabled="playerX.blockSecondAudio || !playerX.playing || !playerX.currentSong?.hasVoice"
          :title="
            playerX.blockSecondAudio
              ? $t('error.voiceGuideDevice')
              : playerX.isSongVoiceActive
              ? $t('control.deactivateVozGuia')
              : $t('control.activateVozGuia')
          "
          @click="playerX.pausePlayVoice()"
          preset="secondary"
          :color="playerX.isSongVoiceActive ? 'secondary' : 'font'"
          plain
          size="medium"
          icon="msr-voice_selection"
        >
        </va-button>
        <va-button
          id="skip-prev"
          :aria-label="$t('song.prev')"
          class="player-icon"
          :title="$t('song.prev')"
          @click="preventAction() && playerX.skip('prev')"
          icon="msr-skip_previous"
          color="font"
          plain
          size="medium"
          :disabled="playerX.reproducedQueue.length === 0"
        ></va-button>
        <va-button
          id="pause-play"
          :aria-label="$t('song.pausePlay')"
          :loading="playerX.loading"
          plain
          class="player-icon main"
          :title="$t('song.pausePlay')"
          color="font"
          @click="preventAction() && playerX.pausePlay()"
          :icon="`msr-${playerX.playing ? 'pause' : 'play_arrow'}`"
          size="large"
        ></va-button>
        <va-button
          id="skip-next"
          :aria-label="$t('song.next')"
          class="player-icon"
          :title="$t('song.next')"
          @click="preventAction() && playerX.skip('next')"
          icon="msr-skip_next"
          color="font"
          plain
          size="medium"
          :disabled="playerX.queue.length === 0"
        ></va-button>
      </div>
      <div class="right">
        <va-button
          icon="msr-fullscreen"
          color="font"
          plain
          size="medium"
          :title="$t('screen.minMax')"
          @click="preventAction() && userX.requestFullScreen()"
        ></va-button>
      </div>
    </div>

    <div class="song-slider">
      <va-slider
        v-model="songControl"
        :readonly="!playerX.playing"
        @drag-start="preventUpdate()"
        @drag-end="continueUpdate()"
        :min="0"
        horizontal
        :max="100"
        color="secondary"
        track-color="border"
      >
        <template #append>
          <div class="time-info" @click="timeFormat = !timeFormat">
            {{ timeFormat ? currentTime : timeLeft }}
          </div>
        </template>
      </va-slider>
    </div>

    <div class="extra-control">
      <div class="vol-controller">
        <va-slider
          class="vol-slider"
          v-model="volumeControl"
          :min="0"
          horizontal
          :max="100"
          color="secondary"
          track-color="border"
          :title="$t('control.songVolume')"
        >
          <template #prepend>
            <va-button
              id="vol-control"
              :aria-label="$t('control.songVolume')"
              @click="muteUnmute()"
              :icon="`msr-volume_${volIcon}`"
              color="font"
              plain
              size="medium"
            ></va-button>
          </template>
        </va-slider>
      </div>
      <fa-icon
        class="player-icon"
        :title="$t('queue.show')"
        @click="
          preventAction() &&
            (userX.settings.visual.showQueue = !userX.settings.visual.showQueue)
        "
        icon="fa-solid fa-list-ol"
      ></fa-icon>
    </div>
  </div>
</template>

<script setup>
import EkiEffects from "@/components/eki-effects/EkiEffects.vue";
import { ref, onMounted, computed, watch } from "vue";
import { useTimeFormat } from "@/composables/useTimeFormat";
import { usePreventers } from "@/composables/usePreventers";
import { useClickOutside } from "@/composables/useClickOutside";
import { usePlayerStore } from "@/stores/player";
import { useUserStore } from "@/stores/user";
import EkiNextSong from "@/components/eki-nextsong/EkiNextSong.vue";

const userX = useUserStore();
const playerX = usePlayerStore();
const { preventAction } = usePreventers();
const { timeLeft, currentTime } = useTimeFormat();

const volumeControl = ref(1);

const songControl = ref(0);
const prevent = ref(false);
const timeFormat = ref(true);
const lastVolume = ref(null);
const showEffects = ref(false);
const playerOpened = ref(false);
const playerControlsElement = ref();
const imageLoaded = ref(null);
useClickOutside(playerControlsElement, () => {
  playerOpened.value = false;
});

watch(
  () => playerX.songProgress,
  (newProgress) => {
    if (!prevent.value) {
      songControl.value = newProgress;
    }
  }
);

const volIcon = computed(() => {
  if (volumeControl.value > 50) {
    return "up";
  } else if (volumeControl.value === 0) {
    return "off";
  } else if (volumeControl.value <= 50) {
    return "down";
  }
});

onMounted(() => {
  volumeControl.value = playerX.volume * 100;
});

watch(volumeControl, (newVol) => {
  playerX.changeVolume(newVol / 100);
});

watch(
  () => playerX.volume,
  (newVol) => {
    volumeControl.value = newVol * 100;
  }
);

function muteUnmute() {
  if (lastVolume.value === null) {
    lastVolume.value = volumeControl.value / 100;
    playerX.changeVolume(0);
  } else {
    playerX.changeVolume(lastVolume.value);
    lastVolume.value = null;
  }
}

function preventUpdate() {
  if (playerX.playing) {
    prevent.value = true;
  }
}

function continueUpdate() {
  playerX.seek(songControl.value);
  prevent.value = false;
}
function getImage(image){
  imageLoaded.value = imageLoaded.value?imageLoaded.value:navigator.onLine?image:`/images/offline-default/${Math.floor(Math.random() * 3)}.webp`;
  return imageLoaded.value;
}
</script>

<style scoped lang="scss" src="./playercontrols.scss"></style>
