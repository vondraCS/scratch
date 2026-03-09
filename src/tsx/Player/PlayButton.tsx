import React from 'react';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

export function PlayButton({ isPlaying, onClick }: PlayButtonProps) {
  return (
    <button
      id="play-button"
      onClick={onClick}
      className={`primary-btn ${isPlaying ? 'Playing' : 'Paused'}`}
    >
      {isPlaying ? 'Playing' : 'Paused'}
    </button>
  );
}
