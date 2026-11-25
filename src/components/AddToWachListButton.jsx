import React, { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist } from '../Utils/WatchListUtil';
import { useWatchlist } from '../Utils/WatchlistContext';

// variant: "icon" (round button on cards) | "full" (labelled button in modal)
const AddToWatchListButton = ({ anime, variant = 'icon' }) => {
  const { user, savedIds } = useWatchlist();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const inWatchlist = savedIds.has(String(anime.mal_id));

  const flash = (text, ms = 2500) => {
    setMessage(text);
    setTimeout(() => setMessage(''), ms);
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      flash('Log in to save anime');
      return;
    }

    setLoading(true);
    try {
      const result = inWatchlist
        ? await removeFromWatchlist(user, anime.mal_id)
        : await addToWatchlist(user, anime);
      flash(result.message);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      flash('Something went wrong');
    }
    setLoading(false);
  };

  const Icon = inWatchlist ? BookmarkCheck : Bookmark;
  const label = inWatchlist ? 'Remove from watchlist' : 'Add to watchlist';

  return (
    <div className="relative">
      {variant === 'full' ? (
        <button onClick={handleToggle} disabled={loading} className={inWatchlist ? 'btn-primary' : 'btn-ghost'}>
          <Icon className="h-4 w-4" />
          {inWatchlist ? 'In watchlist' : 'Add to watchlist'}
        </button>
      ) : (
        <button
          onClick={handleToggle}
          disabled={loading}
          aria-label={label}
          title={label}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-50 ${
            inWatchlist ? 'bg-pink-500 text-white' : 'bg-black/70 text-white hover:bg-pink-500'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      )}

      {message && (
        <div
          role="status"
          className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-2xl bg-gray-900 px-3 py-1.5 text-xs text-white shadow-xl ring-1 ring-white/10"
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AddToWatchListButton;
