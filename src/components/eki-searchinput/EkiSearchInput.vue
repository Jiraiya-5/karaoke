<template>
  <div class="input-container">
    <VaInput
      v-model="searchQuery"
      class="search-input w-100"
      clearable
      :placeholder="$t('song.mainSearch')"
      color="font"
      background="border"
      @keyup.enter="doSearch"
    >
      <template #appendInner>
        <fa-icon
          class="search-icon"
          icon="fa-solid fa-search"
          @click="doSearch"
        />
      </template>
    </VaInput>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'seeker', query: { q: searchQuery.value, type: 'all' } })
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.input-container {
  position: relative;
  width: 600px;
  max-width: calc(100vw - 140px);
  transition: all 0.3s ease;
}

.search-input {
  --va-input-wrapper-border-radius: 25px;
  --va-input-wrapper-border-width: 0px;
  --va-input-wrapper-min-height: 45px;
}

.search-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 5px;
}

.search-icon:hover {
  color: var(--eki-secondary-color);
}
</style>