import React, { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../Utils/WatchListUtil';
import { getAuth } from 'firebase/auth';
import { app } from '../Utils/Firebase';

const AddToWatchListButton = ({ anime }) => {
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const auth = getAuth(app);
  
    useEffect(() => {
        // Get current auth state
        const currentUser = auth.currentUser;
        setUser(currentUser);
        
        const checkWatchlist = async () => {
            if (currentUser && anime) {
                const result = await isInWatchlist(currentUser, anime.mal_id);
                setInWatchlist(result);
            } else {
                setInWatchlist(false);
            }
        };
        
        checkWatchlist();
    }, [anime, auth.currentUser]);
    
    const handleToggleWatchlist = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setMessage('Please log in to add to watchlist');
            setTimeout(() => setMessage(''), 2000);
            return;
        }
    
        setLoading(true);
        try {
            if (inWatchlist) {
                const result = await removeFromWatchlist(currentUser, anime.mal_id);
                if (result.success) {
                    setInWatchlist(false);
                }
                setMessage(result.message);
            } else {
                const result = await addToWatchlist(currentUser, anime);
                if (result.success) {
                    setInWatchlist(true);
                }
                setMessage(result.message);
            }
            
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error updating watchlist:", error);
            setMessage('An error occurred');
            setTimeout(() => setMessage(''), 3000);
        }
    
        setLoading(false);
    };
    
    return (
        <div className="relative">
            <button
                onClick={handleToggleWatchlist}
                disabled={loading}
                className={`
                flex items-center gap-1 px-3 py-1 rounded-md transition-all
                ${inWatchlist 
                    ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }
                ${loading ? 'opacity-50 cursor-wait' : ''}
                `}
            >
                {inWatchlist ? (
                    <>
                        <HeartOff size={16} className="stroke-current" />
                        <span>Remove</span>
                    </>
                ) : (
                    <>
                        <Heart size={16} className="stroke-current" />
                        <span>Add to Watchlist</span>
                    </>
                )}
            </button>
            
            {message && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                    {message}
                </div>
            )}
        </div>
    );
};

export default AddToWatchListButton;