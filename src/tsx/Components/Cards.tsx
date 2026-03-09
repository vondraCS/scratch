import React from 'react';

interface HorizontalInfoCardProps {
  imgSrc?: string;
  altText?: string;
  title: string;
  descText: string;
  style?: React.CSSProperties;
}

export function HorizontalInfoCard({ imgSrc, altText, title, descText, style }: HorizontalInfoCardProps) {
  return (
    <div className="horizontal-info-card aspr4 rounded w100" style={style}>
      <img src={imgSrc} alt={altText} className="rounded" />
      <header className="subheadertext">{title}</header>
      <main className="subtext">{descText}</main>
    </div>
  );
}

interface AlbumImageCaptionCardProps {
  imgName: string;
  altText?: string;
  title: string;
  artist: string;
  year: number;
  style?: React.CSSProperties;
}

export function AlbumImageCaptionCard({ imgName, altText, title, artist, year, style }: AlbumImageCaptionCardProps) {
  return (
    <div className="album-image-caption-card flex-col centered aspr1 rounded" style={style}>
      <img src={`/src/assets/images/albums/${imgName}`} alt={altText} className="rounded" />
      <header>{title}</header>
      <p>{artist}</p>
      <p>{year}</p>
    </div>
  );
}
