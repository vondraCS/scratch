import { ipcMain, dialog, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IPC_CHANNELS } from './channels';

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

export function getStorageDirectory(): string | null {
  const data = readStore();
  return data.filePath || null;
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

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_STORAGE_DIR, () => getStorageDirectory());
  ipcMain.handle(IPC_CHANNELS.SET_STORAGE_DIR, () => setStorageDirectory());
}
