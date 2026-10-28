import { useRequesterStore } from '@/stores/requester';
import { useUtilsStore } from "@/stores/utils";
import { useBinarySongStore } from "@/stores/binarySongs";
import { useUserStore } from "@/stores/user";
export function useBackgroundFetch() {
    const requesterX = useRequesterStore();
    const utilsX = useUtilsStore();
    const binarySongX = useBinarySongStore();
    const userX = useUserStore();
    const downloadSong = (songDetail) => {
        const { jwt, song } = songDetail;
        const {num, hasVoice, title, id} = song;
        const fileName = `ECK ${num}`;
        if(userX.localSongs.includes(`${fileName}.eck`)){
            utilsX.setNotif({
                title: "song.storage",
                message: "song.alreadyDownloaded",
                type: "info",
                timeVisible: 10,
                position: "top-center",
            });
            return;
        }
        navigator.serviceWorker.ready.then(async (swReg) => {
            try{
                let files = [`${import.meta.env.VITE_PLAYER_URL}/download-audio/${num}?auth=${jwt}&type=audio`];
                if(hasVoice){
                    files.push(`${import.meta.env.VITE_PLAYER_URL}/download-audio/${num}?auth=${jwt}&type=voice`);
                }
                const bgFetch = await swReg.backgroundFetch.fetch(
                        id,
                        files,
                        {
                            title: title,
                            icons: [
                                {
                                    sizes: "300x300",
                                    src: '/images/offline-default/0.webp',
                                    type: "image/webp",
                                },
                            ],
                        },
                    )
                if (bgFetch) {
                    //save pista
                    fetch(files[0])
                        .then(async(response) => {
                            const arrayBuffer = await response.arrayBuffer();
                            await saveFile(arrayBuffer, `${fileName}.eck`);
                        })
                        .catch((error) => console.error(error.message));
                     if(hasVoice){
                        //download voice
                        fetch(files[1])
                        .then(async(response) => {
                            const arrayBuffer = await response.arrayBuffer();
                            await saveFile(arrayBuffer, `${num}.eck`);
                        })
                        .catch((error) => console.error(error.message));                        
                    }
                    await requesterX.Post({
                        route: `/create-donwloaded/${id}`,
                        withAuth: true,
                        body: {}
                    });
                    userX.localSongs.push(`${fileName}.eck`);
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
                    utilsX.setNotif({
                        title: "song.storage",
                        message: "song.maxDownloadReached",
                        type: "error",
                        timeVisible: 10,
                        position: "top-center",
                    });
                }else{
                    utilsX.deffaultError();
                }
            }
        });
    }
    const saveFile = async (data,name) => {
        //all data will be saved in indexdb
        return binarySongX.saveFileIndexDB(data,name);
    }
    
    const getLocalFile = async (song) => {

        const {num} = song;
        const data = await binarySongX.loadSongData(num);
        return data;
    }
    
    const getAllDownloadedSongs = async () => {
        return binarySongX.allBinarySongs;
    }
    const removeLocalFile = async (song) => {
        const {num, id} = song;
        //remove from indexedDB
        binarySongX.removeSongData(num);
    }

    return {downloadSong,getLocalFile, getAllDownloadedSongs, removeLocalFile};
}
