import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from './Firebase';

// One auth listener and one watchlist listener for the whole app.
// Cards read saved state from memory instead of querying Firebase each.
const WatchlistContext = createContext({ user: null, savedIds: new Set(), ready: false });

export const WatchlistProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stopList = () => {};
    const stopAuth = onAuthStateChanged(getAuth(app), (currentUser) => {
      stopList();
      setUser(currentUser);
      if (!currentUser) {
        setSavedIds(new Set());
        setReady(true);
        return;
      }
      stopList = onValue(
        ref(getDatabase(app), `users/${currentUser.uid}/watchlist`),
        (snap) => {
          setSavedIds(new Set(Object.keys(snap.val() || {})));
          setReady(true);
        },
        () => setReady(true)
      );
    });
    return () => {
      stopAuth();
      stopList();
    };
  }, []);

  const value = useMemo(() => ({ user, savedIds, ready }), [user, savedIds, ready]);
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWatchlist = () => useContext(WatchlistContext);
