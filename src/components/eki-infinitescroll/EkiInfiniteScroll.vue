<template>
  <div ref="sentinel" class="eki-infinite-scroll">
    <slot />
    <div v-if="loading" class="loading">
      <va-progress-circle indeterminate size="small" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  distance: { type: Number, default: 100 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['load-more'])
const sentinel = ref(null)
let observer = null

onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !props.loading) {
          emit('load-more')
        }
      },
      { rootMargin: `${props.distance}px` }
    )
    if (sentinel.value) observer.observe(sentinel.value)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.eki-infinite-scroll {
  width: 100%;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}
</style>