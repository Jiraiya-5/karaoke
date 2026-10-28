<template>
  <div class="top-nav">
    <EkiSearchInput />

    <div class="icon-opts">
      <EkiRecorder />
      <EkiLangSwitch />
      <EkiUserOptions />
    </div>
  </div>
</template>

<script setup>
import EkiSearchInput from '@/components/eki-searchinput/EkiSearchInput.vue'
import EkiRecorder from '@/components/eki-recorder/EkiRecorder.vue'
import EkiLangSwitch from '@/components/eki-langswitch/EkiLangSwitch.vue'
import EkiUserOptions from '@/components/eki-useroptions/EkiUserOptions.vue'
</script>

<style scoped>
.top-nav {
  position: absolute;
  top: 0;
  right: 0;
  height: 70px;
  width: calc(100% - 280px);
  color: var(--eki-font-color);
  z-index: 40;
  border-bottom: 1px solid var(--eki-border-color);
  background-color: var(--eki-bg-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  padding: 0 15px;
}

.top-nav.hide {
  z-index: -1;
  display: none;
}

.top-nav .icon-opts {
  font-size: 18px;
  color: var(--eki-font-color);
  display: flex;
  align-items: center;
  gap: 15px;
}

@media screen and (max-width: 1000px) {
  .top-nav {
    width: 100%;
    padding-left: 50px;
  }
}
</style>