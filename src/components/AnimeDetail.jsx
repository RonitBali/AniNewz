import React, { useState } from 'react';
import { X, Star, Calendar, Tv, Building2, Youtube, ExternalLink, Link2, Check } from 'lucide-react';
import WatchButton from './WatchButton';
import AddToWatchListButton from './AddToWachListButton';
import Countdown from './Countdown';
import { statusInfo, seasonLabel, formatDate } from '../Utils/animeFormat';

const trailerEmbed = (trailer) => {
  if (!trailer?.id) return null;
  if (trailer.site === 'youtube') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.id)}?autoplay=1`;
  if (trailer.site === 'dailymotion') return `https://www.dailymotion.com/embed/video/${encodeURIComponent(trailer.id)}?autoplay=1`;
  return null;
};

// Full anime details. Used inside the modal (onClose given) and on /anime/:id.
const AnimeDetail = ({ anime, onClose }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [copied, setCopied] = useState(false);

  const cover = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const status = statusInfo(anime.status);
  const embed = trailerEmbed(anime.trailer);
  const shareUrl = `${window.location.origin}/anime/${anime.mal_id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', shareUrl);
    }
  };

  const facts = [
    { icon: Calendar, label: 'Aired', value: formatDate(anime.aired?.from) },
    { icon: Calendar, label: 'Season', value: seasonLabel(anime) },
    { icon: Tv, label: 'Episodes', value: anime.episodes || (anime.status === 'RELEASING' ? 'Ongoing' : 'TBA') },
    { icon: Building2, label: 'Studio', value: anime.studios?.[0]?.name || 'TBA' },
  ];

  return (
    <>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-pink-500"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden sm:h-52">
        <img src={anime.banner || cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1020] via-[#0f1020]/40 to-transparent" />
      </div>

      <div className="relative -mt-20 flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:px-8">
        <img
          src={cover}
          alt={anime.title}
          className="mx-auto h-48 w-32 shrink-0 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20 sm:mx-0 sm:h-60 sm:w-40"
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

          {anime.nextEpisode && (
            <Countdown next={anime.nextEpisode} className="mt-3 text-sm font-medium text-emerald-300" />
          )}

          <div className="mt-5 flex flex-wrap items-start gap-3">
            <WatchButton anime={anime} variant="large" />
            <AddToWatchListButton anime={anime} variant="full" />
            {embed && (
              <button onClick={() => setShowTrailer((v) => !v)} className="btn-ghost" aria-expanded={showTrailer}>
                <Youtube className="h-4 w-4" />
                {showTrailer ? 'Hide trailer' : 'Trailer'}
              </button>
            )}
            <button onClick={copyLink} className="btn-ghost" aria-label="Copy link to this anime">
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? 'Copied' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 pb-8 sm:px-8">
        {showTrailer && embed && (
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <iframe
              src={embed}
              title={`${anime.title} trailer`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-3">
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

        {anime.streamingLinks?.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-pink-400">Watch legally</h3>
            <div className="flex flex-wrap gap-2">
              {anime.streamingLinks.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
                  {l.site}
                </a>
              ))}
            </div>
          </div>
        )}

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
    </>
  );
};

export default AnimeDetail;
