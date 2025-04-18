import React, { useEffect, useState } from 'react'
import { fetchupcominganimedata } from '../api/jikan'
import AnimeCard from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { DefaultLoaderExample } from '../components/Loader';


const Home = () => {
  const [animelist, setAnimelist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // const [filteredanime, setFilteredanime] = useState('');

  useEffect(() => {
    fetchupcominganimedata().then((data) => {
      setAnimelist(data);
      setLoading(false);
    })
      .catch((error) => {
        console.log(error);
      })
  }, [])

  

  // const filtered = animelist.filter((anime) =>
  //   anime.title.toLowerCase().includes(searchquery)
  // );
  // setFilteredanime(filtered)


  if (loading) {
    return (
      <DefaultLoaderExample />
    )
  }

  return (
    <section >
      {/* <div>
      <h1 className='text-blue-300'>Upcominganime</h1>
      {animelist.map((anime) => (
        <AnimeCard key={anime.mal_id} anime={anime}/>
      ))};
    </div> */}
      <div className="relative top-[-100px] z-10 flex flex-col items-center justify-center text-center text-white min-h-screen px-4">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg -"
        >
          Welcome to <span className='text-pink-500 font-bold shadow-sm'> AniNewz</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl font-light max-w-xl drop-shadow-md"
        >
          Stay updated with the latest upcoming anime releases and news!
        </motion.p>

      </div>
      <div >
        <h1 className=' text-white text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg text-center'>Upcoming-anime</h1>
        {animelist.map((anime) => (
          <AnimeCard key={anime.mal_id} anime={anime} />
        ))};
      </div>
    </section>
  )
}

export default Home