<template>
  <div
    class="lrc-maincontainer"
    :class="{
      hidden:
        !userX.settings.visual.fullScreenActive &&
        (!playerX.playing ||
          playerX.currentLyrics === null ||
          playerX.currentLyrics.classicEmpty),
      fullscreen: userX.settings.visual.fullScreenActive,
      'on-top': userX.settings.visual.playerPosition === 'Arriba',
    }"
  >
    <div
      class="lrc-video"
      :class="{ visible: showVideo, 'crop-chrome': !skipYoutubeEmbed }"
      v-if="!skipYoutubeEmbed && userX.settings.bgVideo === 'original' && playerX.currentSong && isOnline"
    >
      <youtube-iframe
        ref="youtube"
        @ready="onVideoReady"
        @error="onVideoError"
        @state-change="onVideoStateChange"
        @api-change="hideYoutubeOverlays"
        :video-id="playerX.currentSong.idVideo"
        :player-vars="youtubePlayerVars"
        width="100%"
        height="100%"
      />
    </div>
    <!-- Partículas solo en fullscreen: en ventana se ocultaban con CSS pero el canvas seguía corriendo. -->
    <vue-particles
      id="tsparticles"
      :options="bgDesign"
      v-if="bgDesign && userX.settings.visual.fullScreenActive"
    />

    <div v-if="userX.settings.visual.fullScreenActive" class="full-lrc">
      <div class="top-shadow"></div>
      <div class="current-lrc">
        <template v-if="playerX.currentLyrics != null">
          <div :class="`lrc ${userX.fontStyle} ${userX.themeStyle}`">
            <div v-for="(line, index) in displayedLines" :key="index" class="lrcline">
              <span v-if="line.before">{{ line.before }}</span><span v-if="line.painted" class="active-lrc">{{ line.painted }}</span>{{ line.rest }}
            </div>
          </div>
        </template>
      </div>
      <div class="bottom-shadow"></div>
    </div>

    <div
      v-else-if="playerX.currentLyrics != null"
      :class="`lrc ${userX.fontStyle} ${userX.themeStyle}`"
    >
      <div v-for="(line, index) in displayedLines" :key="index" class="lrcline">
        <span v-if="line.before">{{ line.before }}</span><span v-if="line.painted" class="active-lrc">{{ line.painted }}</span>{{ line.rest }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { usePlayerStore } from "@/stores/player";
import { YoutubeIframe } from "@vue-youtube/component";
import { computed, onBeforeMount, ref, watch } from "vue";
import { getDisplayedKaraokeLines } from "@/composables/useKaraokeTimeline";
import { useLowResourceProfile } from "@/composables/useLowResourceProfile";

const { isLowResource, skipYoutubeEmbed } = useLowResourceProfile();

const bgOptions = {
  particles: {
    fpsLimit: isLowResource ? 30 : 60,
    interactivity: {
      events: {
        resize: true,
      },
    },
    particles: {
      color: {
        value: "#ffda6c",
      },
      move: {
        direction: "bottom",
        enable: true,
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: isLowResource ? 20 : 40,
      },
      opacity: {
        random: true,
        value: 1,
      },
      shape: {
        type: "circle",
      },
      size: {
        random: true,
        value: 10,
      },
    },
    detectRetina: !isLowResource,
  },
  stars: {
    fpsLimit: isLowResource ? 30 : 60,
    interactivity: {
      events: {
        resize: true,
      },
    },
    particles: {
      number: {
        value: isLowResource ? 40 : 200,
        density: {
          enable: true,
        },
      },
      size: {
        value: { min: 2, max: 5 },
      },
      move: {
        enable: true,
        speed: 0.3,
        random: true,
      },
      opacity: {
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
        value: { min: 0, max: 1 },
      },
    },
    detectRetina: !isLowResource,
  },
  mistic: {
    fpsLimit: isLowResource ? 30 : 60,
    interactivity: {
      events: {
        resize: true,
      },
    },
    particles: {
      number: {
        value: isLowResource ? 40 : 200,
        density: {
          enable: true,
        },
      },
      color: {
        value: ["#00edb3", "#21e6ba", "#21e6ba", "#21e6ba", "#21e6ba"],
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
      },
      size: {
        value: { min: 2, max: 5 },
      },
      move: {
        enable: true,
        speed: 3,
        random: true,
      },
    },
    background: {
      image: "radial-gradient(#8A2BE277, #000)",
    },
    detectRetina: !isLowResource,
  },
  campfire: {
    fpsLimit: isLowResource ? 30 : 60,
    interactivity: {
      events: {
        resize: true,
      },
    },
    particles: {
      number: {
        value: isLowResource ? 40 : 300,
        density: {
          enable: true,
        },
      },
      color: {
        value: ["#fdcf58", "#757676", "#f27d0c", "#800909", "#f07f13"],
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
      },
      size: {
        value: { min: 1, max: 3 },
      },
      move: {
        enable: true,
        speed: 6,
        random: false,
      },
    },
    background: {
      image: "radial-gradient(#4a0000, #000)",
    },
    detectRetina: !isLowResource,
  },
};

const userX = useUserStore();
const playerX = usePlayerStore();
const youtube = ref();
const showVideo = ref(false);
const bgDesign = ref(bgOptions[userX.settings.bgVideo] ?? false);

const youtubePlayerVars = computed(() => ({
  version: 3,
  vq: isLowResource ? "medium" : "hd720",
  playlist: playerX.currentSong?.idVideo,
  autoplay: 0,
  mute: 1,
  rel: 0,
  loop: 1,
  controls: 0,
  fs: 0,
  playsinline: 1,
  showinfo: 0,
  modestbranding: 1,
  cc_load_policy: 0,
  disablekb: 1,
  iv_load_policy: 3,
}));

const displayedLines = computed(() =>
  getDisplayedKaraokeLines(
    playerX.currentLyrics,
    playerX.karaokeLines,
    userX.settings.visual.fullScreenActive && userX.settings.karaoke.showAllLyric
  )
);

let unwatch = null;
let isVideoPaused = true;
const isOnline = ref(true);
watch(
  [() => playerX.playing, () => playerX.currentSong],
  ([playing, current]) => {
    console.log("CHECK FALLBACK", playing, current);
    if (!playing && current === null) {
      showFallbackVideo();
    }
  }
);

watch(
  () => userX.settings.bgVideo,
  (newBg) => {
    bgDesign.value = false;
    setTimeout(() => {
      bgDesign.value = bgOptions[newBg] ?? false;
    }, 10);
  }
);

function youtubePlayerInstance(event) {
  if (event && event.target) {
    return event.target;
  }
  if (youtube.value && youtube.value.instance) {
    return youtube.value.instance;
  }
  return null;
}

function hideYoutubeOverlays(event) {
  if (skipYoutubeEmbed) {
    return;
  }
  const player = youtubePlayerInstance(event);
  if (!player || typeof player.unloadModule !== "function") {
    return;
  }
  try {
    player.unloadModule("captions");
    player.unloadModule("cc");
  } catch (error) {
    console.error(error);
  }
}

function onVideoReady(data) {
  try {
    console.log("onVideoReady");
    console.log(data);
    hideYoutubeOverlays(data);
    youtube.value?.togglePlay();
    showVideo.value = true;
    bgDesign.value = false;
    unwatch = watch(
      () => playerX.playing,
      (playingSong) => {
        if (playingSong === isVideoPaused) {
          youtube.value?.togglePlay();
        }
      }
    );
  } catch (error) {
    console.error(error);
  }
}

function onVideoError(data) {
  console.log("onVideoError");
  console.log(data);
  if (["2", "5", "100", "101", "150"].includes(data.data)) {
    showVideo.value = false;
    showFallbackVideo();
    unwatch();
  }
}

function showFallbackVideo() {
  if (userX.settings.bgVideo != "none") {
    var keys = Object.keys(bgOptions);
    bgDesign.value = bgOptions[keys[(keys.length * Math.random()) << 0]];
  }
}

function onVideoStateChange(data) {
  switch (data.data) {
    case 1:
      isVideoPaused = false;
      hideYoutubeOverlays(data);
      break;
    case 2:
      isVideoPaused = true;
      break;
  }
}

onBeforeMount(() => {
  if (!playerX.isPlaying && playerX.currentSong === null && !bgDesign) {
    showFallbackVideo();
  }
  if (skipYoutubeEmbed && userX.settings.bgVideo === "original") {
    showFallbackVideo();
  }
  isOnline.value = navigator.onLine;
  if(!isOnline.value){
    //if no is online show fallback video
    showFallbackVideo();
  }
});
</script>

<style lang="scss" src="./lyrics.scss"></style>
