import { defineStore } from "pinia";
import { ref } from "vue";
export const useDatabaseStore = defineStore("database", () => {
    const db = ref(null);
    const needsUpgrade = ref(false);
    dbEvents(window.indexedDB.open("ekiDB-v2"));
 

    async function dbEvents(indexDB){
        indexDB.onupgradeneeded = async function(event) {
            const db = event.target.result;
            
            const objectStores = event.target.transaction.objectStoreNames;
            if(!objectStores.contains("songs")){
                await createIndex(db,"songs");
            }
            if(!objectStores.contains("artistas")){
                await createIndex(db,"artistas");
            }
            if(!objectStores.contains("generos")){
                await createIndex(db,"generos");
            }
            needsUpgrade.value = true;
        }
        indexDB.onsuccess = async function (event) {
            db.value = event.target.result;
        };
    }
    
        function createIndex(db,name){
            const objectStore = db.createObjectStore(name, { keyPath: "id" });
            objectStore.createIndex("id", "id", { unique: true });
        }
        function getStore(name){
            const transaction = db.value.transaction(name, "readwrite");
            const artistaStore = transaction.objectStore(name);
            return artistaStore;
        }
        async function addDataToIndexDB(name, data){
            const transaction = db.value.transaction(name, "readwrite");
            const objectStore = transaction.objectStore(name);
            await objectStore.put(data);
            console.log("done!");
        }
        function deleteSongFromIndexDB(id){
            const transaction = db.value.transaction("songs", "readwrite");
            const store = transaction.objectStore("songs");
            store.delete(id)

        }
    
    return { db, getStore, addDataToIndexDB, deleteSongFromIndexDB };
});