// File parsing utilities — all fs operations go through IPC (see src/ipc/handlers.ts).
// These functions are stubs to be implemented once the relevant IPC channels are added.

export async function ParseAlbumInfo(_filePath: string): Promise<void> {
  // TODO: invoke IPC channel to read and parse album metadata
}

export async function ParsePlaylistInfo(_filePath: string): Promise<void> {
  // TODO: invoke IPC channel to parse playlist file
}

export async function GetAlbumTracks(_albumPath: string): Promise<string[]> {
  // TODO: invoke IPC channel to list tracks in album directory
  return [];
}

export async function GetPlaylistTracks(_playlistPath: string): Promise<string[]> {
  // TODO: invoke IPC channel to get tracks from playlist
  return [];
}
