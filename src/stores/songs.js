import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useDatabaseStore } from "@/stores/database";
import alasql from "alasql";
export const useSongsStore = defineStore("songs", () => {
    const allSongs = ref(null);
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
        const songStore = databaseX.getStore("songs");
        const songsDB = songStore.getAll();
        songsDB.onsuccess = function(event) {
            allSongs.value = event.target.result; 
            localSongsLoaded.value = true;
        }

   }
   function getAllSongs(page, limit=30, params){
    try {
      let sorting = 'a.rate ASC';
      if (params.sortBy || params.sortingOrder ) {
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
      limit=limit??30;

      if(params && params.title){
        const fixquery = params.title.toLowerCase().replace(/\s+/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, '');
         return alasql(`SELECT * FROM ? a
          where a.keywords like '%${fixquery}%'
        ORDER BY ${sorting}
        limit ${limit} offset ${(page-1)*limit}`, [allSongs.value]);

      }else{
        return alasql(`SELECT * FROM ? a
        ORDER BY ${sorting}
        limit ${limit} offset ${(page-1)*limit}`, [allSongs.value]);
      }
    } catch (error) {
      console.error(error)
    }      
   }

   function getSearchSongs(){
    try {
      let dataAux = alasql(`SELECT title as name FROM ? a`, [allSongs.value]);
      return dataAux;
    } catch (error) {
      console.error(error)
    }      
   }

   function getSongDetail(id){
       return alasql(`SELECT * FROM ? a where id = ? limit 1`, [allSongs.value,id]);
   }
   function getSongsByArtista(artistaId, page, limit=30){
      limit=limit??30;
      return alasql(`SELECT *, a.image as img FROM ? a where artista = ? limit ${limit} offset ${(page-1)*limit}`, [allSongs.value,artistaId]);
   }
   function getSongsByGenero(generoId, page, limit=30){
    limit=limit??30;
    return alasql(`SELECT *, a.image as img FROM ? a where genero = ? limit ${limit} offset ${(page-1)*limit}`, [allSongs.value,generoId]);
 }

 
 function getAllDownloadedSongs(page, limit=30, params, localSongs){
  try {
    let sorting = 'a.rate ASC';
    if (params.sortBy || params.sortingOrder ) {
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
    
    limit=limit??30;

    let dataAux = alasql(`SELECT * FROM ? a where num = any(?)
      ORDER BY ${sorting}
      limit ${limit} offset ${(page-1)*limit}`, [allSongs.value, localSongs]);
    return dataAux;


  } catch (error) {
    console.error(error)
  }      
 }
 function getSongByNum(num){
  return alasql(`SELECT * FROM ? a where num = ? limit 1`, [allSongs.value,parseInt(num)]);
}

    return { allSongs, localSongsLoaded, getAllSongs, getSongDetail, getSongsByArtista, getSongsByGenero, getAllDownloadedSongs, getSongByNum, getSearchSongs };
});