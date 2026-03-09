
//chagne the playbutton on click, and play some sick tunes
let isPlaying = false;
let playButtonText = "Paused";

export const playButtonClicked = () => {
    const obj = document.getElementById('play-button');
    isPlaying = !isPlaying;

    obj.classList.add(isPlayingState() ? "Playing" : "Paused");
    obj.classList.remove(!isPlayingState() ? "Playing" : "Paused");

    obj.textContent = isPlayingState() ? "Playing" : "Paused";
    //obj.style.backgroundColor = isPlaying ? secondaryColor : mainColor;
};

export const isPlayingState = () => {
    console.log(isPlaying);
    return isPlaying;
};

//export default playButtonClicked, ;