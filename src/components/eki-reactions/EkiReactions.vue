<template>
  <Teleport to="body">
    <div ref="reactionCanvas" class="reactions-canvas"></div>
  </Teleport>
</template>

<script setup>
import { useUtilsStore } from "@/stores/utils";
import { ref, watch } from "vue";

const utilsX = useUtilsStore();
const reactionCanvas = ref();

watch(
  () => utilsX.currentReaction,
  (newReaction) => {    
    if (newReaction && reactionCanvas.value) {
      // 👇 Usamos window.innerWidth en lugar de offsetWidth
      const containerWidth = window.innerWidth;
      
      var startY = Math.floor(Math.random() * (-50 - (-100) + 1)) + (-100);

      for (let i = 0; i < 3; i++) {
        const startX = Math.random() * containerWidth;
        startY = startY - i * 125;

        const emojiElement = document.createElement("div");
        emojiElement.className = "emoji";
        emojiElement.innerText = newReaction.emoji;
        
        // Usamos posición fixed para que sea relativa a la ventana
        emojiElement.style.position = "fixed";
        emojiElement.style.left = `${startX}px`;
        emojiElement.style.bottom = `${startY}px`;
        emojiElement.style.animation = `float 6s ease-in-out`;

        reactionCanvas.value.appendChild(emojiElement);

        setTimeout(function () {
          if (reactionCanvas.value.contains(emojiElement)) {
            reactionCanvas.value.removeChild(emojiElement);
          }
        }, 6000);
      }      
    }
  },
  { deep: true }
);
</script>

<style lang="scss" src="./reactions.scss"></style>