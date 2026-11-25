import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, ChevronLeft, ChevronRight, AlertCircle, SlidersHorizontal } from 'lucide-react';
import AnimeGrid from '../components/AnimeGrid';
import Spotlight from '../components/Spotlight';
import GlassSelect from '../components/GlassSelect';
import { GridSkeleton } from '../components/Skeleton';
import { browseAnime, isAbort, GENRES, SEASONS, FORMATS } from '../api/anilist';
import useDocumentTitle from '../Utils/useDocumentTitle';

const TABS = [
  { key: 'airing', label: 'Airing now' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'popular', label: 'Most popular' },
];

const PER_PAGE = 12;
const FILTER_KEYS = ['genre', 'year', 'season', 'format'];
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear + 2 - 1990 }, (_, i) => String(thisYear + 1 - i));
const title = (s) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');

const Home = () => {
  // Search term and filters live in the URL so links, back button and the navbar search all work.
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') || '';
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const filterSig = FILTER_KEYS.map((k) => filters[k]).join('|');
  const activeFilters = FILTER_KEYS.filter((k) => filters[k]).length;

  const [input, setInput] = useState(urlQuery);
  const [filter, setFilter] = useState('airing');
  const [page, setPage] = useState(1);
  const [animeList, setAnimeList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useDocumentTitle(urlQuery ? `Search: ${urlQuery}` : 'Discover anime');

  // Keep the input in sync when the URL changes (e.g. search from the navbar)
  useEffect(() => {
    setInput(urlQuery);
    setPage(1);
  }, [urlQuery]);

  // Debounce typing into the URL (keeps filters)
  useEffect(() => {
    if (input === urlQuery) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (input.trim()) next.set('q', input.trim());
      else next.delete('q');
      setParams(next, { replace: true });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, urlQuery]);

  // Fetch. Responses are cached in sessionStorage by the API layer; a new
  // request aborts the old one so stale responses never land.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    browseAnime({ tab: filter, search: urlQuery, filters, page, perPage: PER_PAGE, signal: controller.signal })
      .then((result) => {
        const unique = Array.from(new Map(result.data.map((a) => [a.mal_id, a])).values());
        setAnimeList(unique);
        setTotalPages(result.pagination?.last_visible_page || 1);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        console.error('Failed to fetch anime:', err);
        setError("Couldn't load anime. Check your connection and try again.");
        setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, filter, filterSig, page, retry]);

  const changeFilter = (key) => {
    setFilter(key);
    setPage(1);
    if (urlQuery) {
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    }
  };

  const setFilterValue = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setPage(1);
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    FILTER_KEYS.forEach((k) => next.delete(k));
    setPage(1);
    setParams(next, { replace: true });
  };

  const clearSearch = () => {
    setInput('');
    const next = new URLSearchParams(params);
    next.delete('q');
    setParams(next, { replace: true });
  };

  const changePage = (next) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heading = urlQuery ? `Results for "${urlQuery}"` : TABS.find((t) => t.key === filter).label;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8">
      {!urlQuery && activeFilters === 0 && <Spotlight />}

      {/* Search */}
      <div className="mx-auto max-w-2xl">
        <label htmlFor="home-search" className="sr-only">
          Search anime
        </label>
        <div className="liquid relative flex items-center rounded-full focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/20">
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400" />
          <input
            id="home-search"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search anime by title..."
            className="w-full bg-transparent py-3.5 pl-12 pr-12 text-white placeholder-white/70 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {input && (
            <button
              onClick={clearSearch}
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
          <div
            role="tablist"
            className="liquid flex w-full gap-1 rounded-full p-1.5 sm:w-auto"
          >
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => changeFilter(key)}
                className={`flex-1 whitespace-nowrap rounded-full border border-transparent px-5 py-2 text-sm font-semibold transition sm:flex-none ${
                  filter === key ? 'glass-active' : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.replace(' now', '').replace('Most ', '')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <section aria-label="Filters" className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-10 items-center gap-2 pr-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </span>
        <GlassSelect label="Genre" value={filters.genre} onChange={(v) => setFilterValue('genre', v)} options={GENRES} />
        <GlassSelect label="Year" value={filters.year} onChange={(v) => setFilterValue('year', v)} options={YEARS} />
        <GlassSelect label="Season" value={filters.season} onChange={(v) => setFilterValue('season', v)} options={SEASONS} format={title} />
        <GlassSelect label="Format" value={filters.format} onChange={(v) => setFilterValue('format', v)} options={FORMATS} format={(f) => (f === 'TV_SHORT' ? 'TV short' : f === 'TV' ? 'TV' : title(f))} />
        {activeFilters > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-pink-300 transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
            Clear ({activeFilters})
          </button>
        )}
      </section>

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
          <p className="mt-2 text-sm text-gray-400">Try a different title, or loosen the filters.</p>
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
