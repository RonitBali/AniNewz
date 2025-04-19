
import React, { useEffect, useState } from 'react'
import AnimeCard from '../components/AnimeCard'

const TopAnime = () => {
    const[topAnime,setTopAnime] = useState([])
    const [loading, setLoading] = useState(true);


    useEffect(()=>{
        const  gettop = async () =>{
            try {
                const res = await fetch("https://api.jikan.moe/v4/top/anime")
                const data = await res.json();
                setTopAnime(data.data);
                setLoading(false)
            } catch (error) {
                console.log(error)
                setLoading(false)
            }            
       }
        gettop();
    },[])

    if(loading) {
        return <p className="text-white text-center">Loading Top Anime...</p>;
    }
 
  return (
   <section>
     {topAnime.map((anime)=> (
         <AnimeCard key={anime.mal_id} anime={anime} />
     ))}
   </section>
  )
}

export default TopAnime