import React, { useEffect, useState } from 'react';
import { Album } from '../../../main/types/datatypes';
import { PlaylistHorizontalCard, AlbumLargeCoverCard } from '../Components/Cards';
import { getTracks, groupTracksByAlbum } from '../ParseFiles';

export function Sidebar() {
  const gap = 10;
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    async function load() {
      const tracks = await getTracks();
      setAlbums(groupTracksByAlbum(tracks));
    }
    load();
  }, []);

  return (
    <section id="sidebar" className='scrollable' style={{ paddingRight: `${gap}px` }}>
      <div>
        <h2 className="headertext" style={{ paddingBottom: `${gap / 2}px` }}>
          Playlists <button className="primary-btn">+</button>
        </h2>
        <ul className="rows" style={{ gap: `${gap / 2}px` }}>
          <PlaylistHorizontalCard title="Playlist 1" descText="desc" />
          <PlaylistHorizontalCard title="Playlist 2" descText="desc" />
        </ul>
      </div>
      <div>
        <h2>Albums</h2>
        <ul className="flex-wrap" style={{ gap: `${gap}px`, paddingBottom: `${gap / 2}px` }}>
          {albums.map((album) => (
            <AlbumLargeCoverCard
              key={`${album.name}-${album.artist}`}
              coverArt={album.coverArt}
              altText={`${album.name} cover`}
              title={album.name}
              artist={album.artist}
              year={album.year}
              style={{ width: `calc(50% - ${gap}px)` }}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
