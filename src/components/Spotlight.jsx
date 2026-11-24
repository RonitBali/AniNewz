import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Info, Star } from 'lucide-react';
import { fetchAiring } from '../api/anilist';
import WatchButton from './WatchButton';
import AnimeModal from './AnimeModal';
import { statusInfo } from '../Utils/animeFormat';

// Rotating banner of the most popular airing shows.
// All slides stay mounted and cross-fade by opacity, so each banner image is
// already loaded when its turn comes (no blank frame while it downloads).
const Spotlight = () => {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAiring(1, 8)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.filter((a) => a.banner).slice(0, 5);
        setItems(list);
        // Show the banner only once every image has loaded (or failed)
        Promise.all(
          list.map(
            (a) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = resolve;
                img.src = a.banner;
              })
          )
        ).then(() => !cancelled && setReady(true));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || items.length < 2 || paused || selected) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
    return () => clearInterval(timer);
  }, [ready, items.length, paused, selected]);

  if (!ready) {
    return <div className="skeleton h-64 w-full rounded-xl sm:h-80 lg:h-96" />;
  }

  return (
    <section
      className="relative h-64 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d0d16] shadow-2xl sm:h-80 lg:h-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured anime"
    >
      {items.map((anime, i) => {
        const status = statusInfo(anime.status);
        const active = i === index;
        return (
          <div
            key={anime.mal_id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-700 ${active ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <img src={anime.banner} alt="" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1020]/85 via-[#0f1020]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1020]/70 via-transparent to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 sm:p-8 lg:max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="chip gap-1.5 bg-black/40">
                  <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                {anime.score && (
                  <span className="chip gap-1 bg-black/40 text-yellow-300">
                    <Star className="h-3 w-3" fill="currentColor" />
                    {anime.score}
                  </span>
                )}
              </div>
              <h2 className="line-clamp-2 text-2xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl">
                {anime.title}
              </h2>
              <p className="line-clamp-2 text-sm text-gray-300 max-sm:hidden">{anime.synopsis}</p>
              <div className="mt-1 flex flex-wrap gap-3">
                <WatchButton anime={anime} variant="large" />
                <button
                  onClick={() => setSelected(anime)}
                  tabIndex={active ? 0 : -1}
                  className="btn-ghost px-5 py-3 text-base"
                >
                  <Info className="h-5 w-5" />
                  Details
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Slide dots */}
      <div className="absolute right-5 top-4 z-20 flex gap-2">
        {items.map((a, i) => (
          <button
            key={a.mal_id}
            onClick={() => setIndex(i)}
            aria-label={`Show ${a.title}`}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-pink-500' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && <AnimeModal key={selected.mal_id} anime={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default Spotlight;
