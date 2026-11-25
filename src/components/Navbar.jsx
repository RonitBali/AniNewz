import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Authentication from './Authentication';

const LINKS = [
  { to: '/', label: 'Discover', end: true },
  { to: '/topanime', label: 'Top Anime' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/news', label: 'News' },
  { to: '/watchlist', label: 'Watchlist' },
];

const linkClass = ({ isActive }) =>
  `border-b-2 px-1 py-1.5 text-sm font-medium transition ${
    isActive ? 'border-pink-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
  }`;

export default function Navbar({ onUserChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/?q=${encodeURIComponent(q)}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border border-x-0 border-t-0 border-white/10 bg-[#0d0d16]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-white">
          Ani<span className="text-pink-500">Newz</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop search */}
        <form onSubmit={submitSearch} role="search" className="ml-auto hidden max-w-xs flex-1 md:block">
          <label htmlFor="nav-search" className="sr-only">
            Search anime
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="nav-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none transition focus:border-pink-500/60 focus:bg-white/10"
            />
          </div>
        </form>

        <div className="hidden md:block">
          <Authentication onUserChange={onUserChange} />
        </div>

        {/* Mobile controls */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Authentication onUserChange={onUserChange} />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="space-y-3 border-t border-white/10 px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} role="search" className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              aria-label="Search anime"
              className="w-full rounded-md border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 outline-none focus:border-pink-500/60"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setIsOpen(false)} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
