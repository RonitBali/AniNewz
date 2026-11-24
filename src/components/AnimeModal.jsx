import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Calendar, Tv, Building2, Youtube, ExternalLink } from 'lucide-react';
import WatchButton from './WatchButton';
import AddToWatchListButton from './AddToWachListButton';
import { statusInfo, seasonLabel, formatDate } from '../Utils/animeFormat';

// Details dialog opened from any card. Closes on Esc, backdrop click or the X.
const AnimeModal = ({ anime, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!anime) return null;

  const cover = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const status = statusInfo(anime.status);
  const trailerUrl =
    anime.trailer?.site === 'youtube' && anime.trailer?.id
      ? `https://www.youtube.com/watch?v=${anime.trailer.id}`
      : null;

  const facts = [
    { icon: Calendar, label: 'Aired', value: formatDate(anime.aired?.from) },
    { icon: Calendar, label: 'Season', value: seasonLabel(anime) },
    { icon: Tv, label: 'Episodes', value: anime.episodes || (anime.status === 'RELEASING' ? 'Ongoing' : 'TBA') },
    { icon: Building2, label: 'Studio', value: anime.studios?.[0]?.name || 'TBA' },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={anime.title}
        className="glass-strong relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-xl shadow-2xl sm:rounded-xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-pink-500"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Banner */}
        <div className="relative h-40 w-full overflow-hidden sm:h-52">
          <img
            src={anime.banner || cover}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1020] via-[#0f1020]/40 to-transparent" />
        </div>

        <div className="relative -mt-20 flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:px-8">
          <img
            src={cover}
            alt={anime.title}
            className="mx-auto h-48 w-32 shrink-0 rounded-lg object-cover shadow-2xl ring-2 ring-white/20 sm:mx-0 sm:h-60 sm:w-40"
          />

          <div className="min-w-0 flex-1 sm:pt-16">
            <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{anime.title}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="chip gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {anime.type && <span className="chip">{anime.type}</span>}
              {anime.score && (
                <span className="chip gap-1 text-yellow-300">
                  <Star className="h-3 w-3" fill="currentColor" />
                  {anime.score}
                </span>
              )}
              {anime.genres?.slice(0, 4).map((g) => (
                <span key={g.name} className="chip">
                  {g.name}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-start gap-3">
              <WatchButton anime={anime} variant="large" />
              <AddToWatchListButton anime={anime} variant="full" />
              {trailerUrl && (
                <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <Youtube className="h-4 w-4" />
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 px-5 pb-8 sm:px-8">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/5 p-3">
                <dt className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-gray-100">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-pink-400">Synopsis</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {anime.synopsis || 'No synopsis available yet.'}
            </p>
          </div>

          {anime.url && (
            <a
              href={anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition hover:text-pink-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on AniList
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnimeModal;
