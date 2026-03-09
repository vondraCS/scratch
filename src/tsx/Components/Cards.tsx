import React from 'react';

export function Horizontal_Info_Card_Import(imgSrc: string, altText: string, title: string, descText: string, styling: Array<React.CSSProperties>){
    return(
        <div id = 'horizontal-info-card' className={"aspr4 rounded w100"} style={Object.assign({}, ...styling)}>
            <img src={imgSrc} alt={altText} className='rounded'/>
            <header className='subheadertext'> {title} </header>
            <main className='subtext'> {descText} </main>
        </div>
    );
}

export function Album_Image_Caption_Card_Import(imgName: string, altText: string, title: string, artist: string, year: number, styling: Array<React.CSSProperties>){
    return(
        <div id = 'album-image-caption-card' className= {"flex-row centered aspr1 rounded"} style={Object.assign({}, ...styling)}>
            <img src={`/src/assets/images/albums/${imgName}`} alt={altText} className='rounded'/>
            <header> {title} </header>
            <p> {year} </p>
        </div>
    );
}