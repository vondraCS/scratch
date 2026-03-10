import { Track } from './music';

interface ElectronAPI {
  getStorageDirectory: () => Promise<string | null>;
  setStorageDirectory: () => Promise<string | null>;
  scanLibrary: () => Promise<Track[]>;
  getTracks: () => Promise<Track[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
