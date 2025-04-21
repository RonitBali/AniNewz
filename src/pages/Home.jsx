import React, { useState, useEffect, useRef } from 'react';
import AnimeCard from '../components/AnimeCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('airing'); // Default filter: airing, upcoming, popular
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Cache for storing previously fetched results
  const cacheRef = useRef({});
  
  // Debounce timer reference
  const debounceTimerRef = useRef(null);

  // Fetch anime data from Jikan API with improved error handling
  useEffect(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set up debounce for search queries
    debounceTimerRef.current = setTimeout(() => {
      const fetchAnime = async () => {
        setLoading(true);
        
        try {
          // Create a cache key based on current query parameters
          const cacheKey = `${searchQuery}-${filter}-${page}`;
          
          // Check if we have cached results
          if (cacheRef.current[cacheKey]) {
            setAnimeList(cacheRef.current[cacheKey].data);
            setTotalPages(cacheRef.current[cacheKey].pages);
            setLoading(false);
            setError(null);
            return;
          }
          
          let url;
          
          if (searchQuery) {
            
            url = `https://api.jikan.moe/v4/anime?q=${searchQuery}&page=${page}&limit=12`;
          } else {
            
            switch (filter) {
              case 'airing':
                url = `https://api.jikan.moe/v4/top/anime?filter=airing&page=${page}&limit=12`;
                break;
              case 'upcoming':
                url = `https://api.jikan.moe/v4/top/anime?filter=upcoming&page=${page}&limit=12`;
                break;
              case 'popular':
                url = `https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=${page}&limit=12`;
                break;
              default:
                url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=12`;
            }
          }

          const response = await fetch(url);
          
          // Handle rate limiting with exponential backoff
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || 2 * (retryCount + 1);
            setError(`Rate limit reached. Retrying in ${retryAfter} seconds...`);
            setIsRetrying(true);
            
            // Exponential backoff retry
            const retryDelay = parseInt(retryAfter) * 1000 || Math.min(1000 * Math.pow(2, retryCount), 10000);
            
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              setIsRetrying(false);
            }, retryDelay);
            
            return;
          }
          
          // Reset retry count on successful request
          setRetryCount(0);
          
          const data = await response.json();
          
          if (data.data) {
            // Cache the results
            const uniqueAnime = Array.from(
              new Map(data.data.map((anime) => [anime.mal_id, anime])).values()
            );
            cacheRef.current[cacheKey] = {
              data: uniqueAnime,
              pages: data.pagination?.last_visible_page || 1,
              timestamp: Date.now()
            };
            
            setAnimeList(uniqueAnime);
            setTotalPages(data.pagination?.last_visible_page || 1);
            setError(null);
          } else {
            setError("No anime data found");
          }
        } catch (err) {
          setError(`Error fetching anime: ${err.message}`);
          console.error("Failed to fetch anime:", err);
        } finally {
          setLoading(false);
        }
      };

      // Don't fetch if we're waiting for a retry
      if (!isRetrying) {
        fetchAnime();
      }
    }, searchQuery ? 500 : 0); // 500ms debounce for search queries, no debounce for filter changes
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [page, filter, searchQuery, retryCount, isRetrying]);

  // Clear old cache entries (older than 5 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(cacheRef.current).forEach(key => {
        if (now - cacheRef.current[key].timestamp > 5 * 60 * 1000) {
          delete cacheRef.current[key];
        }
      });
    }, 60000); // Check every minute
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Handle search input with debouncing
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already debounced in the useEffect
    setPage(1); // Reset to first page on new search
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page on filter change
    setSearchQuery(''); // Clear search when changing filters
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle input change with debouncing built in
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <section className="min-h-screen">
      {/* Hero Section from Home page */}
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

        {/* Search Bar from Home page */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full max-w-2xl mx-auto relative"
        >
          <div className="relative flex">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 " />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-3 w-full rounded-lg bg-black/50 border border-pink-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Search for anime..."
              value={searchQuery}
              onChange={handleInputChange}
            />
            <button 
              type="submit"
              onClick={handleSearch}
              disabled={loading || isRetrying}
              className={`px-6 py-3 text-white font-medium rounded-xl ml-1 transition-colors ${
                loading || isRetrying 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              Search
            </button>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Filter buttons from AnimeList */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => handleFilterChange('airing')}
            disabled={loading || isRetrying}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'airing' 
                ? 'bg-pink-600 text-white' 
                : loading || isRetrying 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Currently Airing
          </button>
          <button 
            onClick={() => handleFilterChange('upcoming')}
            disabled={loading || isRetrying}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-pink-600 text-white' 
                : loading || isRetrying 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => handleFilterChange('popular')}
            disabled={loading || isRetrying}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'popular' 
                ? 'bg-pink-600 text-white' 
                : loading || isRetrying 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Most Popular
          </button>
        </div>

        {/* Content heading with result count */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
            {filter === 'airing' ? 'Currently Airing' : 
             filter === 'upcoming' ? 'Upcoming Anime' : 
             filter === 'popular' ? 'Most Popular' : 'All Anime'}
          </h2>
          {/* <p className="text-pink-300 font-medium">
            {animeList.length} results found
          </p> */}
        </div>

        {/* Loading state */}
        {loading && !isRetrying && (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Retrying state */}
        {isRetrying && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-300 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Error state (non-retrying) */}
        {error && !loading && !isRetrying && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && animeList.length === 0 && !isRetrying && (
          <div className="text-center py-12">
            <p className="text-2xl font-semibold text-gray-400 mb-4">No anime found</p>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        )}

        {/* Anime grid with motion animations */}
        {!loading && !error && animeList.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {animeList.map((anime) => (
              <motion.div 
                key={anime.mal_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AnimeCard anime={anime} user={{}} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              type='button'
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading || isRetrying}
              className={`px-4 py-2 rounded-lg text-white ${
                page === 1 || loading || isRetrying ? 'bg-gray-700 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center px-4">
              <span className="text-white">
                Page {page} of {totalPages}
              </span>
            </div>
            
            <button
              type='button'
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading || isRetrying}
              className={`px-4 py-2 rounded-lg text-white ${
                page === totalPages || loading || isRetrying ? 'bg-gray-700 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;