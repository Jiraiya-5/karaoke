import { defineStore } from "pinia";
import { ref, watch } from "vue";
import AES from "crypto-js/aes";
import encUtf8 from "crypto-js/enc-utf8";
import alasql from "alasql";

export const useHistoryStore = defineStore("history", () => {
    if(!localStorage.getItem("ekiAppUser")) return;
    const db = ref(null);
    const needsUpgrade = ref(false);
    const allHistory = ref(null);
    const localHistoryLoaded = ref(false);  
    const {token, key} = JSON.parse(localStorage.getItem("ekiAppUser"));
    if (navigator.onLine){
        fetch(`${import.meta.env.VITE_API_URL}/offline/get-history-version`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(async(historyVersion)=>{
            const {version} = JSON.parse(await historyVersion.text());
            dbEvents(window.indexedDB.open("ekiDB-history", version>0?version+1:1));
        }).catch(()=>{
            dbEvents(window.indexedDB.open("ekiDB-history"));        
        });
    }else{
        dbEvents(window.indexedDB.open("ekiDB-history"));        
    }

    async function dbEvents(indexDB){
        indexDB.onupgradeneeded = async function(event) {
            if(!event.target.transaction.objectStoreNames.contains("history")){
                await createIndex(event.target.result,"history");
            }
            
            needsUpgrade.value = true;
        }    
        indexDB.onsuccess = async function (event) {
            db.value = event.target.result;
            if(!needsUpgrade.value){
                return;
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL}/offline/get-history`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + token
                }
            });
            
            const songs = JSON.parse(AES.decrypt(await response.text(), key).toString(encUtf8));

            await createIndexedDB(db.value,"history",songs);
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
        let tx = db.value.transaction('history');
        let store = tx.objectStore('history');
        let historyDB = store.getAll();
        historyDB.onsuccess = function(event) {
            allHistory.value = event.target.result; 
            localHistoryLoaded.value = true;
        }
   }

    function getData(page, limit=30, params){
        let sorting = 'a.history.rate DESC';
        let fixLimit = limit ?? 30;
        if (params.sortBy) {
            switch (params.sortBy) {
                case "num":
                sorting = `a.num ${params.sortingOrder ?? "DESC"}`;
                break;
                case "title":
                sorting = `a.title ${params.sortingOrder ?? "DESC"}`;
                break;
                case "gen":
                sorting = `\`a.gen.name\` ${params.sortingOrder ?? "DESC"}`;
                break;
                case "artista":
                sorting = `\`a.art.name\` ${params.sortingOrder ?? "DESC"}`;
                break;
            }
        }        

        let dataAux = alasql(`SELECT * FROM ? a
            ORDER BY ${sorting}
            LIMIT ${fixLimit} OFFSET ${(page-1)*fixLimit}`, [allHistory.value]);        
        return dataAux
    }

    async function saveHistory(song){
        const transaction = db.value.transaction("history", "readwrite");
        const objectStore = transaction.objectStore("history");
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
        //save on localstorage for later sync when internet is online
        await registration.sync.register(`history-${song.id}:${song.history.rate}`);
    }
    
    return { saveHistory, getData, allHistory }
});