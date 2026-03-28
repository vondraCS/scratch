import React, { useState } from 'react';
import { PlayButton } from './PlayButton';

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <span id="player">
      <div>
        <PlayButton isPlaying={isPlaying} onClick={() => setIsPlaying(p => !p)} />
      </div>
    </span>
  );
}
