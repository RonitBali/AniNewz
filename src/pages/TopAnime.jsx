import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import AnimeGrid from '../components/AnimeGrid';
import { GridSkeleton } from '../components/Skeleton';
import { fetchTopAnime, isAbort } from '../api/anilist';
import useDocumentTitle from '../Utils/useDocumentTitle';

const SORTS = [
  { key: 'score', label: 'Score' },
  { key: 'popularity', label: 'Popularity' },
  { key: 'newest', label: 'Newest' },
];

const TopAnime = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortMethod, setSortMethod] = useState('score');

  useDocumentTitle('Top anime');

  useEffect(() => {
    const controller = new AbortController();
    fetchTopAnime(1, 24, controller.signal)
      .then((result) => {
        setTopAnime(result.data);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        console.error(err);
        setError("Couldn't load the top anime list. Please try again later.");
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const sorted = useMemo(() => {
    const list = [...topAnime];
    if (sortMethod === 'score') list.sort((a, b) => (b.score || 0) - (a.score || 0));
    else if (sortMethod === 'popularity') list.sort((a, b) => (b.members || 0) - (a.members || 0));
    else
      list.sort((a, b) => {
        const da = a.aired?.from ? new Date(a.aired.from) : new Date(0);
        const db = b.aired?.from ? new Date(b.aired.from) : new Date(0);
        return db - da;
      });
    return list;
  }, [topAnime, sortMethod]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Top Anime</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-300 sm:text-base">
            The highest rated anime of all time. Re-sort the list by score, popularity or release date.
          </p>
        </div>

        <div role="group" aria-label="Sort by" className="flex w-full gap-6 border-b border-white/10 sm:w-auto">
          {SORTS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortMethod(key)}
              aria-pressed={sortMethod === key}
              className={`-mb-px border-b-2 pb-2 text-sm font-medium transition ${
                sortMethod === key ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {loading && <GridSkeleton count={12} />}

      {error && !loading && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-pink-400" />
          <p className="text-gray-200">{error}</p>
        </div>
      )}

      {!loading && !error && <AnimeGrid items={sorted} showRank />}
    </div>
  );
};

export default TopAnime;
