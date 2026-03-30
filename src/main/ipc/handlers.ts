import { ipcMain, dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IPC_CHANNELS } from './channels';
import { Track, Playlist, UserData } from '../types/datatypes';


//---------------DATA STORING--------------------------------------------------------------------------------------

//gets the stored filepath from files
function getStorePath(): string {
  return path.join(app.getPath('userData'), 'store.json');
}

//reads the info in store, returning a blank StoreData type if its null
function readStore(): UserData {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    return JSON.parse(raw) as UserData;
  } catch {
    return { filePath: '', favoriteAlbums: [], favoritePlaylists: [], recentlyPlayed: [] };
  }
}

//writes to the stored data and sets it to the param input
function writeStore(data: UserData): void {
  fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2));
}

//gets specific key from stored UserData
async function getKeyFromDataStore(key: string): Promise<string | string[][]>{
  const data: UserData = readStore();
  if(data[key]) return data[key];
  return "";
}



//gets the filepath (where music is stored) from the stored UserData
export async function getStorageDirectory(): Promise<string | null> {
  const data = readStore();
  if (data.filePath) return data.filePath;
  // No directory stored — prompt the user to pick one
  return setStorageDirectory();
}

//sets the filepath (where music is stored) into stored UserData
export async function setStorageDirectory(): Promise<string | null> {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] }); //opens the folder select menu
  if (result.canceled) return null;

  const dir = result.filePaths[0];
  const data = readStore();
  data.filePath = dir;
  writeStore(data);

  return dir;
}
//-----------------------------------------------------------------------------------------------------------------

/*

Whats needed:
- parse m3u files to playlists/albums, and get the songs in each
    - ParseMP3ToPlaylistObject
- parse mp3 files to songs
    - ParseMP3ToTrackObject
- turn parsed files into react components (renderer)
    - ParseObjectToPlaylistHorzCard
    - ParseObjectToPlaylistImageCard
    - ParseObjectToCompactCard
    - ParseObjectToAlbumCard
- update the homepage's react components (renderer)
    - RefreshRecentlyPlayed
    - RefreshRecentlyPlayedAlbums
    - RefreshRecentlyPlayedPlaylists
- update the sidebar's react components (renderer)
    - RefreshSidebarPlaylists
    - RefreshSidebarAlbums
- store the currently played song, and the timeframe
    - StoreCurrentlyPlayedSong
    - GetCurrentlyPlayedSong
- update the playerbar with the currently played song (renderer)
    - RefreshPlayerBar
- Add/remove songs from queue
    - AddSongToQueue
    - RemoveSongFromQueue
    - PopNextSong
    - ClearQueue
- Player Buttons
    - SkipToNextTrack
    - RestartTrack
    - SkipToLastTrack
    - ShuffleSongs (on/off: boolean)
- update m3u files with new songs or removed songs
    - AddSongToM3U
    - RemoveSongFromM3U
    - SetM3USongs
*/






//sets the IPC handlers to allow cross-channel communication (renderer <--> main)
export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_STORAGE_DIR, () => getStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SET_STORAGE_DIR, () => setStorageDirectory());
  //ipcMain.handle(IPC_CHANNELS.SCAN_LIBRARY, () => scanLibrary());
  //ipcMain.handle(IPC_CHANNELS.GET_TRACKS, () => getTracks());
  ipcMain.handle(IPC_CHANNELS.GET_KEY_FROM_STORE, (_, key: string) => getKeyFromDataStore(key));
  //ipcMain.handle(IPC_CHANNELS.PARSE_RECENTLY_PLAYED, () => parseRecentlyPlayed());
}
