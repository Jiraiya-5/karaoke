<template>
    <div class="dashbody"
        :class="{ 'top-space': topSpace, fullscreen: userX.settings.visual.fullScreenActive }"
    >
        <va-scroll-container id="eki-body-content" size="small" vertical class="body-content-container">
            <EkiShortQueue></EkiShortQueue>
            <EkiBreadcrumbs></EkiBreadcrumbs>
            <EkiErrorState v-if="utilsX.errorState"></EkiErrorState>
            <router-view></router-view>
            <EkiFooter></EkiFooter>
            <EkiLyrics></EkiLyrics>
        </va-scroll-container>
    </div>
</template>

<script setup>
import EkiLyrics from "@/components/eki-lyrics/EkiLyrics.vue";
import EkiErrorState from "@/components/eki-errorstate/EkiErrorState.vue";
import EkiShortQueue from "@/components/eki-shortqueue/EkiShortQueue.vue";
import EkiBreadcrumbs from "@/components/eki-breadcrumbs/EkiBreadcrumbs.vue";
import EkiFooter from "@/components/eki-footer/EkiFooter.vue";
import { useRoute } from "vue-router";
import { watch, computed } from "vue";
import { useUserStore } from '@/stores/user';
import { usePlayerStore } from '@/stores/player';
import { useUtilsStore } from '@/stores/utils';


const userX = useUserStore();
const playerX = usePlayerStore();
const utilsX = useUtilsStore();

const route = useRoute();


const topSpace = computed(() => {
    if(userX.settings.visual.playerPosition === 'Arriba'){
        if(playerX.playing){
            return true;
        }
    }else{
        if(userX.settings.visual.showQueue){
            return true;
        }
    }
    return false;
});

watch([() => route.name, () => route.query], () => {
    const bodyDiv = document.getElementById('eki-body-content');

    bodyDiv.scrollTop = 0;
});
</script>

<style scoped lang="scss" src="./dashbody.scss"></style>