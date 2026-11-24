import React from 'react';
import { Star, Tv } from 'lucide-react';
import AddToWatchListButton from './AddToWachListButton';
import WatchButton from './WatchButton';
import { statusInfo } from '../Utils/animeFormat';

// Poster-style card. Clicking the poster/title opens the details modal (onOpen).
// rank: optional number shown as a badge (Top Anime page).
const AnimeCard = ({ anime, onOpen, rank }) => {
  if (!anime) return null;

  // Grid tiles are small, so use the lighter cover (the modal loads the large one)
  const imgUrl = anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url;
  const status = statusInfo(anime.status);
  const genres = anime.genres?.slice(0, 2).map((g) => g.name).join(' · ');

  return (
    <article className="group relative">
      <button
        type="button"
        onClick={() => onOpen?.(anime)}
        className="block w-full rounded-lg text-left"
        aria-label={`View details for ${anime.title}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:border-pink-500/50">
          <img
            src={imgUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Status */}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {/* Score */}
          {anime.score && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">
              <Star className="h-3 w-3" fill="currentColor" />
              {anime.score}
            </span>
          )}
        </div>

        <div className="mt-3 px-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-100 transition group-hover:text-pink-400">
            {anime.title || 'No title found'}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-400">
            {anime.episodes ? (
              <>
                <Tv className="h-3 w-3 shrink-0" />
                {anime.episodes} eps
              </>
            ) : null}
            {anime.episodes && genres ? <span aria-hidden>·</span> : null}
            <span className="truncate">{genres}</span>
          </p>
        </div>
      </button>

      {/* Rank badge */}
      {rank && (
        <div className="pointer-events-none absolute -left-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-sm font-extrabold text-white shadow-lg ring-2 ring-white/80">
          {rank}
        </div>
      )}

      {/* Quick actions (always visible on touch, fade in on hover for desktop) */}
      <div className="absolute right-2 top-2 z-10 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        <AddToWatchListButton anime={anime} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[calc(50%-1rem)] z-10 hidden justify-center opacity-0 transition md:flex md:group-hover:opacity-100 md:focus-within:opacity-100 [&>*]:pointer-events-auto">
        <WatchButton anime={anime} />
      </div>
    </article>
  );
};

export default AnimeCard;
