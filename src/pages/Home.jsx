import React, { useEffect, useState } from 'react'
import { fetchupcominganimedata } from '../api/jikan'
import AnimeCard from '../components/AnimeCard';

const Home = () => {
   const [animelist,setAnimelist] = useState([]);

   useEffect(()=>{
     fetchupcominganimedata().then(setAnimelist);
     console.log(animelist)
   },[])
  return (
   <section>
    <div>
      <h1 className='text-blue-300'>Upcominganime</h1>
      {animelist.map((anime) => (
        <AnimeCard key={anime.id} anime={anime}/>
      ))};
    </div>
   </section>
  )
}

export default Home