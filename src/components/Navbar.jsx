import { useState } from "react";
import { Search, Menu } from "lucide-react";
import { Link } from 'react-router-dom';
import Authentication from "./Authentication"; // Import the Authentication component

export default function Navbar({ searchquery, setSearchquery, user, onUserChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchquery(query);
  };

  return (
    <nav className="bg-[#1f1f1f]/60 backdrop-blur-md text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-4xl font-bold text-pink-500">AniNewz</div>

        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-pink-400 text-xl">Upcoming</Link>
          <Link to="/topanime" className="hover:text-pink-400 text-xl">Top Anime</Link>
          <Link to="/seasonal" className="hover:text-pink-400 text-xl">Seasonal</Link>
          <Link to="/watchlist" className="hover:text-pink-400 text-xl">Watchlist</Link>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-md">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchquery}
            onChange={handleSearch}
            className="bg-transparent outline-none text-md text-white"
          />
        </div>
        
        {/* User display section */}
        <div className="flex items-center gap-3">
  {user && (
    <div className="hidden md:flex items-center gap-2">
      {user.photoURL && (
        <img 
          src={user.photoURL} 
          alt="Profile" 
          className="w-8 h-8 rounded-full border-2 border-pink-400 object-cover"
        />
      )}
      <span className="text-sm text-gray-200">
        Logged in as <span className="font-medium text-pink-300">{user.displayName}</span>
      </span>
    </div>
  )}
  
  {/* Using the Authentication component */}
  <Authentication onUserChange={onUserChange} />
</div>

        {/* Mobile menu icon */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2a2a2a] px-4 pb-4 space-y-2 text-sm">
          <Link to="/" className="block hover:text-pink-400">Upcoming</Link>
          <Link to="/topanime" className="block hover:text-pink-400">Top Anime</Link>
          <Link to="/seasonal" className="block hover:text-pink-400">Seasonal</Link>
          <Link to="/watchlist" className="block hover:text-pink-400">Watchlist</Link>
          <input
            type="text"
            placeholder="Search anime..."
            value={searchquery}
            onChange={handleSearch}
            className="w-full mt-2 px-3 py-1 rounded-md bg-gray-700 text-white outline-none"
          />
        </div>
      )}
    </nav>
  );
}