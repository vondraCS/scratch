import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../main/ipc/channels';
import { Track, UserData } from '../main/types/datatypes';

contextBridge.exposeInMainWorld('electronAPI', {
  getStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_STORAGE_DIR),
  setStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_STORAGE_DIR),
  scanLibrary: (): Promise<Track[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_LIBRARY),
  getTracks: (): Promise<Track[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_TRACKS),
  getStoreData: (key: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_KEY_FROM_STORE, key),
  parseRecentlyPlayed: (): Promise<string[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.PARSE_RECENTLY_PLAYED),
});
