import { usePlayerStore } from "@/stores/player";
import { ref, computed, watch } from "vue";

export function useTimeFormat() {
  const playerX = usePlayerStore();

  const timeLeft = ref("-0:00");
  const currentTime = ref("0:00");
  const totalTime = computed(() => {
    try {
      const min = Math.floor(playerX.songSeconds / 60) || 0;
      const secs = Math.floor(playerX.songSeconds - min * 60) || 0;

      return `${min}${secs < 10 ? ":0" : ":"}${secs}`;
    } catch (error) {
      return "0:00";
    }
  });

  watch(() => playerX.songProgress, (newProgress) => {
    try {
      const percent = newProgress / 100;
      const time = percent * playerX.songSeconds;
      const min = Math.floor(time / 60) || 0;
      const secs = Math.floor(time - min * 60) || 0;
      const minLeft = Math.floor((playerX.songSeconds - time) / 60) || 0;
      const secsLeft = Math.floor(playerX.songSeconds - time - minLeft * 60) || 0;

      currentTime.value = `${min}${secs < 10 ? ":0" : ":"}${secs}`;
      timeLeft.value = `- ${minLeft}${secsLeft < 10 ? ":0" : ":"}${secsLeft}`;
    } catch (error) {
      currentTime.value = "0:00";
      timeLeft.value = "-0:00";
    }
  });

  return {
    timeLeft,
    currentTime,
    totalTime,
  };
}
