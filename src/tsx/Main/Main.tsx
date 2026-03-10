import React, { useEffect, useState } from 'react';
import { Album } from '../../types/music';
import { scanLibrary, groupTracksByAlbum } from '../ParseFiles';
import { AlbumLargeCoverCard, PlaylistHorizontalCard, PlaylistCompactCard } from '../Components/Cards';

export function Main() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDirectory, setHasDirectory] = useState(true);

  useEffect(() => {
    async function load() {
      const dir = await window.electronAPI.getStorageDirectory();
      if (!dir) {
        setHasDirectory(false);
        setLoading(false);
        return;
      }
      const scannedTracks = await scanLibrary();
      const groupedAlbums = groupTracksByAlbum(scannedTracks);
      setAlbums(groupedAlbums);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <main id="main"><p className="subtext">Scanning library…</p></main>;
  }

  if (!hasDirectory) {
    return (
      <main id="main">
        <p className="subtext">No storage directory set. Use File → Set Storage Directory.</p>
      </main>
    );
  }

  if (albums.length === 0) {
    return (
      <main id="main">
        <p className="subtext">No audio files found in the storage directory.</p>
      </main>
    );
  }

  const gap = 15;

  // Placeholder data for playlists until we have a real playlist system
  const mockPlaylists = [
    { title: "Favorites", desc: "Your top tracks" },
    { title: "Recently Added", desc: "Newest additions" },
    { title: "Workout", desc: "Upbeat mixes" },
    { title: "Chill", desc: "Relaxing vibes" },
  ];

  return (
    <main id="main" className="rows scrollable" style={{ gap: `${gap * 2}px`, paddingTop: `${gap}px`, paddingBottom: `${gap * 2}px` }}>

      {/* Section 1: Recently Played (Albums/Playlists) -> using HorizontalCompactCard */}
      <section className="main-section" style={{}} >
        <h2 className="headertext section-header">Recently Played</h2>
        <div className="columns flex-wrap" style={{ gap: `${gap}px` }}>
          {albums.slice(0, 4).map(album => (
            <PlaylistCompactCard
              key={`recent-${album.name}`}
              text={album.name}
              imgSrc={album.coverArt || undefined}
              style={{ width: `calc(25% - ${gap * 0.75}px)` }}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Albums */}
      <section className="main-section">
        <div className="section-header-row columns">
          <h2 className="headertext section-header">Albums</h2>
          <button className="text-btn subtext">Show All</button>
        </div>
        <div className="columns flex-wrap" style={{ gap: `${gap}px` }}>
          {albums.slice(0, 6).map(album => (
            <AlbumLargeCoverCard
              key={`album-${album.name}`}
              title={album.name}
              artist={album.artist}
              year={album.year}
              coverArt={album.coverArt}
              style={{ width: `calc(16.666% - ${gap * 0.85}px)` }}
            />
          ))}
        </div>
      </section>

      {/* Section 3: Playlists */}
      <section className="main-section">
        <div className="section-header-row columns">
          <h2 className="headertext section-header">Playlists</h2>
          <button className="text-btn subtext">Show All</button>
        </div>
        <div className="columns flex-wrap" style={{ gap: `${gap}px` }}>
          {mockPlaylists.map(pl => (
            <PlaylistHorizontalCard
              key={`pl-${pl.title}`}
              title={pl.title}
              descText={pl.desc}
              style={{ width: `calc(25% - ${gap * 0.75}px)` }}
            />
          ))}
        </div>
      </section>

    </main>
  );
}