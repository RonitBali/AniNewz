import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Utils/Firebase';
import { Trash2, CheckCircle2, Circle, LogIn, Star, Search, Minus, Plus } from 'lucide-react';
import WatchButton from '../components/WatchButton';
import { GridSkeleton } from '../components/Skeleton';
import useDocumentTitle from '../Utils/useDocumentTitle';

const FILTERS = ['All', 'Not Watched', 'Watched'];
const SORTS = [
  { key: 'added', label: 'Recently added' },
  { key: 'title', label: 'Title A-Z' },
  { key: 'score', label: 'Score' },
  { key: 'progress', label: 'Progress' },
];

const progressOf = (a) => Number(a.progress) || 0;

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('added');
  const [search, setSearch] = useState('');
  const db = getDatabase(app);
  const auth = getAuth(app);

  useDocumentTitle('My watchlist');

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
        setWatchlist(data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : []);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeWatchlist();
    };
  }, [auth, db]);

  const itemRef = (animeId) => ref(db, `users/${user.uid}/watchlist/${animeId}`);

  const removeFromWatchlist = async (animeId) => {
    if (!user) return;
    try {
      await remove(itemRef(animeId));
    } catch (error) {
      console.error('Error removing anime from watchlist:', error);
    }
  };

  const toggleWatchStatus = async (anime) => {
    if (!user) return;
    const watched = anime.status === 'Watched';
    // Marking watched jumps progress to the last episode when we know it
    const patch = watched
      ? { status: 'Not Watched' }
      : { status: 'Watched', ...(anime.episodes ? { progress: anime.episodes } : {}) };
    try {
      await update(itemRef(anime.id), patch);
    } catch (error) {
      console.error('Error updating watch status:', error);
    }
  };

  // Episode progress: +/- one episode. Reaching the last episode marks it watched.
  const changeProgress = async (anime, delta) => {
    if (!user) return;
    const max = anime.episodes || Infinity;
    const next = Math.min(max, Math.max(0, progressOf(anime) + delta));
    const patch = { progress: next };
    if (anime.episodes && next >= anime.episodes) patch.status = 'Watched';
    else if (anime.status === 'Watched') patch.status = 'Not Watched';
    try {
      await update(itemRef(anime.id), patch);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const counts = useMemo(
    () => ({
      All: watchlist.length,
      Watched: watchlist.filter((a) => a.status === 'Watched').length,
      'Not Watched': watchlist.filter((a) => a.status !== 'Watched').length,
    }),
    [watchlist]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = watchlist.filter((a) => {
      if (filter === 'Watched' && a.status !== 'Watched') return false;
      if (filter === 'Not Watched' && a.status === 'Watched') return false;
      return !q || (a.title || '').toLowerCase().includes(q);
    });
    const by = {
      added: (a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''),
      title: (a, b) => (a.title || '').localeCompare(b.title || ''),
      score: (a, b) => (Number(b.score) || 0) - (Number(a.score) || 0),
      progress: (a, b) => progressOf(b) - progressOf(a),
    };
    return list.sort(by[sort]);
  }, [watchlist, filter, sort, search]);

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

      {watchlist.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="glass relative flex flex-1 items-center rounded-lg focus-within:border-pink-500/60">
            <label htmlFor="wl-search" className="sr-only">
              Search your watchlist
            </label>
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              id="wl-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your watchlist..."
              className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-white placeholder-gray-400 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-white/15 bg-[#12121c] px-2.5 py-2.5 text-sm text-gray-100 outline-none focus:border-pink-500/60"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

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
        <p className="py-12 text-center text-gray-400">Nothing matches.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((anime) => {
            const watched = anime.status === 'Watched';
            const progress = progressOf(anime);
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

                <h3 className="mt-3 line-clamp-2 px-1 text-sm font-semibold text-gray-100">
                  <Link to={`/anime/${anime.id}`} className="transition hover:text-pink-400">
                    {anime.title}
                  </Link>
                </h3>

                {/* Episode progress */}
                <div className="mt-2 flex items-center gap-2 px-1 text-xs text-gray-300">
                  <button
                    onClick={() => changeProgress(anime, -1)}
                    disabled={progress === 0}
                    aria-label={`Previous episode for ${anime.title}`}
                    className="flex h-6 w-6 items-center justify-center rounded border border-white/15 bg-white/5 transition hover:bg-white/10 disabled:opacity-40"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[4.5rem] text-center">
                    Ep {progress}
                    {anime.episodes ? ` / ${anime.episodes}` : ''}
                  </span>
                  <button
                    onClick={() => changeProgress(anime, 1)}
                    disabled={!!anime.episodes && progress >= anime.episodes}
                    aria-label={`Next episode for ${anime.title}`}
                    className="flex h-6 w-6 items-center justify-center rounded border border-white/15 bg-white/5 transition hover:bg-white/10 disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                {anime.episodes ? (
                  <div className="mx-1 mt-1.5 h-1 overflow-hidden rounded bg-white/10" aria-hidden>
                    <div className="h-full bg-pink-500" style={{ width: `${Math.min(100, (progress / anime.episodes) * 100)}%` }} />
                  </div>
                ) : null}

                <div className="mt-2 flex items-center gap-2 px-1">
                  <button
                    onClick={() => toggleWatchStatus(anime)}
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
