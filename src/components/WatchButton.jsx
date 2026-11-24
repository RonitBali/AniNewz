import React from 'react';
import { Play } from 'lucide-react';

// variant: "compact" (card overlay) | "large" (modal / spotlight)
const WatchButton = ({ anime, variant = 'compact' }) => {
  // AniList returns title as a plain string (normalized in anilist.js)
  const animeTitle =
    typeof anime?.title === 'string'
      ? anime.title
      : anime?.title?.english || anime?.title?.romaji || '';

  // reanime.cz routes by slug, not AniList ID. /api/reanime looks the slug up
  // (matching anilist_id, normalized as mal_id in anilist.js) and redirects to
  // the watch page, or to the site's search if there is no exact match.
  const watchUrl = `/api/reanime?id=${encodeURIComponent(anime?.mal_id ?? '')}&title=${encodeURIComponent(animeTitle)}`;

  const handleWatch = (e) => {
    e.stopPropagation();
    // Open once. With 'noopener', window.open always returns null, so never retry on that.
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  const size = variant === 'large' ? 'px-6 py-3 text-base' : 'px-3 py-1.5 text-xs';

  return (
    <button onClick={handleWatch} className={`btn-primary ${size}`}>
      <Play className={variant === 'large' ? 'h-5 w-5' : 'h-3.5 w-3.5'} fill="currentColor" />
      Watch Now
    </button>
  );
};

export default WatchButton;
