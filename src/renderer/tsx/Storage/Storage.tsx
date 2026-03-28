export async function GetStorageDirectory(): Promise<string | null> {
  return window.electronAPI.getStorageDirectory();
}

export async function SetStorageDirectory(): Promise<string | null> {
  return window.electronAPI.setStorageDirectory();
}
