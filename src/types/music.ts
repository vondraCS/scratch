export interface Track {
  filePath: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  duration: number;       // seconds
  trackNumber: number | null;
  year: number | null;
  genre: string | null;
  coverArt: string | null; // base64 data URI or null
}

export interface Album {
  name: string;
  artist: string;
  year: number | null;
  coverArt: string | null;
  tracks: Track[];
}

export interface Playlist {
  name: string;
  description: string;
  coverArt: string | null;
  tracks: Track[];
}

interface StoreData {
  filePath: string;
  favoriteAlbums: {
    name: string;
    path: string;
  }[];
  favoritePlaylists: {
    name: string;
    path: string;
  }[];
  recentlyPlayed: {
    type: "album" | "playlist";
    name: string;
    path: string;
    lastPlayed: string;
  }[];
  [key: string]: any;
}