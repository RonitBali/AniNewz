import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, remove, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Utils/Firebase';
import { Trash2, AlertCircle, CheckCircle, EyeOff } from 'lucide-react';

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const db = getDatabase(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
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

  const toggleWatchStatus = async (animeId, currentStatus) => {
    if (!user) return;

    const newStatus = currentStatus === "Watched" ? "Not Watched" : "Watched";

    try {
      await set(ref(db, `users/${user.uid}/watchlist/${animeId}/status`), newStatus);
    } catch (error) {
      console.error("Error updating watch status:", error);
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlist.map((anime) => (
            <div
              key={anime.id}
              className="bg-[#1f1f1f]/80 border border-pink-500/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-pink-600/20 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-64 object-cover"
                />
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWatchlist(anime.id)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 p-2 rounded-full text-white transition"
                  title="Remove from watchlist"
                >
                  <Trash2 size={16} />
                </button>

                {/* Watch Status Toggle */}
                <button
                  onClick={() => toggleWatchStatus(anime.id, anime.status || "Not Watched")}
                  className={`absolute top-2 left-2 p-2 rounded-full text-white transition ${
                    anime.status === "Watched"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
                  }`}
                  title="Toggle watch status"
                >
                  {anime.status === "Watched" ? <CheckCircle size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <div className="p-4 text-white">
                <h3 className="text-lg font-semibold line-clamp-2">{anime.title}</h3>
                <div className="text-sm text-gray-400 mt-1 italic">{anime.type}</div>

                <div className="text-sm mt-2 space-y-1">
                  {anime.episodes && <p>Episodes: {anime.episodes}</p>}
                  {anime.year && <p>Year: {anime.year}</p>}
                  {anime.season && <p>Season: {anime.season}</p>}
                  {anime.score && <p>Score: ⭐ {anime.score}</p>}
                </div>

                <div className="mt-2 text-xs text-pink-300 font-medium">
                  Status: {anime.status || "Not Watched"}
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
