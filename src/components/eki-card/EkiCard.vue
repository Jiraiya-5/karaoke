<template>
  <div class="eki-card" @click="$emit('click')">
    <div class="card-image">
      <img v-if="image" :src="image" :alt="title" />
      <div v-else class="placeholder">
        <fa-icon :icon="icon" />
      </div>
      <div class="song-count" v-if="count !== null">
        <fa-icon icon="fa-solid fa-list-ul" /> {{ count }}
      </div>
      <div class="quick-actions" @click.stop>
        <va-button
          icon="fa-solid fa-cart-plus"
          color="primary"
          size="small"
          round
          :title="$t('song.addToQueue')"
          @click="$emit('add-to-queue')"
        />
      </div>
    </div>
    <div class="card-name">{{ title }}</div>
    <div class="card-subtitle" v-if="subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup>
defineProps({
  image: { type: String, default: null },
  title: { type: String, required: true },
  subtitle: { type: String, default: null },
  count: { type: [Number, String], default: null },
  icon: { type: String, default: 'fa-solid fa-music' }
})

defineEmits(['click', 'add-to-queue'])
</script>

<style scoped lang="scss" src="./card.scss"></style>