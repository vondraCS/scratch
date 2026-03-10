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
