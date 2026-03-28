import { Track, Album } from '../../main/types/datatypes';
import { PlaylistCompactCard } from './Components/Cards';

/**
 * Scan the storage directory for audio files, parse metadata, and return all tracks.
 */
export async function scanLibrary(): Promise<Track[]> {
  return window.electronAPI.scanLibrary();
}

/**
 * Return the cached track list from the most recent scan.
 */
export async function getTracks(): Promise<Track[]> {
  return window.electronAPI.getTracks();
}

/**
 * Group a flat track list into Album objects, sorted alphabetically by album name.
 */
export function groupTracksByAlbum(tracks: Track[]): Album[] {
  const albumMap = new Map<string, Album>();

  for (const track of tracks) {
    const key = `${track.album}|||${track.albumArtist}`;

    if (!albumMap.has(key)) {
      albumMap.set(key, {
        name: track.album,
        artist: track.albumArtist,
        year: track.year,
        coverArt: track.coverArt,
        tracks: [],
      });
    }

    const album = albumMap.get(key)!;
    album.tracks.push(track);

    // Use cover art from whichever track has it
    if (!album.coverArt && track.coverArt) {
      album.coverArt = track.coverArt;
    }
    // Use the earliest year
    if (track.year && (!album.year || track.year < album.year)) {
      album.year = track.year;
    }
  }

  // Sort tracks within each album by track number
  for (const album of albumMap.values()) {
    album.tracks.sort((a, b) => (a.trackNumber ?? 999) - (b.trackNumber ?? 999));
  }

  // Sort albums alphabetically
  return Array.from(albumMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function parseRecentlyPlayed(): Promise<string[]>{
  console.log("firing parse");
  return window.electronAPI.parseRecentlyPlayed();
}

