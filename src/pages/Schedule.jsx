import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import AnimeModal from '../components/AnimeModal';
import Countdown from '../components/Countdown';
import { fetchSchedule, isAbort } from '../api/anilist';
import useDocumentTitle from '../Utils/useDocumentTitle';

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Weekly airing calendar: pick a day, see episodes in local time.
const Schedule = () => {
  useDocumentTitle('Airing schedule');

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const [dayIndex, setDayIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // New day: start over
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasNext(false);
  }, [dayIndex]);

  useEffect(() => {
    const controller = new AbortController();
    const start = Math.floor(days[dayIndex].getTime() / 1000);
    const end = start + 86400;
    setLoading(true);
    setError(null);
    fetchSchedule(start, end, page, controller.signal)
      .then((res) => {
        setItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setHasNext(res.hasNext);
      })
      .catch((err) => {
        if (isAbort(err)) return;
        console.error(err);
        setError("Couldn't load the schedule. Try again in a moment.");
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [days, dayIndex, page]);

  const dayLabel = (d, i) =>
    i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Airing Schedule</h1>
        <p className="mt-2 text-sm text-gray-300">Episodes airing in the next 7 days, shown in your local time.</p>
      </header>

      <div role="tablist" aria-label="Day" className="flex gap-5 overflow-x-auto border-b border-white/10">
        {days.map((d, i) => (
          <button
            key={d.toISOString()}
            role="tab"
            aria-selected={dayIndex === i}
            onClick={() => setDayIndex(i)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition ${
              dayIndex === i ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {dayLabel(d, i)}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-pink-400" />
          <p className="text-gray-200">{error}</p>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="py-12 text-center text-gray-400">No episodes listed for this day.</p>
      )}

      <ul className="space-y-3">
        {items.map((s) => (
          <li key={`${s.anime.mal_id}-${s.episode}`}>
            <button
              onClick={() => setSelected(s.anime)}
              className="glass group flex w-full items-center gap-4 rounded-lg p-3 text-left transition hover:border-pink-500/50"
            >
              <img
                src={s.anime.images.jpg.image_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-20 w-14 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-gray-100 transition group-hover:text-pink-400">{s.anime.title}</p>
                <p className="mt-1 text-xs text-gray-400">Episode {s.episode}</p>
                <Countdown
                  next={{ episode: s.episode, airingAt: s.airingAt }}
                  className="mt-1 text-xs font-medium text-emerald-300"
                />
              </div>
              <time className="shrink-0 text-sm font-semibold text-white" dateTime={new Date(s.airingAt * 1000).toISOString()}>
                {new Date(s.airingAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </button>
          </li>
        ))}
      </ul>

      {hasNext && (
        <div className="text-center">
          <button onClick={() => setPage((p) => p + 1)} disabled={loading} className="btn-ghost">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {selected && <AnimeModal key={selected.mal_id} anime={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
