import React from 'react';
import { HorizontalInfoCard, AlbumImageCaptionCard } from '../Components/Cards';

export function Sidebar() {
  const gap = 10;

  return (
    <section id="sidebar" style={{ paddingRight: `${gap}px` }}>
      <div>
        <h2 className="headertext" style={{ paddingBottom: `${gap / 2}px` }}>
          Playlists <button className="primary-btn">+</button>
        </h2>
        <ul className="flex-row" style={{ gap: `${gap / 2}px` }}>
          <HorizontalInfoCard title="Playlist 1" descText="desc" style={{ height: '15vh' }} />
          <HorizontalInfoCard title="Playlist 2" descText="desc" style={{ height: '15vh' }} />
        </ul>
      </div>
      <div>
        <h2>Albums</h2>
        <ul className="flex-wrap" style={{ gap: `${gap}px`, paddingBottom: `${gap / 2}px` }}>
          <AlbumImageCaptionCard
            imgName="steelydan.jpg"
            altText="Steely Dan album"
            title="Album"
            artist="Steely Dan"
            year={2099}
            style={{ width: `calc(50% - ${gap}px)` }}
          />
        </ul>
      </div>
    </section>
  );
}
