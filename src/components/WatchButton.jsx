import React from 'react';
import { ExternalLink } from 'lucide-react';

const WatchButton = ({ anime }) => {
  // AniList returns title as a plain string (normalized in anilist.js)
  // Fallback chain: title string → title.english → title.romaji
  const animeTitle =
    typeof anime?.title === 'string'
      ? anime.title
      : anime?.title?.english || anime?.title?.romaji || '';

  // Build slug for gogoanime-style URLs
  const slugTitle = animeTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Sites in priority order — animepahe.su is the current live domain (.ru redirects here)
  const sites = [
    {
      name: 'AnimePahe',
      url: `https://animepahe.su/anime?q=${encodeURIComponent(animeTitle)}`,
    },
    {
      name: 'AnimePahe (mirror)',
      url: `https://animepahe.ru/anime?q=${encodeURIComponent(animeTitle)}`,
    },
    {
      name: 'GogoAnime',
      url: `https://gogoanime3.co/search.html?keyword=${encodeURIComponent(animeTitle)}`,
    },
  ];

  const handleWatch = (e) => {
    e.stopPropagation();
    // Always open the first working site in a new tab
    for (const site of sites) {
      const newWindow = window.open(site.url, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) return;
    }
  };

  return (
    <div className="relative z-30">
      <button
        onClick={handleWatch}
        className="flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        Watch Now
      </button>
    </div>
  );
};

export default WatchButton;
