import { contextBridge, dialog } from 'electron';
import * as fs from 'fs';


let storageDirectory: string | null = null;

const StorageJSON: string = './src/tsx/Storage/store.json';
interface savedData {
  filePath: string;
  favoriteAlbums: string[];
  favoritePlaylists: string[];
  [key: string]: any;
}

function _setupStore(){
  let data: savedData = {
      filePath: '',
      favoriteAlbums: [],
      favoritePlaylists: []
    };

  fs.writeFile(StorageJSON, JSON.stringify(data), (err) => {
          if (err) throw err;
        });
}

function _storeFilePath(filePath: any){
  try{
    //default data
    let data: savedData = {
      filePath: '',
      favoriteAlbums: [],
      favoritePlaylists: []
    };
    //check against current data, rewrite over default data
    fs.readFile(StorageJSON, (err, readData) => {
        if (err) throw err;
        if(readData.length != 0){
          Object.assign(data, JSON.parse(readData.toString()) as savedData);
        }

        data.filePath = filePath;
        
        fs.writeFile(StorageJSON, JSON.stringify(data), (err) => {
          if (err) throw err;
        });
    });
    
  }catch(err){
    console.error('error occured: ', err)
  }
}

//get file path
function _loadFilePathFromStore(): Promise<void> {
   return new Promise((resolve) => {
    try{
      fs.readFile(StorageJSON, async (err, readData) => {
          if (err) throw err;
          if(readData.length != 0){
            const parsed = JSON.parse(readData.toString()) as savedData;
            const newPath = parsed['filePath'];
            storageDirectory = newPath;
          }else{ //if no data, get data from user
            await SetStorageDirectory();
          }
          resolve();
      });
      
    }catch(err){
      console.error('error occured: ', err)
      resolve();
    }
   });
}

/*
export const StoreFilePath = (newPath: string) => { 
  _storeFilePath(newPath);
}*/

export const SetStorageDirectory = async () => {     
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });


  if (!result.canceled){
    storageDirectory = result.filePaths[0];
    _storeFilePath(storageDirectory);
    return storageDirectory;
  }
  
  return undefined;
};

export const GetStorageDirectory = async () => {
  if (!storageDirectory){
    await _loadFilePathFromStore();
  }
  return storageDirectory;
}