<template>
  <va-scroll-container class="suggestions-modal" :class="{
    'show': props.suggestions.songs?.length > 0 || props.suggestions.artists?.length > 0 || props.suggestions.songs?.genres > 0,
    'height-tauri' : isTauri
  }" vertical color="secondary" size="small">
    <div style="padding-bottom: 25px;">
      <h2 class="main-title">{{ $t('topResults') }}</h2>
      <template v-if="props.suggestions.songs?.length > 0">
        <h3 class="section-title">{{ $t('song.plural') }} <va-chip square readonly size="small">{{
          props.suggestions.songs.length
        }}</va-chip></h3>

        <VaList>
          <VaListItem v-for="(suggest, index) in props.suggestions.songs" class="suggestion-card"
            :to="{ name: 'seeker', query: { q: suggest.name, type: 'song' } }" @click="$emit('onSelected')">
            <VaListItemSection avatar>
              <VaAvatar icon="fa-solid fa-search" size="small">
              </VaAvatar>
            </VaListItemSection>

            <VaListItemSection>
              <VaListItemLabel class="suggestion-label">
                {{ suggest.name }}
              </VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
        </VaList>
      </template>

      <template v-if="props.suggestions.artists?.length > 0">
        <div class="divider"></div>
        <h3 class="section-title">{{ $t('artist.plural') }} <va-chip square readonly size="small">{{
          props.suggestions.artists.length
        }}</va-chip></h3>

        <VaList>
          <VaListItem v-for="(suggest, index) in props.suggestions.artists" class="suggestion-card"
            :to="{ name: 'seeker', query: { q: suggest.name, type: 'artist' } }" @click="$emit('onSelected')">
            <VaListItemSection avatar>
              <VaAvatar icon="fa-solid fa-search" size="small">
              </VaAvatar>
            </VaListItemSection>

            <VaListItemSection>
              <VaListItemLabel class="suggestion-label">
                {{ suggest.name }}
              </VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
        </VaList>
      </template>

      <template v-if="props.suggestions.genres?.length > 0">
        <div class="divider"></div>
        <h3 class="section-title">{{ $t('genre.plural') }} <va-chip square readonly size="small">{{
          props.suggestions.genres.length
        }}</va-chip></h3>

        <VaList>
          <VaListItem v-for="(suggest, index) in props.suggestions.genres" class="suggestion-card"
            :to="{ name: 'seeker', query: { q: suggest.name, type: 'genre' } }" @click="$emit('onSelected')">
            <VaListItemSection avatar>
              <VaAvatar icon="fa-solid fa-search" size="small">
              </VaAvatar>
            </VaListItemSection>

            <VaListItemSection>
              <VaListItemLabel class="suggestion-label">
                {{ suggest.name }}
              </VaListItemLabel>
            </VaListItemSection>
          </VaListItem>
        </VaList>
      </template>
    </div>
  </va-scroll-container>
</template>

<script setup>
const isTauri = import.meta.env.VITE_IS_TAURI && import.meta.env.VITE_IS_TAURI === "true";
const props = defineProps({
  suggestions: {
    type: Object,
    required: true
  }
});

defineEmits(['onSelected']);
</script>

<style scoped lang="scss" src="./searchinput.scss"></style>