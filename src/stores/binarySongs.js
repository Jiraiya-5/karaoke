import { defineStore } from "pinia";
import { ref } from "vue";
import {useDecrypt} from '@/composables/useDecrypt'
import { useUserStore } from "@/stores/user";
export const useBinarySongStore = defineStore("binarySong", () => {
    
    if(import.meta.env.VITE_IS_TAURI && import.meta.env.VITE_IS_TAURI === "true"){
       return
    }
    const {decryptAudio} = useDecrypt();
    const userX = useUserStore();
    const db = ref(null);
    const dbName = "eki-binarySongDB-v2";
    const request = window.indexedDB.open(dbName, 1);
    const allBinarySongs = [];
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore("files", { keyPath: "id" });
    };

    request.onsuccess = function(event) {
        db.value = event.target.result;
        load();
    };

    function saveSongInDB(name, data){
        const transaction = db.value.transaction(["files"], "readwrite");
        const objectStore = transaction.objectStore("files");
        objectStore.put({ id: name, data });
        
    }

    function load(){
        const tx = db.value.transaction(["files"]);
        const store = tx.objectStore('files');
        const allSongs = store.getAll();
        allSongs.onsuccess = function(event) {
            const songs = event.target.result;
            for(const s in songs){
                allBinarySongs.push(songs[s].id);
            }
        }
   }
   async function loadSongData(num) {
        return new Promise((resolve, reject) => {
            const tx = db.value.transaction(["files"]);
            const store = tx.objectStore("files");

            let file = null;
            let voiceFile = null;
            let fileReady = false;
            let voiceFileReady = false;

            const checkResolve = () => {
                if (fileReady && voiceFileReady) {
                    resolve({
                        file: file ? new Blob([file], { type: "audio/mpeg" }) : null,
                        voiceFile: voiceFile ? new Blob([voiceFile], { type: "audio/mpeg" }) : null
                    });
                }
            };
            const fileName = `ECK ${num}`
            const dataReq = store.get(`${fileName}.eck`);
            dataReq.onsuccess = async (event) => {
                if (event.target.result) {
                    try {
                        file = await decryptAudio(userX.apiUser.user.id, event.target.result.data);
                    } catch (err) {
                        console.error("Error decrypting file:", err);
                        file = null;
                    }
                } else {
                    file = null;
                }
                fileReady = true;
                checkResolve();
            };
            dataReq.onerror = () => reject(dataReq.error);

            const dataVoiceReq = store.get(`${num}.eck`);
            dataVoiceReq.onsuccess = async (event) => {
                if (event.target.result) {
                    try {
                        voiceFile = await decryptAudio(userX.apiUser.user.id, event.target.result.data);
                    } catch (err) {
                        console.error("Error decrypting voice file:", err);
                        voiceFile = null;
                    }
                } else {
                    voiceFile = null;
                }
                voiceFileReady = true;
                checkResolve();
            };
            dataVoiceReq.onerror = () => reject(dataVoiceReq.error);
        });
    }
   async function removeSongData(num){
        const tx = db.value.transaction(["files"], 'readwrite');
        const store = tx.objectStore('files');
        store.delete(`ECK ${num}.eck`)
        store.delete(`${num}.eck`)
   }
   async function saveFileIndexDB(data,name){
        const transaction = db.value.transaction(["files"], "readwrite");
        const objectStore = transaction.objectStore("files");
        objectStore.put({ id: name, data });
    }
   return {saveSongInDB, allBinarySongs, loadSongData, removeSongData, saveFileIndexDB}

});