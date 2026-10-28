import { ref, onMounted, onBeforeUnmount } from "vue";

export function useScreenSize() {
  const vw = ref(window.innerWidth);
  const vh = ref(window.innerHeight);

  onMounted(() => {
    window.addEventListener("resize", onResize);
    const viewHeight = vh.value * 0.01;
    document.documentElement.style.setProperty('--vh', `${viewHeight}px`);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", onResize);
  });

  function onResize() {
    vw.value = window.innerWidth;
    vh.value = window.innerHeight;
  }

  return {
    vw,
    vh,
  };
}
