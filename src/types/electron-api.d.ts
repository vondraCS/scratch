interface ElectronAPI {
  getStorageDirectory: () => Promise<string | null>;
  setStorageDirectory: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
