import { defineStore } from "pinia";
import { ref, watch } from "vue";
import alasql from "alasql";
import { useDatabaseStore } from "@/stores/database";

export const useArtistasStore = defineStore("artistas", () => {
    const databaseX = useDatabaseStore();
    const allArtistas = ref(null);
    const localSongsLoaded = ref(false);
   
    watch(
        () => databaseX.db,
        (connection) => {
          if(connection){
            load();
          }
        },
        { deep: true }
    );

   function load(){
        const artistaStore = databaseX.getStore("artistas");
        const artistasDB = artistaStore.getAll();
        artistasDB.onsuccess = function(event) {
            allArtistas.value = event.target.result; 
            localSongsLoaded.value = true;
        }

   }
    function getAllArtistasWithSongsCount(songs,page, limit=30, params){
        limit=limit??30;
        if(params && params.name){
          return alasql(`SELECT a.id, a.name, a.image, COUNT(s2.id) as songsCount FROM ? a 
                join ? s2 on s2.artista = a.id
                WHERE a.keywords LIKE '%${params.name}%'
                GROUP by a.id, a.name, a.image
                limit ${limit} offset ${(page-1)*limit}`, [allArtistas.value, songs]);
        }else{
          return alasql(`SELECT a.id, a.name, a.image, COUNT(s2.id) as songsCount FROM ? a 
                join ? s2 on s2.artista = a.id
                GROUP by a.id, a.name, a.image
                limit ${limit} offset ${(page-1)*limit}`, [allArtistas.value, songs]);

        }
        
    }
    function getArtistaDetail(id, songs){

      return alasql(`SELECT a.id, a.name, a.image, COUNT(s2.id) as songsCount FROM ? a 
                join ? s2 on s2.artista = a.id
                where a.id = ?
                GROUP by a.id, a.name, a.image
                limit 1`, [allArtistas.value, songs, id]);

    }
    function getAllArtistasSearch(){
        return alasql(`SELECT name FROM ? a`, [allArtistas.value]);
    }
    return { allArtistas, getAllArtistasWithSongsCount,localSongsLoaded, getArtistaDetail, getAllArtistasSearch };
});