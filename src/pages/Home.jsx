import React, { useEffect, useState } from 'react'
import { fetchupcominganimedata } from '../api/jikan'
import AnimeCard from '../components/AnimeCard';


const Home = () => {
   const [animelist,setAnimelist] = useState([]);
   const [loading,setLoading] = useState(true);

   useEffect(()=>{
     fetchupcominganimedata().then((data)=>{
      setAnimelist(data);
      setLoading(false);
     })
     .catch((error)=>{
      console.log(error);
     })  
   },[])

   if(loading){
    return (
      <div className='text-white text-center'>
      <p>Loading....</p>
      </div>
    )
   }

  return (
   <section >
    <div>
      <h1 className='text-blue-300'>Upcominganime</h1>
      {animelist.map((anime) => (
        <AnimeCard key={anime.mal_id} anime={anime}/>
      ))};
    </div>
   </section>
  )
}

export default Home