export const IPC_CHANNELS = {
  GET_STORAGE_DIR: 'storage:get-dir',
  SET_STORAGE_DIR: 'storage:set-dir',
  SCAN_LIBRARY: 'library:scan',
  GET_TRACKS: 'library:get-tracks',
  GET_STORE_DATA: 'storage:read',
  PARSE_RECENTLY_PLAYED: 'library:parse-recently-played',
} as const;
