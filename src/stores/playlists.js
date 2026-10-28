import { defineStore } from "pinia";
import { ref, watch } from "vue";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import alasql from "alasql";

export const usePlaylistStore = defineStore("playlist", () => {
    
    if(!localStorage.getItem("ekiAppUser")) return;
    
    const db = ref(null);
    const needsUpgrade = ref(false);
    const allPlaylist = ref(null);
    const localPlaylistLoaded = ref(false);    

    const {token, key} = JSON.parse(localStorage.getItem("ekiAppUser"));

    if (navigator.onLine){
        fetch(`${import.meta.env.VITE_API_URL}/offline/get-playlist-version`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(async(playlistVersion)=>{
            const {version} = JSON.parse(await playlistVersion.text());
            dbEvents(window.indexedDB.open("ekiDB-playlist", version>0?version+1:1));
        });
    }else{
        dbEvents(window.indexedDB.open("ekiDB-playlist"));        
    }

    async function dbEvents(indexDB){
        indexDB.onupgradeneeded = async function(event) {
            if(!event.target.transaction.objectStoreNames.contains("playlist")){
                await createIndex(event.target.result,"playlist");
            }
            needsUpgrade.value = true;
        }    
        indexDB.onsuccess = async function (event) {
            db.value = event.target.result;
            if(!needsUpgrade.value){
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/offline/get-playlists`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            
            const songs = JSON.parse(AES.decrypt(await response.text(), key).toString(encUtf8));
            await createIndexedDB(db.value,"playlist",songs);
        }

    }

    watch(
        () => db,
        (connection) => {
          if(connection){
            load();
          }
        },
        { deep: true }
    );

    function load(){
        let tx = db.value.transaction('playlist');
        let store = tx.objectStore('playlist');
        let playlistDB = store.getAll();
        playlistDB.onsuccess = function(event) {
            allPlaylist.value = event.target.result; 
            localPlaylistLoaded.value = true;
        }
   }

    function getData(){
        let dataAux = alasql(`SELECT * FROM ? a`, [allPlaylist.value]);
        return dataAux;
    }

    function getDataById(id) {
        let dataAux = alasql(`SELECT * FROM ? a where id = ?`, [allPlaylist.value, id]);
        return {
            id: dataAux[0].id,
            name: dataAux[0].name,
            count: dataAux[0].playlistSongs.length
        };
    }

    function getDataBySongs(id) {
        const dataAux = alasql(`SELECT * FROM ? a where id = ?`, [allPlaylist.value, id]);
        return dataAux[0].playlistSongs.map(s=>s.playlistSongDetail);
    }

    async function saveHistory(song){
        const transaction = db.value.transaction("playlist", "readwrite");
        const objectStore = transaction.objectStore("playlist");
        await objectStore.put(song);
        if(!navigator.onLine){
            syncOffline(song)
        }
    }
    async function createIndexedDB(db, name, objects){
        const transaction = db.transaction(name, "readwrite");
        const objectStore = transaction.objectStore(name);

        for(const i in objects){
            const object = objects[i];
            await objectStore.put(object);
        }
        transaction.oncomplete = function() {
            console.log("All done! for "+name);
        };
    }
    function createIndex(db,name){
        const objectStore = db.createObjectStore(name, { keyPath: "id" });
        objectStore.createIndex("id", "id", { unique: true });
    }

    async function syncOffline(song){
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(`playlist-${song.id}`);
        //save on localstorage for later sync when internet is online
        localStorage.setItem(`playlist-${song.id}`, song);
    }
    
    return { saveHistory, getData, allPlaylist, getDataById, getDataBySongs }
});