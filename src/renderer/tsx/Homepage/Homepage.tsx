import React, { useEffect, useState } from 'react';
import { Album, UserData } from '../../../main/types/datatypes';
import { scanLibrary, groupTracksByAlbum, parseRecentlyPlayed } from '../ParseFiles';
import { AlbumLargeCoverCard, PlaylistHorizontalCard, PlaylistCompactCard } from '../Components/Cards';

export function Homepage() {
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
    return <main id="homepage"><p className="subtext">Scanning library…</p></main>;
  }

  if (!hasDirectory) {
    return (
      <main id="homepage">
        <p className="subtext">No storage directory set. Use File → Set Storage Directory.</p>
      </main>
    );
  }

  if (albums.length === 0) {
    return (
      <main id="homepage">
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

  
function updateSectionPlaylists(): void {
  
}

function updateSectionAlbums(): void {
  
}

async function updateSectionRecentlyPlayed() {
  let recentlyPlayed: string = null;
  try{ 
    recentlyPlayed = await window.electronAPI.getStoreData("recentlyPlayed");
  } catch(err){console.log(err); return;}
 
  await parseRecentlyPlayed();

  if(recentlyPlayed.length == 0){
    //if nothing in recently played, then hide section
    const el = document.querySelector('#recently-played');
    el.classList.add("hidden");
  }else{
    //unhide incase of hidden
    const el = document.querySelector('#recently-played');
    el.classList.remove("hidden");

    for(const pl of recentlyPlayed){

        //turn into react component
        //imgSrc, altText, text, style
        //we need to get the playlist/album's name, cover, and a reference/address to link to
        //recently played stores the 
        /*<PlaylistCompactCard 
                      text={album.name}
                      imgSrc={album.coverArt || undefined}
                      altText={}
                      style={{ width: `calc(25% - ${gap * 0.75}px)` }}
                    />*/
    }
    
  }
  
}
function populateHomepage(): void {
  console.log("starting");
  updateSectionRecentlyPlayed();
  updateSectionAlbums();
  updateSectionPlaylists();
  console.log("done");
}
populateHomepage();

  return (
    <main id="homepage" className="rows scrollable" style={{ gap: `${gap * 2}px`, paddingTop: `${gap}px`, paddingBottom: `${gap * 2}px` }}>

      {/* Section 1: Recently Played (Albums/Playlists) -> using HorizontalCompactCard */}
      <section id="recently-played" className="homepage-section" style={{}} >
        <h2 className="headertext section-header">Recently Played</h2>
        <div className="columns flex-wrap" style={{ gap: `${gap}px` }}>
          {/*{albums.slice(0, 4).map(album => (
            <PlaylistCompactCard
              key={`recent-${album.name}`}
              text={album.name}
              imgSrc={album.coverArt || undefined}
              style={{ width: `calc(25% - ${gap * 0.75}px)` }}
            />
          ))}*/}
        </div>
      </section>

      {/* Section 2: Albums */}
      <section id= "albums" className="homepage-section">
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
      <section id="playlists" className="homepage-section">
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