import { Track } from './music';

interface StoreData {
  filePath: string;
  favoriteAlbums: string[];
  favoritePlaylists: string[];
  recentlyPlayed: string[];
}

interface ElectronAPI {
  getStorageDirectory: () => Promise<string | null>;
  setStorageDirectory: () => Promise<string | null>;
  scanLibrary: () => Promise<Track[]>;
  getTracks: () => Promise<Track[]>;
  getStoreData: (key: string) => Promise<string | null>;
  parseRecentlyPlayed: () => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
