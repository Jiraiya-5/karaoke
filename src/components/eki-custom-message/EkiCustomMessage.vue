<template>
    <div class="eki-custommessage" :class="{
                visible: userX.settings.visual.showCustomMessage,
                'add-space': userX.settings.visual.showQueue
            }"
            >
        <div class="marquee-container">
            <div class="marquee-text" :class="`custom ${userX.fontStyle} ${userX.themeStyle}`">{{ message }}</div>
        </div>
    </div>
</template>

<script setup>
import {ref, onBeforeMount} from 'vue'
import { useUserStore } from '@/stores/user';

const userX = useUserStore();
const message = ref("");
const index = ref(0)
const messages = ref([]);
onBeforeMount(()=>{
    messages.value = userX.settings.visual.customMessage?userX.settings.visual.customMessage.split(";"):["Configura tu mensaje personalizado en el perfil de usuario"]
    updateMessage();
    if(messages.value.length > 1){
        setInterval(updateMessage, 10000);  
    }
    
})
function updateMessage() {
    message.value = messages.value[index.value];
    index.value = (index.value + 1) % messages.value.length;
}
</script>

<style lang="scss" src="./custommessage.scss"></style>
