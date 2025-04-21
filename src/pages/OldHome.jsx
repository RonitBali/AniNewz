import React, { useEffect, useState } from 'react'
import { fetchupcominganimedata } from '../api/jikan'
import AnimeCard from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { DefaultLoaderExample } from '../components/Loader';
import { Search, Filter, ChevronDown,Loader } from 'lucide-react';

const OldHOme = () => {
  const [animelist, setAnimelist] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchupcominganimedata()
      .then((data) => {
        // Deduplicate based on mal_id
        const uniqueAnimes = [];
        const ids = new Set();
  
        data.forEach((anime) => {
          if (!ids.has(anime.mal_id)) {
            ids.add(anime.mal_id);
            uniqueAnimes.push(anime);
          }
        });
  
        setAnimelist(uniqueAnimes);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);
  

  useEffect(() => {
   
    let results = [...animelist];
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      results = results.filter(anime => 
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (anime.title_japanese && anime.title_japanese.includes(searchQuery))
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      results = results.filter(anime => {
        if (filter === 'airing') return anime.status === 'Currently Airing';
        if (filter === 'upcoming') return anime.status === 'Not yet aired';
        if (filter === 'finished') return anime.status === 'Finished Airing';
        return true;
      });
    }
    
    setFilteredList(results);
  }, [searchQuery, filter, animelist]);

  if (loading) {
    return <DefaultLoaderExample />
  }

  // Animation variants for staggered list items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="min-h-screen ">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white min-h-[50vh] px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-[-1] bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20"
        />

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg bg-clip-text text-transparent bg-pink-500"
        >
          <span className="text-white">Ani</span>
          <span className="font-extrabold">Newz</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl font-light max-w-2xl drop-shadow-md mb-12"
        >
          Stay updated with the latest upcoming anime releases and news!
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full max-w-2xl mx-auto relative"
        >
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-3 w-full rounded-l-lg bg-black/50 border border-pink-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Search for anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-r-lg flex items-center gap-2 relative group"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-5 w-5" />
              <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              
             
              {filterOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${filter === 'all' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => { setFilter('all'); setFilterOpen(false); }}
                    >
                      All Anime
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${filter === 'upcoming' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => { setFilter('upcoming'); setFilterOpen(false); }}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${filter === 'airing' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => { setFilter('airing'); setFilterOpen(false); }}
                    >
                      Currently Airing
                    </button>
                    <button 
                      className={`block px-4 py-2 text-sm w-full text-left ${filter === 'finished' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                      onClick={() => { setFilter('finished'); setFilterOpen(false); }}
                    >
                      Finished Airing
                    </button>
                  </div>
                </div>
              )}
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Anime List Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className='text-white text-3xl md:text-4xl font-bold drop-shadow-lg'>
            {filter === 'all' ? 'All Anime' : 
             filter === 'upcoming' ? 'Upcoming Anime' :
             filter === 'airing' ? 'Currently Airing' : 'Finished Anime'}
          </h2>
          <p className="text-pink-300 font-medium">
            {filteredList.length} results found
          </p>
        </div>

        {filteredList.length > 0 ? (
          <motion.div 
            className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredList.map((anime) => (
              <motion.div key={anime.mal_id} variants={itemVariants}>
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-2xl font-semibold text-gray-400 mb-4">No anime found</p>
            <p className="text-gray-500 max-w-md">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default OldHOme