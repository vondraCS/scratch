import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './ipc/channels';

contextBridge.exposeInMainWorld('electronAPI', {
  getStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_STORAGE_DIR),
  setStorageDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SET_STORAGE_DIR),
});
