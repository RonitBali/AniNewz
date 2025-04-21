import React, { useRef } from 'react';
import { ExternalLink } from 'lucide-react';

const WatchButton = ({ anime }) => {
  const buttonRef = useRef(null);
  
  // Get anime info for search
  const animeTitle = anime?.title || '';
  
  // Define sites with their URLs in priority order
  const sites = [
    { 
      name: "HiAnime", 
      url: `https://hianime.pe/search?keyword=${encodeURIComponent(animeTitle)}`
    },
    {
      name: "AnimePahe",
      url: `https://animepahe.ru/anime?q=${encodeURIComponent(animeTitle)}`
    },
    {
      name: "GogoAnime",
      url: `https://gogoanime.gg/search/${encodeURIComponent(animeTitle.toLowerCase().replace(/\s+/g, '-'))}`
    }
  ];

  // Site navigation with fallback logic
  const navigateWithFallback = (e) => {
    e.stopPropagation();
    
    // Store the sites we've attempted to visit
    const attemptedSites = new Set();
    let currentSiteIndex = 0;
    
    // Function to attempt opening a site
    const attemptSite = () => {
      // If we've tried all sites, stop
      if (currentSiteIndex >= sites.length) {
        return;
      }
      
      const site = sites[currentSiteIndex];
      attemptedSites.add(site.name);
      
      // Try opening the current site
      const newWindow = window.open(site.url, '_blank', 'noopener,noreferrer');
      
      // Increment index for potential next attempt
      currentSiteIndex++;
      
      // If window was blocked or failed to open, try next site
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Try the next site immediately
        attemptSite();
      }
    };
    
    // Start the process with the first site
    attemptSite();
  };

  return (
    <div className="relative z-30">
      <button
        ref={buttonRef}
        onClick={navigateWithFallback}
        className="flex items-center justify-center gap-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors "
      >
        <ExternalLink className="h-4 w-4" />
        Watch Now
      </button>
    </div>
  );
};

export default WatchButton;