import React, { useEffect, useState } from 'react';
import AnimeCard from '../components/AnimeCard';
import { Trophy, Filter, ChevronDown, SlidersHorizontal, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const TopAnime = () => {
    const [topAnime, setTopAnime] = useState([]);
    const [filteredAnime, setFilteredAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortMethod, setSortMethod] = useState('score');

    useEffect(() => {
        const getTop = async () => {
            try {
                const res = await fetch("https://api.jikan.moe/v4/top/anime");
                const data = await res.json();
                setTopAnime(data.data);
                setFilteredAnime(data.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };
        getTop();
    }, []);

    useEffect(() => {
        // Apply sorting
        const sortedAnime = [...topAnime];
        
        if (sortMethod === 'score') {
            sortedAnime.sort((a, b) => (b.score || 0) - (a.score || 0));
        } else if (sortMethod === 'popularity') {
            sortedAnime.sort((a, b) => (b.members || 0) - (a.members || 0));
        } else if (sortMethod === 'newest') {
            sortedAnime.sort((a, b) => {
                const dateA = a.aired?.from ? new Date(a.aired.from) : new Date(0);
                const dateB = b.aired?.from ? new Date(b.aired.from) : new Date(0);
                return dateB - dateA;
            });
        }
        
        setFilteredAnime(sortedAnime);
    }, [sortMethod, topAnime]);

    // Animation variants
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white">
                <Loader className="h-12 w-12 animate-spin text-pink-500 mb-4" />
                <p className="text-xl font-medium">Loading Top Anime...</p>
            </div>
        );
    }

    return (
        <section className="min-h-screen  py-16 px-4">
            {/* Header Section */}
            <div className="container mx-auto mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-8"
                >
                    <div className="flex items-center mb-6 md:mb-0">
                        <Trophy className="h-10 w-10 text-yellow-400 mr-4" />
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            Top Anime
                        </h1>
                    </div>
                    
                    {/* Sort Options */}
                    <div className="relative">
                        <button 
                            className="bg-pink-500/80 hover:bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                            <span>Sort By: {sortMethod.charAt(0).toUpperCase() + sortMethod.slice(1)}</span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-300" style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                        </button>
                        
                        {/* Dropdown */}
                        {filterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1">
                                    <button 
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortMethod === 'score' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                                        onClick={() => { setSortMethod('score'); setFilterOpen(false); }}
                                    >
                                        Score
                                    </button>
                                    <button 
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortMethod === 'popularity' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                                        onClick={() => { setSortMethod('popularity'); setFilterOpen(false); }}
                                    >
                                        Popularity
                                    </button>
                                    <button 
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortMethod === 'newest' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-200 hover:bg-gray-700'}`}
                                        onClick={() => { setSortMethod('newest'); setFilterOpen(false); }}
                                    >
                                        Newest
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                   className="text-xl text-white md:text-2xl font-light max-w-2xl drop-shadow-md mb-12"
                >
                    Discover the highest rated and most popular anime series of all time, sorted by {sortMethod === 'score' ? 'MyAnimeList score' : sortMethod === 'popularity' ? 'number of members' : 'release date'}.
                </motion.p>
            </div>
            
            {/* Anime Grid */}
            <div className="container mx-auto">
                <motion.div 
                    className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {filteredAnime.map((anime, index) => (
                        <motion.div key={anime.mal_id} variants={itemVariants}>
                            <div className="relative">
                                {/* Rank Badge */}
                                <div className="absolute -left-2 -top-2 z-30 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                    #{index + 1}
                                </div>
                                <AnimeCard anime={anime} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TopAnime;