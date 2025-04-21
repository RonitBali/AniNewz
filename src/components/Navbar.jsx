import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Link } from 'react-router-dom';
import Authentication from "./Authentication"; // Import the Authentication component

export default function Navbar({ searchquery, setSearchquery, user, onUserChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchquery(query);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-[#1f1f1f]/60 backdrop-blur-md text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-pink-500">AniNewz</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 lg:space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-pink-400 text-lg lg:text-xl transition-colors">Upcoming</Link>
          <Link to="/topanime" className="hover:text-pink-400 text-lg lg:text-xl transition-colors">Top Anime</Link>
          <Link to="/Animenews" className="hover:text-pink-400 text-lg lg:text-xl transition-colors">AnimeNews</Link>
          <Link to="/watchlist" className="hover:text-pink-400 text-lg lg:text-xl transition-colors">Watchlist</Link>
        </div>

        
        
        {/* User display section */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <div className="items-center gap-2 hidden lg:flex">
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

        {/* Mobile Menu & Search */}
        <div className="flex items-center space-x-3 md:hidden">
          <div className="relative">
            <button 
              onClick={() => {
                document.getElementById('mobileSearch').focus();
              }}
              className="p-1 rounded-full bg-gray-800 text-gray-400"
            >
              <Search size={18} />
            </button>
          </div>
          
          {/* Mobile Authentication */}
          <div className="flex items-center">
            <Authentication onUserChange={onUserChange} />
          </div>
          
          {/* Mobile menu toggle */}
          <button 
            onClick={toggleMenu} 
            className="p-1 rounded-full bg-gray-800 text-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2a2a2a] px-4 py-3 space-y-3 text-center border-t border-gray-700">
          <Link to="/" onClick={toggleMenu} className="block py-2 hover:text-pink-400 text-lg transition-colors">Upcoming</Link>
          <Link to="/topanime" onClick={toggleMenu} className="block py-2 hover:text-pink-400 text-lg transition-colors">Top Anime</Link>
          <Link to="/Animenews" onClick={toggleMenu} className="block py-2 hover:text-pink-400 text-lg transition-colors">AnimeNews</Link>
          <Link to="/watchlist" onClick={toggleMenu} className="block py-2 hover:text-pink-400 text-lg transition-colors">Watchlist</Link>
          
          {/* User info on mobile */}
          {user && (
            <div className="flex items-center justify-center gap-2 py-2 border-t border-gray-700 mt-3 pt-3">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full border-2 border-pink-400 object-cover"
                />
              )}
              <span className="text-sm text-gray-200">
                Logged in as <span className="font-medium text-pink-300">{user.displayName || "User"}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}