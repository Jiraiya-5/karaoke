import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useDatabaseStore } from "@/stores/database";
import alasql from "alasql";

export const useAllSongsStore = defineStore("allSongs", () => {

    const allSongs = ref(null);
    const allGeneros = ref(null);
    const allArtistas = ref(null);
    const localSongsLoaded = ref(false);

    const databaseX = useDatabaseStore();
    
    watch(() => databaseX.db, (connection) => {
        if(connection){
            load();
        }},{ deep: true });

    function load(){
        // Songs
        const songStore = databaseX.getStore("songs");
        const songsDB = songStore.getAll();
        songsDB.onsuccess = function(event) {
            allSongs.value = event.target.result;
            localSongsLoaded.value = true;
        }
        //
        const artistaStore = databaseX.getStore("artistas");
        const artistasDB = artistaStore.getAll();
        artistasDB.onsuccess = function(event) {
            allArtistas.value = event.target.result; 
            localSongsLoaded.value = true;
        }
        //
        const generoStore = databaseX.getStore("generos");
        const generosDB = generoStore.getAll();
        generosDB.onsuccess = function(event) {
            allGeneros.value = event.target.result; 
            localSongsLoaded.value = true;
        }                
    }

   function getAllSongs(params){
    try {

      let query = params.search;
      let queryFix, numFix, sqlSong, sqlArt, sqlGene;

      if (containsOnlyDigits(query) === true) {
        numFix = parseInt(query);
      } else {
        queryFix = query;
      }      

      if (numFix) {
        sqlSong = 'SELECT * FROM ? s \
        WHERE s.num = ' + numFix + '\
        LIMIT 5';
        
        let dataSong = alasql(sqlSong, [allSongs.value]);
  
        return  {
          songs: dataSong
        };

      } else if (queryFix.length > 0) {
        let fixquery = `%${queryFix ? queryFix.toLowerCase().replace(/\s+/g, "").normalize('NFD').replace(/[\u0300-\u036f]/g, '') : ""}%`;

        sqlSong = 'SELECT * FROM ? s WHERE s.keywords LIKE "' + fixquery + '" LIMIT 5';

        sqlArt = 'SELECT * FROM ? a WHERE a.keywords LIKE "' + fixquery + '" LIMIT 5';

        sqlGene = 'SELECT * FROM ? g WHERE g.keywords LIKE "' + fixquery + '" LIMIT 5';

        let dataSong = alasql(sqlSong, [allSongs.value]);
        let dataArt = alasql(sqlArt, [allArtistas.value]);
        let dataGene = alasql(sqlGene, [allGeneros.value]);
  
        return  {
          artists: dataArt,
          genres: dataGene,
          songs: dataSong
        };        

      } else {
        let sqlAllS = 'SELECT * FROM ? s \
        ORDER BY s.rate DESC \
        LIMIT 6';

        let sqlAllSV = alasql(sqlAllS, [allSongs.value]);

        let sqlAllG = 'SELECT * FROM ? g \
        ORDER BY g.rate DESC\
        LIMIT 5';

        let sqlAllGV = alasql(sqlAllG, [allGeneros.value]);
        
        return {
          recentlyPlayed: sqlAllSV,
          genres: sqlAllGV
        }
      }
      

    } catch (error) {
      console.error(error)
    }
   }

   function containsOnlyDigits(str) {
    return /^\d+$/.test(str);
   }   

    return { localSongsLoaded, getAllSongs };
});