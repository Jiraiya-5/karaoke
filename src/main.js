import "./polyfills/dom";
import "vuestic-ui/css";
import "./assets/main.scss";
import App from "./App.vue";
import router from "./router";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { vuestic } from "./plugins/vuestic";
import EkiInfiniteScroll from "@/components/eki-infinitescroll/EkiInfiniteScroll.vue";
import i18n from "./plugins/i18n";
import Particles from "@tsparticles/vue3";
import { loadFull } from "tsparticles";
import "material-symbols/rounded.css";
import VueQrcode from "@chenfengyuan/vue-qrcode";

// 👇 FontAwesome — registrar TODOS los iconos
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createManager } from '@vue-youtube/core'

library.add(fas, far, fab);

const app = createApp(App);
const pinia = createPinia();

app.component("fa-icon", FontAwesomeIcon);
app.component("EkiInfiniteScroll", EkiInfiniteScroll);
app.component("qr-code", VueQrcode);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vuestic);
app.use(createManager());

app.use(Particles, {
  init: async (engine) => {
    await loadFull(engine);
  },
});

app.mount("#app");

document.title = import.meta.env.VITE_TITLE || "ekiu-karaoke";