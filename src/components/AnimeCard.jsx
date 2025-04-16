import React from 'react';
import { Star, Play, Clock } from 'lucide-react';

const AnimeCard = ({ anime }) => {
  if (!anime) return null;

  const imgUrl = anime?.images?.jpg?.image_url;

  return (
    <section className='flex gap-6 justify-center px-4 overflow-x-auto'>
      <div className="group relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#1f1f1f]/60 backdrop-blur-md border border-pink-500/30 shadow-pink-500/10 shadow-2xl transition-transform duration-300 hover:scale-[1.03]">
        
        {/* Anime Image */}
        <div className="relative h-72 w-full overflow-hidden">
          <img
            src={imgUrl}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
        </div>

        {/* Content */}
        <div className="z-20 p-4 text-white space-y-2">
          
          {/* Status */}
          <span
            className={`inline-flex items-center text-xs font-semibold rounded-full px-3 py-1
              ${
                anime.status === 'Currently Airing'
                  ? 'bg-pink-500/20 text-pink-300'
                  : anime.status === 'Finished Airing'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-gray-500/20 text-gray-300'
              }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {anime.status}
          </span>

          {/* Title */}
          <h2 className="text-xl font-bold text-pink-400 drop-shadow-pink-500">
            {anime.title || 'No title found'}
          </h2>

          {/* Stats (optional) */}
          <div className="flex items-center gap-4 text-sm text-pink-200 mt-2">
            {anime.score && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {anime.score}
              </div>
            )}
            {anime.episodes && (
              <div className="flex items-center">
                <Play className="h-4 w-4 mr-1 text-cyan-400" />
                {anime.episodes} eps
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimeCard;
