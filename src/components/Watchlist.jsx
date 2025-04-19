// Watchlist.jsx
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { app } from '../Utils/Firebase.Jsx';

const Watchlist = ({ userId }) => {
  const [animeList, setAnimeList] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [page, setPage] = useState(1);
  const db = getDatabase(app);

  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/anime?page=${page}`)
      .then(res => res.json())
      .then(data => {
        setAnimeList(data.data);
      });
      
  }, [page]);

  useEffect(() => {
    if (userId) {
      const watchlistRef = ref(db, 'users/' + userId + '/watchlist');
      get(watchlistRef).then(snapshot => {
        if (snapshot.exists()) {
          setWatchlistIds(Object.keys(snapshot.val()));
        }
      });
    }
  }, [userId]);

  const addToWatchlist = (animeId) => {
    const animeRef = ref(db, `users/${userId}/watchlist/${animeId}`);
    set(animeRef, true).then(() => {
      setWatchlistIds(prev => [...prev, animeId]);
    });
  };

  if (!userId) {
    return <p className="text-white p-4">Please login to view your watchlist.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">All Anime (Page {page})</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animeList.map((anime) => (
          <div key={anime.mal_id} className="bg-white rounded-xl shadow p-3">
            <img
              src={anime.images.jpg.image_url}
              alt={anime.title}
              className="w-full h-60 object-cover rounded"
            />
            <h3 className="mt-2 text-lg font-semibold">{anime.title}</h3>
            <button
              onClick={() => addToWatchlist(anime.mal_id)}
              disabled={watchlistIds.includes(String(anime.mal_id))}
              className={`mt-2 px-3 py-1 text-sm rounded ${
                watchlistIds.includes(String(anime.mal_id))
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {watchlistIds.includes(String(anime.mal_id)) ? 'Added' : 'Add to Watchlist'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          disabled={page === 1}
        >
          Prev
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Watchlist;
