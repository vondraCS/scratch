import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './ipc/channels';
import { Track } from './types/music';

contextBridge.exposeInMainWorld('electronAPI', {
  getStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_STORAGE_DIR),
  setStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_STORAGE_DIR),
  scanLibrary: (): Promise<Track[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SCAN_LIBRARY),
  getTracks: (): Promise<Track[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_TRACKS),
});
