import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Utils/Firebase';
import { Trash2, CheckCircle2, Circle, LogIn, Star } from 'lucide-react';
import WatchButton from '../components/WatchButton';
import { GridSkeleton } from '../components/Skeleton';

const FILTERS = ['All', 'Not Watched', 'Watched'];

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('All');
  const db = getDatabase(app);
  const auth = getAuth(app);

  useEffect(() => {
    let unsubscribeWatchlist = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeWatchlist();
      setUser(currentUser);

      if (!currentUser) {
        setWatchlist([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeWatchlist = onValue(ref(db, `users/${currentUser.uid}/watchlist`), (snapshot) => {
        const data = snapshot.val();
        const list = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
        list.sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
        setWatchlist(list);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeWatchlist();
    };
  }, [auth, db]);

  const removeFromWatchlist = async (animeId) => {
    if (!user) return;
    try {
      await remove(ref(db, `users/${user.uid}/watchlist/${animeId}`));
    } catch (error) {
      console.error('Error removing anime from watchlist:', error);
    }
  };

  const toggleWatchStatus = async (animeId, currentStatus) => {
    if (!user) return;
    const newStatus = currentStatus === 'Watched' ? 'Not Watched' : 'Watched';
    try {
      await set(ref(db, `users/${user.uid}/watchlist/${animeId}/status`), newStatus);
    } catch (error) {
      console.error('Error updating watch status:', error);
    }
  };

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-white">Log in to see your watchlist</h1>
          <p className="text-sm text-gray-400">
            Save anime you want to watch and keep track of what you have finished. Use the Login button at the top.
          </p>
        </div>
      </div>
    );
  }

  const counts = {
    All: watchlist.length,
    Watched: watchlist.filter((a) => a.status === 'Watched').length,
    'Not Watched': watchlist.filter((a) => a.status !== 'Watched').length,
  };
  const visible = watchlist.filter((a) =>
    filter === 'All' ? true : filter === 'Watched' ? a.status === 'Watched' : a.status !== 'Watched'
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">My Watchlist</h1>
          <p className="mt-2 text-sm text-gray-300">
            {counts.Watched} of {counts.All} watched
          </p>
        </div>

        <div role="tablist" className="flex w-full gap-6 border-b border-white/10 sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition ${
                filter === f ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {f} <span className="opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <GridSkeleton count={6} />
      ) : watchlist.length === 0 ? (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl p-10 text-center">
          <p className="text-lg font-semibold text-gray-100">Your watchlist is empty</p>
          <p className="text-sm text-gray-400">Tap the bookmark on any anime to save it here.</p>
          <Link to="/" className="btn-primary">
            Discover anime
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((anime) => {
            const watched = anime.status === 'Watched';
            return (
              <article key={anime.id} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-lg transition duration-300 group-hover:border-pink-500/50">
                  <img src={anime.image} alt="" loading="lazy" className={`h-full w-full object-cover transition ${watched ? 'opacity-60' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  <button
                    onClick={() => removeFromWatchlist(anime.id)}
                    aria-label={`Remove ${anime.title} from watchlist`}
                    title="Remove"
                    className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {anime.score && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">
                      <Star className="h-3 w-3" fill="currentColor" />
                      {anime.score}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 line-clamp-2 px-1 text-sm font-semibold text-gray-100">{anime.title}</h3>

                <div className="mt-2 flex items-center gap-2 px-1">
                  <button
                    onClick={() => toggleWatchStatus(anime.id, anime.status || 'Not Watched')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      watched ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {watched ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    {watched ? 'Watched' : 'Mark watched'}
                  </button>
                  <WatchButton anime={{ mal_id: anime.id, title: anime.title }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchList;
