import React from 'react';

interface PlaylistHorizontalCardProps {
  imgSrc?: string;
  altText?: string;
  title: string;
  descText: string;
  style?: React.CSSProperties;
}

export function PlaylistHorizontalCard({ imgSrc, altText, title, descText, style }: PlaylistHorizontalCardProps) {
  return (
    <div className="playlist-horizontal-card w100" style={style}>
      <img src={imgSrc} alt={altText} className="rounded" />
      <header className="subheadertext">{title}</header>
      <main className="subtext">{descText}</main>
    </div>
  );
}

interface AlbumLargeCoverCardProps {
  coverArt: string | null;
  altText?: string;
  title: string;
  artist: string;
  year: number | null;
  style?: React.CSSProperties;
}

export function AlbumLargeCoverCard({ coverArt, altText, title, artist, year, style }: AlbumLargeCoverCardProps) {
  return (
    <div className="album-large-cover-card rows centered rounded" style={style}>
      {coverArt
        ? <img src={coverArt} alt={altText} className="rounded" />
        : <div className="album-placeholder rounded" />
      }
      <header>{title}</header>
      <p>{artist}</p>
      {year && <p>{year}</p>}
    </div>
  );
}

interface PlaylistCompactCardProps {
  imgSrc?: string;
  altText?: string;
  text: string;
  style?: React.CSSProperties;
}

export function PlaylistCompactCard({ imgSrc, altText, text, style }: PlaylistCompactCardProps) {
  return (
    <div className="playlist-compact-card w100" style={style}>
      <img src={imgSrc} alt={altText} className="" />
      <header className="subheadertext" style={{ textWrap: "wrap" }}>{text}</header>
    </div>
  );
}