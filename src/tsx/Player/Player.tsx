import React, { useState } from 'react';
import { playButtonClicked, isPlayingState } from './PlayButton';


export function Player(){
    return(
        <span id = "player">
            <div>
                <button id = 'play-button'
                onClick={playButtonClicked}
                className= {`primary-btn ${isPlayingState() ? "Playing" : "Paused"}`}>
                {isPlayingState() ? "Playing" : "Paused"}
                </button>
            </div>
        </span>
    );
}