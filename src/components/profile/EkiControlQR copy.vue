<template>
    <template v-if="controlAllowed || loading">
        <h1 v-if="!fullscreen" class="qr-title">{{ $t('qr.scan') }}</h1>
        <div class="qr-id" :class="{ fullscreen }">
            <span>{{ $t('qr.id') }}</span>
            <va-button color="border" hover-mask-color="complementary" hover-opacity="1" @click="copyId" :size="fullscreen ? 'medium' : 'large'"
                :disabled="loading" :title="$t('qr.copy-id')">
                <h2 class="room">{{ controlId ?? '------' }}</h2>
            </va-button>
            <va-button v-if="!fullscreen" :class="{ regen: !loading }" preset="plain" icon="msr-cached" color="complementary" size="45px"
                :title="$t('qr.reset')" :disabled="loading" @click="regenQr"></va-button>
        </div>

        <div class="qr-container">
            <div class="loading" v-show="loading">
                <va-progress-circle indeterminate :thickness="0.2" size="80px" color="warning" />
            </div>

            <a :href="qrHref" target="_blank" title="Ir al Control Remoto" class="qrcode"
                :class="{ visible: !loading }">
                <figure>
                    <qr-code v-if="qrHref" :value="qrHref" class="qrcode__qr" tag="img" width="250px" height="250px"
                        :options="{
                            errorCorrectionLevel: 'Q',
                            margin: 0,
                            color: {
                                dark: '#c3c4f7',
                                light: '#16151a'
                            },
                            width: 500,
                        }" @ready="qrReady"></qr-code>

                    <div class="logo">
                        <img src="/images/ek-logos/ekiLogo.webp" alt="ekilogo.webp">
                    </div>
                </figure>
            </a>
            <va-button id="copy-qr" v-if="!fullscreen" :aria-label='$t("qr.copy")' round class="mt-4" @click="copyLink"
                :title="$t('qr.copy')" :disabled="loading">
                <fa-icon class="pr-2" icon="fa-solid fa-copy"></fa-icon>{{ $t('qr.copy') }}
            </va-button>
        </div>

        <p v-if="!fullscreen" class="qr-notes">{{ $t('qr.info') }}</p>
    </template>


    <div v-else class="no-license">
        <div class="warning-msg">{{ $t("error.noSubscription") }}</div>

        <va-button id="subscribe" :aria-label='$t("subscribe")' class="action-btn" color="primary" :href="purchaseLink"
            target="_blank">{{ $t("subscribe") }}</va-button>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRequesterStore } from "@/stores/requester";
import { useSocketStore } from "@/stores/socket";
import { useUtilsStore } from "@/stores/utils";
import { useUserStore } from "@/stores/user";

const requesterX = useRequesterStore();
const socketX = useSocketStore();
const utilsX = useUtilsStore();
const userX = useUserStore();

const props = defineProps({
  fullscreen: {
    type: Boolean,
    required: false,
    deffault: false,
  },
});

const purchaseLink = import.meta.env.VITE_PURCHASE_LINK;
const qrHref = ref(null);
const controlId = ref(null);
const loading = ref(true);
const controlAllowed = ref(true);

function qrReady() {
    console.log("qr is ready");
    loading.value = false;
}

async function generateQR() {
    if (!userX.isSubscribed && userX.isLoggedIn) {
        setTimeout(() => {
            controlAllowed.value = false;
            loading.value = false;
        }, 1000);
    } else {
        const qrTok = await requesterX.Get({
            route: "/control/get-access",
            withAuth: true
        });

        if (qrTok.statusText === "OK") {
            qrHref.value = qrTok.data.url;
            controlId.value = qrTok.data.id;
            socketX.controlRoom = qrTok.data.id;
            socketX.connectControl();
        } else {
            controlAllowed.value = false;
            loading.value = false;
        }
    }
}

onMounted(async () => {
    await generateQR();
});

async function copyLink() {
    await navigator.clipboard.writeText(qrHref.value);
    utilsX.setNotif({
        title: "success",
        message: "qr.copied",
        type: "success",
        timeVisible: 5,
        position: "top-center",
    });
}

async function regenQr() {
    try {
        socketX.disconnectControl();

        const qrTok = await requesterX.Get({
            route: "/control/reset-room",
            withAuth: true
        });

        if (qrTok.statusText === "OK") {
            qrHref.value = qrTok.data.url;
            controlId.value = qrTok.data.id;
            socketX.controlRoom = qrTok.data.id;
            socketX.connectControl();
        } else {
            controlAllowed.value = false;
            loading.value = false;
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = true;
    }
}

async function copyId() {
    await navigator.clipboard.writeText(controlId.value);
    utilsX.setNotif({
        title: "success",
        message: "qr.copied-id",
        type: "success",
        timeVisible: 5,
        position: "top-center",
    });
}
</script>

<style scoped lang="scss" src="./profile.scss"></style>
