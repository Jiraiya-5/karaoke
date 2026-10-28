import { useRequesterStore } from '@/stores/requester';
import { useUtilsStore } from "@/stores/utils";
import { useUserStore } from "@/stores/user";
import {useDecrypt} from '@/composables/useDecrypt'
import { writeTextFile, BaseDirectory, exists, mkdir, writeFile, readDir, remove, readFile, readTextFile } from '@tauri-apps/plugin-fs';
import * as path from '@tauri-apps/api/path';
import { useDatabaseStore } from "@/stores/database";
import {ref} from 'vue';
export function useTauriFetchApi() {
    const cancelDownload = ref(false);
    const requesterX = useRequesterStore();
    const utilsX = useUtilsStore();
    const userX = useUserStore();
    const databaseX = useDatabaseStore();
    const {decryptAudio} = useDecrypt();
    const fileDir = "H0cTSfV9knEl";
    const downloadSong = async(songDetail, showMessage=true) => {
        const { jwt, song } = songDetail;
        const {num, hasVoice, title, id} = song;
        const fileName = `ECK ${num}`;
        if(userX.localSongs.includes(`${fileName}.eck`)){
            if(showMessage){
                utilsX.setNotif({
                    title: "song.storage",
                    message: "song.alreadyDownloaded",
                    type: "info",
                    timeVisible: 10,
                    position: "top-center",
                });

            }
            return;
        }
        try{

            const response = await fetch(
                `${import.meta.env.VITE_PLAYER_URL}/download-audio/${num}?auth=${jwt}&type=audio`
            );
            const arrayBuffer = await response.arrayBuffer();
            await saveFile(new Uint8Array(arrayBuffer), `${fileName}.eck`);
            // add to local songs
            userX.localSongs.push(`${fileName}.eck`);
            // if has voice track, download it too
            if (hasVoice) {
                const voiceRes = await fetch(
                    `${import.meta.env.VITE_PLAYER_URL}/download-audio/${num}?auth=${jwt}&type=voice`
                );
                const voiceBuffer = await voiceRes.arrayBuffer();
                await saveFile(new Uint8Array(voiceBuffer), `${num}.eck`);
            }
            if(showMessage){
                utilsX.setNotif({
                    title: title,
                    message: "song.donwloadComplete",
                    type: "success",
                    timeVisible: 5,
                    position: "top-center",
                });
            }
        }
        catch(e){
            console.error(e);
            if(e.response.status === 402){
                if(showMessage){
                    utilsX.setNotif({
                        title: "song.storage",
                        message: "song.maxDownloadReached",
                        type: "error",
                        timeVisible: 10,
                        position: "top-center",
                    });
                }
            }else{
                if(showMessage){
                    utilsX.deffaultError();
                }
            }
        }

    }
    const saveFile = async (data,name) => {
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        const dirExists = await exists(filePath);
        if(!dirExists){
            await mkdir(filePath, { recursive: true });
        }
        console.log(filePath);
        await writeFile(`${filePath}/${name}`, data);
    }
    
   
    const getLocalFile = async (song) => {
        const {num} = song;
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        const fileName = `ECK ${num}`;
        const songData = await readFile(`${filePath}/${fileName}.eck`) 
        const songBuffer = await decryptAudio(userX.apiUser.user.id,songData);
        const voiceData = await exists(`${filePath}/${num}.eck`)?await readFile(`${filePath}/${num}.eck`):null; 
        const voiceBuffer = voiceData?await decryptAudio(userX.apiUser.user.id,voiceData):null;
        return {file:songBuffer?new Blob([songBuffer],{type:'application/octet-binary'}):null, voiceFile:voiceBuffer?new Blob([voiceBuffer],{type:'application/octet-binary'}):null};
    }
   const getAllDownloadedSongs = async () => {
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        const dirExists = await exists(filePath);
        if(!dirExists){
            return [];
        }
        const entries = await readDir(filePath, {
            dir: dataDir,
            recursive: false
        });
        const songs = [];
        for (let file of entries) {
            const {name} = file;
            songs.push(name);
        }
        return songs;
    }
    const removeLocalFile = async ({num,id}) => {
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        await remove(`${filePath}/ECK ${num}.eck`, {
            dir: dataDir
        });

        const voiceExists = await exists(`${filePath}/${num}.eck`);
        //descargar voz guia si existe
        if(voiceExists){
            await remove(`${filePath}/${num}.eck`, {
                dir: dataDir
            });
        }
    }
    async function downloadFullKaraoke(maxSong, currentSong=1){
        utilsX.setNotif({
            title: "song.downloadInProgress",
            message: "song.donwloadingFullKaraoke",
            type: "warning",
            timeVisible: 5,
            position: "top-center",
        });
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        downloadNextSong(maxSong, currentSong, filePath)  
    }
    async function downloadNextSong(maxSong, currentSong, filePath, songDetail=null){
        if(!navigator.onLine){
            return
        }
        else if(cancelDownload.value){
            //TODO make it work
            
            //cancelDownload.value=false;
            await remove(`${filePath}/pending`);
            //save this file to track the last updated song
            await writeTextFile(`${filePath}/last`, JSON.stringify({
                maxSong,
                currentSong
            }))
            return
        }
        else if (currentSong > maxSong){
            //if all songs have been downloaded just stop it.
            //save this file to track the last updated song
            await remove(`${filePath}/pending`);
            await writeTextFile(`${filePath}/last`, JSON.stringify({
                maxSong,
                currentSong
            }))
            return;
        }
        
        writeDownloadProgress(maxSong, currentSong, filePath)
        //check if song is already downloaded 
        const fileName = `ECK ${currentSong}`
        const downloadPath = await path.join(filePath, `${fileName}.eck`);
        const dirExists = await exists(downloadPath);
        if(dirExists){
            return downloadNextSong(maxSong, currentSong+1, filePath);
        }
        userX.setDownloadProgress(currentSong)
        if(!songDetail){
            const {data} = await requesterX.Get({
                route: `/song-detail-by-num/${currentSong}?type=download`,
                withAuth: true,
                localAvailable: false
            });
            songDetail = data;
        }
        await downloadSong(songDetail, false);
        //validate if download was correct
        const validateDownload = await exists(downloadPath);
        if(!validateDownload){
            //retry download
            return downloadNextSong(maxSong, currentSong, filePath, songDetail);
        }
        const {song} = songDetail;
        await databaseX.addDataToIndexDB("songs", {
            ...song,
            genero: song.gen.id,
            artista: song.art.id

        });
        const {art} = song;
        await databaseX.addDataToIndexDB("artistas", {
            id: art.id,
            name: art.name,
            image: art.img,
            keywords: art.keywords,
            rate: art.rate
        });
        const {gen} = song;
        await databaseX.addDataToIndexDB("generos", {
            id: gen.id,
            name: gen.name,
            image: gen.img,
            keywords: gen.keywords,
            rate: gen.rate
        });
        downloadNextSong(maxSong, currentSong+1, filePath);
    }
    async function writeDownloadProgress(maxSong, currentSong, filePath){
        const dirExists = await exists(filePath);
        if(!dirExists){
            await mkdir(filePath, { recursive: true });
        }
        writeTextFile(`${filePath}/pending`, JSON.stringify({
            maxSong,
            currentSong
        }))
    }
    async function checkDownloadProgress(){
        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);
        const progressFile = await path.join(filePath, `pending`);
        const dirExists = await exists(progressFile);
        if(!dirExists){
            return
        }
        const content = await readTextFile(progressFile) 
        const {maxSong, currentSong} = JSON.parse(content);
        downloadFullKaraoke(maxSong, currentSong)
    }
    async function stopDownload(){
        cancelDownload.value = true;
    }

    async function writeLog(message) {

        const dataDir = await path.appDataDir();
        const filePath = await path.join(dataDir,fileDir);

        // Crear carpeta si no existe
        const dirExists = await exists(filePath);
        if (!dirExists) {
            await mkdir(filePath, { recursive: true });
        }

        const logFilePath = await path.join(filePath, "log.txt");

        // Leer contenido actual
        let currentContent = '';
        if (await exists(logFilePath)) {
            currentContent = await readTextFile(logFilePath);
        }

        // Escribir nuevo contenido
        const newContent = `${currentContent}${message}\n`;
        await writeTextFile(logFilePath, newContent);

    }
   
    return {downloadSong,getLocalFile, getAllDownloadedSongs, removeLocalFile, downloadFullKaraoke, checkDownloadProgress, stopDownload, writeLog};
}
