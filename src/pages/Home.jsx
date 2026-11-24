import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import AnimeGrid from '../components/AnimeGrid';
import Spotlight from '../components/Spotlight';
import { GridSkeleton } from '../components/Skeleton';
import { fetchAiring, fetchUpcoming, fetchPopular, searchAnime } from '../api/anilist';

const TABS = [
  { key: 'airing', label: 'Airing now', fetcher: fetchAiring },
  { key: 'upcoming', label: 'Upcoming', fetcher: fetchUpcoming },
  { key: 'popular', label: 'Most popular', fetcher: fetchPopular },
];

const PER_PAGE = 12;
const CACHE_TTL = 5 * 60 * 1000;

const Home = () => {
  // The search term lives in the URL (?q=) so the navbar search and back button both work.
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') || '';

  const [input, setInput] = useState(urlQuery);
  const [filter, setFilter] = useState('airing');
  const [page, setPage] = useState(1);
  const [animeList, setAnimeList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const cacheRef = useRef({});

  // Keep the input in sync when the URL changes (e.g. search from the navbar)
  useEffect(() => {
    setInput(urlQuery);
    setPage(1);
  }, [urlQuery]);

  // Debounce typing into the URL
  useEffect(() => {
    if (input === urlQuery) return;
    const t = setTimeout(() => {
      setParams(input.trim() ? { q: input.trim() } : {}, { replace: true });
    }, 450);
    return () => clearTimeout(t);
  }, [input, urlQuery, setParams]);

  useEffect(() => {
    let cancelled = false;
    const key = `${urlQuery}|${filter}|${page}`;
    const cached = cacheRef.current[key];

    if (cached && Date.now() - cached.at < CACHE_TTL) {
      setAnimeList(cached.data);
      setTotalPages(cached.pages);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const run = urlQuery
      ? searchAnime(urlQuery, page, PER_PAGE)
      : TABS.find((t) => t.key === filter).fetcher(page, PER_PAGE);

    run
      .then((result) => {
        if (cancelled) return;
        const unique = Array.from(new Map(result.data.map((a) => [a.mal_id, a])).values());
        const pages = result.pagination?.last_visible_page || 1;
        cacheRef.current[key] = { data: unique, pages, at: Date.now() };
        setAnimeList(unique);
        setTotalPages(pages);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to fetch anime:', err);
        setError("Couldn't load anime. Check your connection and try again.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [urlQuery, filter, page, retry]);

  const changeFilter = (key) => {
    setFilter(key);
    setPage(1);
    if (urlQuery) setParams({}, { replace: true });
  };

  const changePage = (next) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heading = urlQuery ? `Results for "${urlQuery}"` : TABS.find((t) => t.key === filter).label;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8">
      {!urlQuery && <Spotlight />}

      {/* Search */}
      <div className="mx-auto max-w-2xl">
        <label htmlFor="home-search" className="sr-only">
          Search anime
        </label>
        <div className="glass relative flex items-center rounded-lg shadow-lg focus-within:border-pink-500/60 focus-within:ring-2 focus-within:ring-pink-500/30">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400" />
          <input
            id="home-search"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search anime by title..."
            className="w-full bg-transparent py-3.5 pl-12 pr-12 text-white placeholder-gray-400 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <button
              onClick={() => {
                setInput('');
                setParams({}, { replace: true });
              }}
              aria-label="Clear search"
              className="absolute right-3 rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs + heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{heading}</h1>

        {!urlQuery && (
          <div role="tablist" className="flex w-full gap-6 border-b border-white/10 sm:w-auto">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => changeFilter(key)}
                className={`-mb-px whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition ${
                  filter === key ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.replace(' now', '').replace('Most ', '')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading && <GridSkeleton count={PER_PAGE} />}

      {error && !loading && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-pink-400" />
          <p className="text-gray-200">{error}</p>
          <button onClick={() => setRetry((r) => r + 1)} className="btn-primary">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && animeList.length === 0 && (
        <div className="glass mx-auto max-w-md rounded-lg p-10 text-center">
          <p className="text-lg font-semibold text-gray-100">No anime found</p>
          <p className="mt-2 text-sm text-gray-400">Try a different title or spelling.</p>
        </div>
      )}

      {!loading && !error && animeList.length > 0 && <AnimeGrid items={animeList} />}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          <button onClick={() => changePage(page - 1)} disabled={page === 1} className="btn-ghost">
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm text-gray-300">
            Page <span className="font-semibold text-white">{page}</span> of {Math.min(totalPages, 99)}
          </span>
          <button onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="btn-ghost">
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Home;
