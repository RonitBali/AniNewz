import React from 'react'

const AnimeCard = ({ anime }) => {
    const imgurl =  anime?.images?.jpg?.image_url
    if(!anime) return null;
    return (
        <section>
            <div >
                <img src={imgurl} alt={anime.title} />
                <h1>{anime.status}</h1>       
                <h1>{anime.title || "No title found"}</h1>
            </div>
        </section>
    )
}

export default AnimeCard