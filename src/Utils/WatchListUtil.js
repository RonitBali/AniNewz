import { getDatabase, ref, set, get } from 'firebase/database';
import { app } from '../Utils/Firebase.Jsx';

// Add anime to user's watchlist
export const addToWatchlist = async (user, anime) => {
  if (!user) {
    console.error("User not logged in");
    return { success: false, message: "You need to log in to add anime to your watchlist" };
  }

  try {
    const db = getDatabase(app);
    const animeData = {
      id: anime.mal_id.toString(),
      title: anime.title,
      image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
      type: anime.type || "Unknown",
      score: anime.score || null,
      addedAt: new Date().toISOString()
    };

    await set(ref(db, `users/${user.uid}/watchlist/${anime.mal_id}`), animeData);
    return { success: true, message: "Added to watchlist" };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return { success: false, message: "Failed to add to watchlist" };
  }
};

// Check if anime is in watchlist
export const isInWatchlist = async (user, animeId) => {
  if (!user) return false;
  
  try {
    const db = getDatabase(app);
    const snapshot = await get(ref(db, `users/${user.uid}/watchlist/${animeId}`));
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (user, animeId) => {
  if (!user) return { success: false, message: "User not logged in" };
  
  try {
    const db = getDatabase(app);
    await set(ref(db, `users/${user.uid}/watchlist/${animeId}`), null);
    return { success: true, message: "Removed from watchlist" };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return { success: false, message: "Failed to remove from watchlist" };
  }
};