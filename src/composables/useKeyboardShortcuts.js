import { usePlayerStore } from "@/stores/player";
import { useUserStore } from "@/stores/user";

export function useShortCuts() {

  const playerX = usePlayerStore();
  const userX = useUserStore();
  window.addEventListener("keydown", handlerEvents, true);

  function handlerEvents(event) {
    if (!event.srcElement.name && /(Digit|Numpad)/.test(event.code)) {
        const digit = event.code.replace(/(Digit|Numpad)/g, "");

        if (/^[7890]$/.test(digit)) {
          playerX.setNextScore(digit);
        }

        return;
    }
    // Short cuts
    if (event.shiftKey) {
      
      switch (event.code) {
        case "ArrowRight":
          var currentTime = playerX.songProgress;
          var setSeek = currentTime + 1;
          playerX.seek(setSeek >= 100 ? 100 : setSeek);
          break;
        case "ArrowLeft":
          var currentTime = playerX.songProgress;
          var setSeek = currentTime - 1;
          playerX.seek(setSeek <= 0 ? 0 : setSeek);
          break;
        case "KeyV":
          playerX.pausePlayVoice();
          break;
        case "KeyR":
          playerX.seek(0);
          break;
        case "ArrowUp":
          let volUp = playerX.volume + 0.1;

          playerX.changeVolume(volUp > 1 ? 1 : volUp);
          break;
        case "ArrowDown":
          let volDown = playerX.volume - 0.1;

          playerX.changeVolume(volDown < 0 ? 0 : volDown);
          break;
        case "KeyQ":
          userX.settings.visual.showQueue = !userX.settings.visual.showQueue;
          break;
        case "KeyF":
          userX.requestFullScreen();
          break;
      }
    }
  }
}
