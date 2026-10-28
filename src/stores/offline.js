import { defineStore } from "pinia";
import { useDatabaseStore } from "@/stores/database";
import { useHistoryStore } from "./history";
import { usePlaylistStore } from "./playlists";
export const useOfflineStore = defineStore("offline", () => {
    function syncBasicData() {
        navigator.serviceWorker.ready.then(async () => {
            useDatabaseStore();
        });
    } 
    function syncUserData() {
        navigator.serviceWorker.ready.then(async () => {
            useHistoryStore();
            usePlaylistStore();
        });
    }   
    return {syncBasicData, syncUserData};
    // Añadir a stores/offline.js
async function syncBasicData() {
  try {
    const { useRequesterStore } = await import('./requester')
    const requesterX = useRequesterStore()
    // Ejemplo: precargar datos básicos
    // await requesterX.Get({ route: '/public/get-autocomplete' })
  } catch (e) {
    console.warn('[offline.syncBasicData]', e)
  }
}

// Añadir al return:
// syncBasicData
});