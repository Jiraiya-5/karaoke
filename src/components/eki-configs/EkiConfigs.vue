<template>
  <div class="configs-container">
    <va-scroll-container vertical size="small">
      <template v-if="page === 'main'">
        <div class="expander section" @click="$emit('closeConfig')">
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
            <div>
              {{ $t("profile.config") }}
            </div>
          </div>
        </div>
        <div
          class="expander"
          @click="
            userX.settings.visual.showQueue = !userX.settings.visual.showQueue;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon
              class="head-icon"
              name="msr-format_list_numbered"
              size="20px"
            />
            <div>
              {{ $t("config.showQueue") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-show-queue"
            name="short-show-queue"
            v-model="userX.settings.visual.showQueue"
            readonly
            :title="$t('config.switch', { topic: $t('config.showQueue') })"
            color="secondary"
          />
        </div>



        <div
          class="expander"
          @click="
            userX.settings.visual.showSala = !userX.settings.visual.showSala;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon
              class="head-icon"
              name="fa-solid fa-users"
              size="20px"
            />
            <div>
              {{ $t("config.showSala") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-show-sala"
            name="short-show-sala"
            v-model="userX.settings.visual.showSala"
            readonly
            :title="$t('config.switch', { topic: $t('config.showSala') })"
            color="secondary"
          />
        </div>



        <div
          class="expander"
          @click="
            userX.settings.visual.showCustomMessage = !userX.settings.visual.showCustomMessage;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon
              class="head-icon"
              name="fa-solid fa-message"
              size="20px"
            />
            <div>
              {{ $t("config.showCustomMessage") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-show-custom"
            name="short-show-custom"
            v-model="userX.settings.visual.showCustomMessage"
            readonly
            :title="$t('config.switch', { topic: $t('config.showCustomMessage') })"
            color="secondary"
          />
        </div>



        <div
          class="expander"
          @click="
            userX.settings.karaoke.showAllLyric =
              !userX.settings.karaoke.showAllLyric;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon
              class="head-icon"
              name="msr-format_align_center"
              size="20px"
            />
            <div>
              {{ $t("config.showAllLyric") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-all-lyrics"
            name="short-all-lyrics"
            v-model="userX.settings.karaoke.showAllLyric"
            readonly
            :title="$t('config.switch', { topic: $t('config.showAllLyric') })"
            color="secondary"
          />
        </div>
        <div
          class="expander"
          @click="
            userX.settings.functionallity.showCalification =
              !userX.settings.functionallity.showCalification;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon class="head-icon" name="msr-trophy" size="20px" />
            <div>
              {{ $t("config.showScore") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-show-score"
            name="short-show-score"
            v-model="userX.settings.functionallity.showCalification"
            readonly
            :title="$t('config.switch', { topic: $t('config.showScore') })"
            color="secondary"
          />
        </div>
        <div
          class="expander"
          @click="userX.isPitchActive = !userX.isPitchActive"
        >
          <div class="head">
            <VaIcon class="head-icon" name="msr-replace_audio" size="20px" />
            <div>
              {{ $t("config.modifyTone") }}
            </div>
          </div>

          <va-switch
            size="small"
            id="short-show-score"
            name="short-show-score"
            v-model="userX.isPitchActive"
            readonly
            :title="$t('config.switch', { topic: $t('config.tone') })"
            color="secondary"
          />
        </div>
        <div
          v-if="userX.isPitchActive"
          class="expander"
          :class="{ disabled: !playerX.canPitchShift }"
          @click="page = 'tone'"
        >
          <div class="head">
            <VaIcon class="head-icon" name="msr-music_note" size="20px" />
            <div>
              {{ $t("config.tone") }}
            </div>
          </div>

          <VaIcon name="msr-chevron_right" size="20px" />
        </div>
        <div class="expander" @click="page = 'font'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-title" size="20px" />
            <div>
              {{ $t("config.font") }}
            </div>
          </div>

          <VaIcon name="msr-chevron_right" size="20px" />
        </div>
        <div class="expander" @click="page = 'video'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-movie" size="20px" />
            <div>
              {{ $t("config.bgVideo") }}
            </div>
          </div>

          <VaIcon name="msr-chevron_right" size="20px" />
        </div>
        <div class="expander" @click="page = 'qr'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-qr_code_2" size="20px" />
            <div>
              {{ $t("profile.control") }}
            </div>
          </div>

          <VaIcon name="msr-chevron_right" size="20px" />
        </div>
      </template>

      <template v-if="page === 'tone'">
        <div class="expander section" @click="page = 'main'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
            <div>
              {{ $t("config.tone") }}
            </div>
          </div>
        </div>

        <div class="expander subsection">
          {{ Number.parseFloat(playerX.semitone).toFixed(2) }}
        </div>

        <div class="expander" @click="playerX.semitone = 1">
          <div class="head">
            <VaIcon class="head-icon" name="msr-refresh" size="20px" />
            <div>
              {{ $t("config.restoreTone") }}
            </div>
          </div>
        </div>

        <div
          class="expander"
          :class="{ disabled: playerX.semitone >= 2 }"
          @click="playerX.semitone < 2 && (playerX.semitone += 0.01)"
        >
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_upward" size="20px" />
            <div>
              {{ $t("config.increaseTone") }}
            </div>
          </div>
        </div>

        <div
          class="expander"
          :class="{ disabled: playerX.semitone <= 0.6 }"
          @click="playerX.semitone > 0.6 && (playerX.semitone -= 0.01)"
        >
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_downward" size="20px" />
            <div>
              {{ $t("config.decreaseTone") }}
            </div>
          </div>
        </div>
      </template>

      <template v-if="page === 'font'">
        <div class="expander section" @click="page = 'main'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
            <div>
              {{ $t("config.font") }}
            </div>
          </div>
        </div>

        <div class="expander subsection">
          {{ $t("config.changeTheme") }}
        </div>
        <div
          class="expander"
          v-for="opt in fontThemes"
          @click="
            userX.settings.font.fontTheme = opt.value;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon
              class="head-icon"
              :class="opt.class"
              :name="opt.icon"
              size="20px"
            />
            <div>
              {{ $t(opt.label) }}
            </div>
          </div>

          <VaIcon
            v-if="userX.settings.font.fontTheme === opt.value"
            class="head-icon"
            name="fa-solid fa-check"
            size="20px"
          />
        </div>

        <div class="expander subsection">
          {{ $t("config.changeStyle") }}
        </div>
        <div
          class="expander"
          v-for="opt in fontStyles"
          @click="
            userX.settings.font.fontStyle = opt.value;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon class="head-icon" :name="opt.icon" size="20px" />
            <div>
              {{ $t(opt.label) }}
            </div>
          </div>

          <VaIcon
            v-if="userX.settings.font.fontStyle === opt.value"
            class="head-icon"
            name="fa-solid fa-check"
            size="20px"
          />
        </div>
      </template>

      <template v-if="page === 'video'">
        <div class="expander section" @click="page = 'main'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
            <div>
              {{ $t("config.bgVideo") }}
            </div>
          </div>
        </div>

        <div
          class="expander"
          v-for="opt in bgVideoOptions"
          @click="
            userX.settings.bgVideo = opt.value;
            saveUserSettings = true;
          "
        >
          <div class="head">
            <VaIcon class="head-icon" :name="opt.icon" size="20px" />
            <div>
              {{ $t(opt.label) }}
            </div>
          </div>

          <VaIcon
            v-if="userX.settings.bgVideo === opt.value"
            class="head-icon"
            name="fa-solid fa-check"
            size="20px"
          />
        </div>
      </template>

      <template v-if="page === 'qr'">
        <div class="expander section" @click="page = 'main'">
          <div class="head">
            <VaIcon class="head-icon" name="msr-arrow_back" size="20px" />
            <div>
              {{ $t("profile.control") }}
            </div>
          </div>
        </div>

        <div class="qr-shortcut">
          <EkiControlQR fullscreen></EkiControlQR>
        </div>
      </template>
    </va-scroll-container>
  </div>
</template>

<script setup>
import EkiControlQR from "@/components/profile/EkiControlQR.vue";
import { useUserStore } from "@/stores/user";
import { usePlayerStore } from "@/stores/player";
import { onBeforeUnmount, ref } from "vue";
import { useRequesterStore } from "@/stores/requester";
import { onBeforeMount } from "vue";

const emit = defineEmits(["closeConfig"]);

const requesterX = useRequesterStore();
const userX = useUserStore();
const playerX = usePlayerStore();

const page = ref('main');
const isOnline = ref(null);
const saveUserSettings = ref(false);
const fontThemes = [
  {
    label: "config.purple",
    value: "Estilo 1",
    icon: "fa-solid fa-palette",
    class: "purple",
  },
  {
    label: "config.pink",
    value: "Estilo 2",
    icon: "fa-solid fa-palette",
    class: "pink",
  },
  {
    label: "config.yellow",
    value: "Estilo 3",
    icon: "fa-solid fa-palette",
    class: "yellow",
  },
];
const fontStyles = [
  {
    label: "config.capital",
    value: "MAYÚSCULAS",
    icon: "fa-solid fa-magnifying-glass-plus",
  },
  {
    label: "config.lowercase",
    value: "minúsculas",
    icon: "fa-solid fa-magnifying-glass-minus",
  },
];
const bgVideoOptions = [
  {
    label: "config.original",
    value: "original",
    icon: "fa-brands fa-youtube",
  },
  {
    label: "config.particles",
    value: "particles",
    icon: "fa-solid fa-wand-sparkles",
  },
  {
    label: "config.stars",
    value: "stars",
    icon: "fa-solid fa-star",
  },
  {
    label: "config.mistic",
    value: "mistic",
    icon: "fa-solid fa-hat-wizard",
  },
  {
    label: "config.campfire",
    value: "campfire",
    icon: "fa-solid fa-fire",
  },
  {
    label: "config.none",
    value: "none",
    icon: "fa-solid fa-ban",
  },
];

onBeforeUnmount(async () => {
  console.log("unmounting");
  if (saveUserSettings.value) {
    console.log("should save settings");
    await saveSettings();
  }
});

async function saveSettings() {
  try {
    userX.settings.functionallity.recordModeActive = false;

    await requesterX.Post({
      route: "/update-setting",
      withAuth: true,
      body: userX.settings,
    });
  } catch (error) {
    console.error(error);
  }
}
onBeforeMount(()=>{
    isOnline.value = navigator.onLine;
});
</script>

<style scoped lang="scss" src="./configs.scss"></style>
