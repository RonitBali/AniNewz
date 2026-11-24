import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../Utils/WatchListUtil';
import { app } from '../Utils/Firebase';

// variant: "icon" (round button on cards) | "full" (labelled button in modal)
const AddToWatchListButton = ({ anime, variant = 'icon' }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Track auth state so the saved/unsaved state is right even if auth loads late
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (user && anime) {
      isInWatchlist(user, anime.mal_id).then((result) => {
        if (!cancelled) setInWatchlist(result);
      });
    } else {
      setInWatchlist(false);
    }
    return () => {
      cancelled = true;
    };
  }, [anime, user]);

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
      if (result.success) setInWatchlist(!inWatchlist);
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
          className="absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white shadow-xl ring-1 ring-white/10"
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default AddToWatchListButton;
