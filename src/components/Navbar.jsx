import { useState } from "react";
import { Search, Menu } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#1f1f1f]/60 backdrop-blur-md text-white shadow-md sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold text-pink-500">AniNewz</div>

        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="/" className="hover:text-pink-400">Upcoming</a>
          <a href="/top" className="hover:text-pink-400">Top Anime</a>
          <a href="/seasonal" className="hover:text-pink-400">Seasonal</a>
          <a href="/favorites" className="hover:text-pink-400">Watchlist</a>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-md">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anime..."
            className="bg-transparent outline-none text-sm text-white"
          />
        </div>

        {/* Mobile menu icon */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2a2a2a] px-4 pb-4 space-y-2 text-sm">
          <a href="/" className="block hover:text-pink-400">Upcoming</a>
          <a href="/top" className="block hover:text-pink-400">Top Anime</a>
          <a href="/seasonal" className="block hover:text-pink-400">Seasonal</a>
          <a href="/favorites" className="block hover:text-pink-400">Watchlist</a>
          <input
            type="text"
            placeholder="Search anime..."
            className="w-full mt-2 px-3 py-1 rounded-md bg-gray-700 text-white outline-none"
          />
        </div>
      )}
    </nav>
  );
}
