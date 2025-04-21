import React from 'react';
import { Star, Play, Clock, Calendar, Tv, Tag, Users } from 'lucide-react';
import AddToWachListButton from './AddToWachListButton';
import WatchButton from './WatchButton';

const AnimeCard = ({ anime, user }) => {
  if (!anime) return null;

  const imgUrl = anime?.images?.jpg?.image_url;
  
  // Format seasons and years
  const seasonInfo = anime.season && anime.year ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : "TBA";
  
  // Limit genres to first 2 for display
  const genres = anime.genres?.slice(0, 2).map(genre => genre.name).join(", ") || "N/A";
  
  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const airDate = formatDate(anime.aired?.from);

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl bg-[#1f1f1f]/60 backdrop-blur-md border border-pink-500/30 shadow-pink-500/10 shadow-2xl transition-transform duration-300 hover:scale-[1.03]">
      {/* Card Content in Flex Row */}
      <div className="flex flex-row h-64">
        {/* Anime Image */}
        <div className="relative h-full w-1/3 overflow-hidden">
          <img
            src={imgUrl}
            alt={anime.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50 z-10" />
          
          {/* Watchlist Button - Positioned at top right of image */}
          <div className="absolute top-2 right-2 z-20">
            <AddToWachListButton user={user} anime={anime} />
          </div>
          
          {/* Watch Now Button - Positioned at bottom center of image */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
            <WatchButton anime={anime} />
          </div>
        </div>

        {/* Content */}
        <div className="z-20 p-4 text-white flex flex-col justify-between w-2/3 relative">
          {/* Top section with title and status */}
          <div className="space-y-2">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center text-xs font-semibold rounded-full px-3 py-1 w-fit
                ${
                  anime.status === 'Currently Airing'
                    ? 'bg-pink-500/20 text-pink-300'
                    : anime.status === 'Finished Airing'
                    ? 'bg-purple-500/20 text-purple-300'
                    : anime.status === 'Not yet aired'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {anime.status}
            </span>

            {/* Title */}
            <h2 className="text-xl font-bold text-pink-400 drop-shadow-lg line-clamp-2">
              {anime.title || 'No title found'}
            </h2>
            
            {/* Japanese Title if available */}
            {anime.title_japanese && (
              <p className="text-sm text-gray-300 italic line-clamp-1">
                {anime.title_japanese}
              </p>
            )}
          </div>

          {/* Middle section with details */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
            {/* Air Date */}
            <div className="flex items-center text-cyan-200">
              <Calendar className="h-4 w-4 mr-2 text-cyan-400" />
              <span className="truncate">{airDate}</span>
            </div>
            
            {/* Season */}
            <div className="flex items-center text-purple-200">
              <Tv className="h-4 w-4 mr-2 text-purple-400" />
              <span className="truncate">{seasonInfo}</span>
            </div>
            
            {/* Genres */}
            <div className="flex items-center text-green-200">
              <Tag className="h-4 w-4 mr-2 text-green-400" />
              <span className="truncate">{genres}</span>
            </div>
            
            {/* Studio */}
            <div className="flex items-center text-yellow-200">
              <Users className="h-4 w-4 mr-2 text-yellow-400" />
              <span className="truncate">{anime.studios?.[0]?.name || "TBA"}</span>
            </div>
          </div>

          {/* Bottom section with stats */}
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
            {anime.members && (
              <div className="text-xs text-gray-400">
                {anime.members.toLocaleString()} members
              </div>
            )}
          </div>
          
          {/* Semi-transparent gradient overlay at the bottom for text legibility */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;