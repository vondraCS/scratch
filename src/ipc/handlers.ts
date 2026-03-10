import { ipcMain, dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IPC_CHANNELS } from './channels';
import { Track } from '../types/music';

// ── Store persistence ──────────────────────────────────────────────

interface StoreData {
  filePath: string;
  favoriteAlbums: string[];
  favoritePlaylists: string[];
}

function getStorePath(): string {
  return path.join(app.getPath('userData'), 'store.json');
}

function readStore(): StoreData {
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8');
    return JSON.parse(raw) as StoreData;
  } catch {
    return { filePath: '', favoriteAlbums: [], favoritePlaylists: [] };
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

// ── Library scanning ───────────────────────────────────────────────

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.flac', '.ogg', '.wav', '.m4a', '.aac', '.wma', '.opus',
]);

/** In-memory cache of the most recent scan. */
let cachedTracks: Track[] = [];

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

/**
 * Scan the storage directory, parse every audio file, cache results, and return them.
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

/**
 * Return the cached tracks from the most recent scan.
 */
function getTracks(): Track[] {
  return cachedTracks;
}

// ── IPC registration ───────────────────────────────────────────────

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_STORAGE_DIR, () => getStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SET_STORAGE_DIR, () => setStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SCAN_LIBRARY, () => scanLibrary());
  ipcMain.handle(IPC_CHANNELS.GET_TRACKS, () => getTracks());
}
