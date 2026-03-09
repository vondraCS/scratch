import { Horizontal_Info_Card_Import, Album_Image_Caption_Card_Import } from "../Components/Cards";

export function Sidebar(){
    const gap = 10;
    //(imgSrc: string, altText: string, title: string, artist: string, year: number, styling: Array<React.CSSProperties>)
    const Image_Caption_Card = Album_Image_Caption_Card_Import("steelydan.jpg", "alt text", "album", "steely dan", 2099, [
        {width: `calc(50% - ${gap}px)`}
    ]);
    //imgSrc, altText, title, descText, height_val
    const height = "15vh";
    const numPlaylists = Math.min(4, 4); //get num of playlists dynamically later

    const Playlist_Cards = [];

    /*for (let i = 0; i < numPlaylists; i++) {
        Playlist_Cards[i] = Horizontal_Info_Card_Import("", "", "ttitle", "desc", styling);
    }*/

    Playlist_Cards[0] = Horizontal_Info_Card_Import(null, "", "Playlist1", "desc", [
        {height: "15vh"}
    ]);
    Playlist_Cards[1] = Horizontal_Info_Card_Import(null, "", "Playlist2", "desc", [
        {height: "15vh"}
    ]);

    return (
        <section id="sidebar" style={{paddingRight: `${gap}px`}}>
            <div><h2 className="headertext" style={{paddingBottom: `${gap/2}px`}}>Playlists 
                <button className='primary-btn'>+</button></h2> 
                <ul className="flex-row" style={{gap: `${gap/2}px`}}>
                    {Playlist_Cards[0]}
                    {Playlist_Cards[1]}
                    {Playlist_Cards[2]}
                    {Playlist_Cards[3]}
                </ul></div>
            <div><h2>Albums</h2>
                <ul className="flex-wrap" style={{gap: `${gap}px`, paddingBottom: `${gap/2}px`}}>
                    {Image_Caption_Card}
                    {Image_Caption_Card}

                </ul></div>
        </section>
    );
}