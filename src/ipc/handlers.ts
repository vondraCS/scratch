import { ipcMain, dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IPC_CHANNELS } from './channels';
import { Track, Playlist } from '../types/music';
import { connect } from 'http2';

// ── Store persistence ──────────────────────────────────────────────

/*
filepath is where the songs/playlists/albums are stored
favoriteAlbums/favoritePlaylists/recentlyPlayed are 
  - the relative filepath of each file, relative to filepath
  - point to an m3u file
*/

interface PlaylistInfo{
  filePath: string;
  name: string;
  cover: string;
  artistName: string | null;
  year: number | null
  description: string | null;
}

interface StoreData {
  filePath: string;
  favoriteAlbums: [
    filePath: string,
    name: string,
    cover: string,
    artistName: string,
    year: number,
  ];
  favoritePlaylists: [
    filePath: string,
    name: string,
    cover: string,
    description: string,
  ];
  recentlyPlayed: PlaylistInfo[];
  [key: string]: any;
}
/*
interface compactCardInfo{
    type: "album" | "playlist";
    name: string;
    cover: string;
    filepath: string;
    [key: string]: string;
}*/


function getStorePath(): string {
  return path.join(app.getPath('userData'), 'store.json');
}

function readStore(): StoreData {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    return JSON.parse(raw) as StoreData;
  } catch {
    return { filePath: '', favoriteAlbums: ["", "", "", "", 0], favoritePlaylists: ["", "", "", ""], recentlyPlayed: [] };
  }
}

function writeStore(data: StoreData): void {
  fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2));
}

export async function getStorageDirectory(): Promise<string | null> {
  const data = readStore();
  if (data.filePath) return data.filePath;
  // No directory stored — prompt the user to pick one
  return setStorageDirectory();
}

export async function setStorageDirectory(): Promise<string | null> {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return null;

  const dir = result.filePaths[0];
  const data = readStore();
  data.filePath = dir;
  writeStore(data);

  return dir;

}

//Library scanning vvvvvvvvv

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.aac', '.wav', '.flac', '.alac', '.aiff', '.dsd', '.m4a', '.opus'
]);

/** In-memory cache of the most recent scan. */
let cachedTracks: Track[] = [];
let cachedPlaylists: Playlist[] = [];

/**
 * Recursively collect all file paths under `dir` that have an audio extension.
 */
function collectAudioFiles(dir: string): string[] {
  const results: string[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // Permission error or missing dir — skip silently
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectAudioFiles(fullPath));
    } else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Parse a single audio file and return a Track object.
 */
async function parseTrack(filePath: string): Promise<Track> {
  const fallbackTitle = path.basename(filePath, path.extname(filePath));

  try {
    // Dynamic import — music-metadata is ESM-only
    const { parseFile } = await import(/* webpackIgnore: true */ 'music-metadata');
    const metadata = await parseFile(filePath);
    const { common, format } = metadata;

    // Build a base64 data URI from the first embedded picture, if any.
    let coverArt: string | null = null;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const base64 = Buffer.from(pic.data).toString('base64');
      coverArt = `data:${pic.format};base64,${base64}`;
    }

    return {
      filePath,
      title: common.title || fallbackTitle,
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      albumArtist: common.albumartist || common.artist || 'Unknown Artist',
      duration: format.duration ?? 0,
      trackNumber: common.track?.no ?? null,
      year: common.year ?? null,
      genre: common.genre?.[0] ?? null,
      coverArt,
    };
  } catch {
    // If metadata parsing fails, return a track with filename-based defaults.
    return {
      filePath,
      title: fallbackTitle,
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      albumArtist: 'Unknown Artist',
      duration: 0,
      trackNumber: null,
      year: null,
      genre: null,
      coverArt: null,
    };
  }
}

/*
  Scan the storage directory, parse every audio file, cache results, and return them.
*/
async function scanLibrary(): Promise<Track[]> {
  const dir = await getStorageDirectory();
  if (!dir) return [];

  const audioPaths = collectAudioFiles(dir);
  const tracks = await Promise.all(audioPaths.map(parseTrack));

  // Sort by album, then track number, then title
  tracks.sort((a, b) => {
    const albumCmp = a.album.localeCompare(b.album);
    if (albumCmp !== 0) return albumCmp;
    const aNum = a.trackNumber ?? 999;
    const bNum = b.trackNumber ?? 999;
    if (aNum !== bNum) return aNum - bNum;
    return a.title.localeCompare(b.title);
  });

  cachedTracks = tracks;
  return tracks;
}

/*
  Return the cached tracks from the most recent scan.
*/
function getTracks(): Track[] {
  return cachedTracks;
}
function getPlaylists(): Playlist[]{
  return cachedPlaylists;
}

function getPlaylistFromName(name: string): Playlist{
  const cache: Playlist[] = cachedPlaylists;
  for(const pl of cache){
    if(pl.name == name){
      return pl;
    }
  }
  return null;
}

async function getStoreData(key: string): Promise<string | string[][]>{
  const data: StoreData = readStore();
  if(data[key]) return data[key];
  return null;
}

/*
function getM3UFromRelativePath(trackPath: string){
  const data: StoreData = readStore();
  const fullPath = path.join(data.filePath, trackPath);

 //const file = 

  return fs.readFileSync(fullPath, 'utf-8');;
}



function arrayToParsedPlaylistInfo(arr: string[][]) : compactCardInfo[] {
  let result:compactCardInfo[];

  for(const item of arr){
    //const file = getM3UFromRelativePath(filePath);
    let el: parsedInfo;
    for(const info of item){
      /*  type: "album" | "playlist";
          path: string;               
      
      if(info == "album" || info == "playlist"){
        el.type = info;
        continue;
      }

      //parse the rest of the info from the dir-relative filepath
      const restOfInfo = parsePlaylist(info, el);
      rest
    }

    result.unshift(el);
  }

  return result;
}*/

function addToRecentlyPlayed() : void{

}

async function getRecentlyPlayed() : Promise<string[][]>{
  return await getStoreData("recentlyPlayed") as string[][];
}

async function parseRecentlyPlayed(): Promise<string[]>{
  /*
    parse recently played: return all of the necessary info to create the recently played card components
    necessary info: title, cover, and a reference/pointer or sumn to open the playlist/album page
    but before that is done:

    recentlyplayed has to be init properly
    on new user, recentlyplayed will be empty, therefore hide it
    hold a max of 4 albums/playlists, if less, then only show that many

    recentlyplayed will be saved to the datastore along with favorite albums/playlist and the directory that all music is held
    any time an album is called, recently played will be added to
    adding to recently played will be treated like a stack, with a max capacity of 4, anything past that is cut
    when adding to recentlyadded, insert at beginning, then remove end

    in recentlyplaued all we need to keep track of is 
      - filepath
      - type (album or playlist)
    everything else (cover, name, tracks, etc) can be parsed from the file, 
    the file (an m3u) will be attained from joining the path of directory with the filepath

    so the functions we will need is

    addToRecentlyPlayed(): add to recentlyplayed, cut any extra
    getRecentlyPlayed(): get the current recentlyplayed
    parseRecentlyPlayed(): turns recentlyplayed into an array consisting of the following info, for each element in recentlyplayed
    {
      type: album or playlist
      name: title to display on the card
      cover: image to display on the card
      filepath: as a reference to make it clickable later
    }


    this is all just for the recently played compact cards^^
    i will also need to do this for the playlist specific cards, and the albums specific cards, 
    so i should create functions that are reusable

    for playlist-specific cards i will need:
    {
      name: title to display on the card
      cover: image to display on the card
      filepath: as a reference to make it clickable later
    }

    for album-specific cards i will need:
    {
      name: title to display on the card
      cover: image to display on the card
      year: the year the album was made
      artist name: the name of the artist
      filepath: as a reference to make it clickable later
    }

    for the page that will show the albums and playlists i will need
    - title
    - description (playlists)
    - year (albums)
    - cover
    - all the tracks
    - #songs (can be calculated)
    - artist name (albums)
    - run time (can be calculated)


    so if i were to make this one type i would need
    {
      file path (m3u with all the tracks n stuff)
      name/title
      cover
      artistname
      year
      description
    }



  */
  console.log("parsing...");
  interface parsedInfo{
    type: "album" | "playlist";
    name: string;
    cover: string;
    filepath: string;
    [key: string]: string;
  }

  const recentlyPlayed: string[][] = await getRecentlyPlayed();
  const parsedInfo = arrayToParsedPlaylistInfo(recentlyPlayed);

  console.log(parsedInfo);

  return null;
}

// IPC registration vvvvvv

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_STORAGE_DIR, () => getStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SET_STORAGE_DIR, () => setStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SCAN_LIBRARY, () => scanLibrary());
  ipcMain.handle(IPC_CHANNELS.GET_TRACKS, () => getTracks());
  ipcMain.handle(IPC_CHANNELS.GET_STORE_DATA, (_, key: string) => getStoreData(key));
  ipcMain.handle(IPC_CHANNELS.PARSE_RECENTLY_PLAYED, () => parseRecentlyPlayed());
}
