<template>
  <div class="eki-cookie-banner">
    <VaScrollContainer class="banner-container" vertical size="small" color="secondary">
      <div class="banner">
        <h3 class="title">
          <VaIcon name="msr-cookie" color="blue" size="large" />
          {{ $t('cookies.title') }}
        </h3>
        <p class="msg">{{ $t('cookies.msg') }}</p>
        <VaButton
          class="btn"
          color="blue"
          :title="$t('cookies.accept')"
          @click="$emit('allowed')"
        >
          {{ $t('cookies.accept') }}
        </VaButton>
        <VaButton
          class="btn"
          preset="secondary"
          color="blue"
          :title="$t('cookies.deny')"
          @click="$emit('denied')"
        >
          {{ $t('cookies.deny') }}
        </VaButton>
        <VaButton
          class="btn expanded"
          size="small"
          preset="secondary"
          color="blue"
          block
          :to="{ name: 'profile', query: { tab: 'profile.cookies' } }"
        >
          {{ $t('cookies.settings') }}
        </VaButton>
      </div>
    </VaScrollContainer>
  </div>
</template>

<script setup>
defineEmits(['allowed', 'denied'])
</script>

<style scoped>
.eki-cookie-banner {
  position: absolute;
  z-index: 200;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background-color: rgba(0, 0, 0, 0.8);
}

.banner-container {
  background: #fff;
  border-radius: 8px;
  max-height: 100%;
  max-width: 100%;
  width: 400px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.banner {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.banner .title {
  margin-bottom: 15px;
  font-size: 20px;
  grid-column: 1 / 3;
  color: #000;
}

.banner .msg {
  margin-bottom: 25px;
  grid-column: 1 / 3;
  color: #333;
}

.banner .btn.expanded {
  grid-column: 1 / 3;
}
</style>