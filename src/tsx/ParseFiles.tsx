import { GetStorageDirectory } from "./Storage/Storage";
import * as fs from 'fs';

function ParseAlbumInfo(filePath: string){
    //const filePath = GetStorageDirectory();

    fs.readFile(filePath, (err, buffer) => {
        if(err) throw err;
        
        console.log(buffer);
    });
}

function ParsePlaylistInfo(){

}

function GetAlbumTracks(){

}

function GetPlaylistTracks(){

}