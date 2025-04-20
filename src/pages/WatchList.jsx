import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Utils/Firebase.Jsx';
import { Trash2, AlertCircle } from 'lucide-react';

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const db = getDatabase(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);

      if (!currentUser) {
        setWatchlist([]);
        setLoading(false);
        return;
      }

      const watchlistRef = ref(db, `users/${currentUser.uid}/watchlist`);
      const unsubscribeWatchlist = onValue(watchlistRef, (snapshot) => {
        setLoading(true);
        const data = snapshot.val();

        if (data) {
          const animeList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setWatchlist(animeList);
        } else {
          setWatchlist([]);
        }
        setLoading(false);
      });

      return () => unsubscribeWatchlist();
    });

    return () => unsubscribeAuth();
  }, []);

  const removeFromWatchlist = async (animeId) => {
    if (!user) return;

    try {
      await remove(ref(db, `users/${user.uid}/watchlist/${animeId}`));
    } catch (error) {
      console.error("Error removing anime from watchlist:", error);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8 bg-gray-800/50 rounded-lg">
          <AlertCircle className="text-pink-500 mr-2" />
          <p className="text-white">Please log in to view your watchlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">My Watchlist</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-lg">
          <p className="text-gray-400 text-lg">Your watchlist is empty</p>
          <p className="text-gray-500 mt-2">Browse anime and add them to your watchlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlist.map((anime) => (
            <div key={anime.id} className="bg-gray-800/80 rounded-lg overflow-hidden shadow-lg hover:shadow-pink-600/20 transition-all">
              <div className="relative">
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="w-full h-64 object-cover"
                />
                <button 
                  onClick={() => removeFromWatchlist(anime.id)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 p-2 rounded-full text-white transition"
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold text-lg truncate">{anime.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-pink-400 text-sm">{anime.type}</span>
                  {anime.score && <span className="bg-pink-500 px-2 py-0.5 rounded text-xs text-white">{anime.score}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchList;
