import { defineStore } from "pinia";
import { ref, watch } from "vue";
import alasql from "alasql";
import { useDatabaseStore } from "@/stores/database";
export const useGenerosStore = defineStore("generos", () => {
    const allGeneros = ref(null);
    const localSongsLoaded = ref(false);
    const databaseX = useDatabaseStore();
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
        const generoStore = databaseX.getStore("generos");
        const generosDB = generoStore.getAll();
        generosDB.onsuccess = function(event) {
            allGeneros.value = event.target.result; 
            localSongsLoaded.value = true;
        }
    }

    function getAllGenerosWithSongsCount(songs,page, limit=30, params){
        limit=limit??30;

        if(params && params.name){
          return alasql(`SELECT g.id, g.name, g.image, COUNT(s2.id) as songsCount FROM ? g 
                join ? s2 on s2.genero = g.id
                 WHERE g.keywords LIKE '%${params.name}%'
                GROUP by g.id, g.name, g.image
                limit ${limit} offset ${(page-1)*limit}`, [allGeneros.value, songs]);
        }else{
          return alasql(`SELECT g.id, g.name, g.image, COUNT(s2.id) as songsCount FROM ? g 
                join ? s2 on s2.genero = g.id
                GROUP by g.id, g.name, g.image
                limit ${limit} offset ${(page-1)*limit}`, [allGeneros.value, songs]);

        }
    }
    function getGeneroDetail(id, songs){

      return alasql(`SELECT g.id, g.name, g.image, COUNT(s2.id) as songsNumber FROM ? g 
                join ? s2 on s2.genero = g.id
                where g.id = ? 
                GROUP by g.id, g.name, g.image
                limit 1`, [allGeneros.value, songs, id]);
    }
    function getAllGenerosSearch(){
        return alasql(`SELECT name FROM ? g`, [allGeneros.value]);
    }
    return { allGeneros,getAllGenerosWithSongsCount, localSongsLoaded, getGeneroDetail, getAllGenerosSearch };
});