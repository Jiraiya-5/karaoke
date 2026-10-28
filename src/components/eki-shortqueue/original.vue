<template>
    <div class="eki-shortqueue" :class="{
        visible: userX.settings.visual.showQueue,
        'on-bottom': userX.settings.visual.playerPosition === 'Arriba' && !userX.settings.visual.fullScreenActive
    }">
        <div class="queue-list">
            <va-scroll-container horizontal size="medium">
                <div class="queue-card" v-for="(item, index) in shortQueue" :class="{ disabled: index >= indexToFill }">
                    <div class="head">
                        <va-dropdown :auto-placement="true" stickToEdges :offset="[10, 0]" trigger="hover">
                            <template #anchor>
                                <fa-icon class="head-icon" icon="fa-solid fa-circle-info"></fa-icon>
                            </template>

                            <div class="ekimodal">
                                <div class="modal-info-song" v-if="index < indexToFill">
                                    <div class="song-img">
                                        <va-image class="img" :src="playerX.queue[index].gen.img" lazy
                                            :title="playerX.queue[index].art.name"></va-image>
                                    </div>

                                    <div class="title"> {{ playerX.queue[index].title }}</div>
                                </div>
                            </div>
                        </va-dropdown>
                        <span class="head-title">{{ index + 1 }}</span>
                        <va-dropdown closeOnClickOutside :auto-placement="true" stickToEdges :offset="[10, 0]">
                            <template #anchor>
                                <fa-icon class="head-icon" icon="fa-solid fa-ellipsis-vertical"></fa-icon>
                            </template>

                            <div class="ekimodal">
                                <div v-if="canMove(index, -1)" @click="playerX.moveSong(index, -1)"
                                    :title="$t('song.moveLeft')" class="option">
                                    {{ $t('song.moveLeft') }}
                                    <fa-icon class="modal-icon" icon="fa-solid fa-arrow-left" />
                                </div>
                                <div v-if="canMove(index, 1)" @click="playerX.moveSong(index, 1)"
                                    :title="$t('song.moveRight')" class="option">
                                    {{ $t('song.moveRight') }}
                                    <fa-icon class="modal-icon" icon="fa-solid fa-arrow-right" />
                                </div>
                                <div v-if="index < indexToFill" @click="playerX.removeFromQueue(index)"
                                    :title="$t('song.removeFromQueue')" class="option">
                                    {{ $t('song.removeFromQueue') }}
                                </div>
                                <div v-if="index < indexToFill" @click="playerX.skipTo(index)"
                                    :title="$t('song.play')" class="option">
                                    {{ $t('song.play') }}
                                </div>
                            </div>
                        </va-dropdown>
                    </div>
                    <div class="body">
                        <va-input :id="`${props.customIdentifier}-short-queue-${index}`" :name="`${props.customIdentifier}-short-queue-${index}`" class="num-input"
                            input-class="va-text-center" v-model="shortQueue[index]" type="text" color="font"
                            background="border" :loading="loadings[index]" :mask="inputMask" placeholder="0"
                            :disabled="index >= indexToFill" @change="updateQueue(index)"></va-input>
                    </div>
                </div>
            </va-scroll-container>
        </div>

        <div class="queue-card add">
            <div class="head">
                <span class="head-title">{{ $t('add') }}</span>
            </div>
            <div class="body">
                <va-input :id="`${props.customIdentifier}-short-queue-add`" :name="`${props.customIdentifier}-short-queue-add`" class="num-input" input-class="va-text-center"
                    v-model="toAdd" type="text" color="font" background="border" :loading="loading" :mask="inputMask"
                    placeholder="0" @change="addSong()"></va-input>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useUserStore } from '@/stores/user';
import { useRequesterStore } from '@/stores/requester';
import { useUtilsStore } from "@/stores/utils";

const utilsX = useUtilsStore();
const playerX = usePlayerStore();
const userX = useUserStore();
const requesterX = useRequesterStore();
const inputMask = { numericOnly: true, blocks: [7], delimiter: '' };

const props = defineProps({
    customIdentifier: {
        type: String,
        required: false,
        deffault: false
    },
});

const indexToFill = ref(0);
const toAdd = ref(null);
const refresCounter = ref(0);
const loading = ref(false);
const loadings = ref([]);

const shortQueue = computed(() => {
    let short = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let loads = [false, false, false, false, false, false, false, false, false, false];
    let toFill = 0;
    const BreakError = {};

    try {
        playerX.queue.forEach((element, index) => {
            if(!element){
                console.log("no se puede agregar la cancion a la listaaaaaa");
               return;
            }
            if (toFill > (short.length - 1)) {
                short.push(element.num);
                loads.push(false);
                toFill++;
            } else {
                short[toFill] = element.num;
                toFill++;
            }
        });
    } catch (error) {
        if (error !== BreakError) throw error;
    }

    indexToFill.value = toFill;
    loadings.value = loads;

    return short;
});

function canMove(index, direction) {
    if (shortQueue.value[index] === 0) {
        return false;
    } else {
        const next = index + direction;
        if (next < 0 || next > shortQueue.value.length - 1) {
            return false;
        } else if (shortQueue.value[next] === 0) {
            return false;
        }
    }
    return true;
}

async function updateQueue(index) {
    try {
        loadings.value[index] = true;
        const num = shortQueue.value[index];

        if (num != 0 && num != '') {
            const song = await requesterX.Get({
                route: '/song-by-number/' + num,
                withAuth: true
            });

            if (song.status === 200) {
                playerX.updateFromQueue(index, song.data);
            }
        } else {
            refresCounter.value++;
        }
    } catch (error) {
        refresCounter.value++;
        console.error(error);
        utilsX.setNotif({
            title: "song.search",
            message: "song.notFound",
            type: "error",
            timeVisible: 5,
            position: "top-center",
        });
    } finally {
        loadings.value[index] = false;
    }
}

async function addSong() {
    try {
        loading.value = true;

        const song = await requesterX.Get({
            route: '/song-by-number/' + toAdd.value,
            withAuth: true
        });
        if (song.status === 200) {
            playerX.addToQueue(song.data);
            toAdd.value = null;
        }
        else{
            throw "song not found"
        }
    } catch (error) {
        console.error(error);
        utilsX.setNotif({
            title: "song.search",
            message: "song.notFound",
            type: "error",
            timeVisible: 5,
            position: "top-center",
        });
        toAdd.value = null;
    } finally {
        loading.value = false;
    }
}
</script>

<style lang="scss" src="./shortqueue.scss"></style>
