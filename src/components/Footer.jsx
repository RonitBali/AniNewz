import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const SOCIALS = [
  { href: 'https://github.com/RonitBali', label: 'GitHub', Icon: Github },
  { href: 'https://x.com/BaliRonit', label: 'X (Twitter)', Icon: Twitter },
  { href: 'https://www.linkedin.com/in/ronit-bali-xe/', label: 'LinkedIn', Icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="glass-strong mt-12 border-x-0 border-b-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-extrabold text-pink-500">AniNewz</p>
          <p className="mt-1 text-xs text-gray-400">
            Anime data from{' '}
            <a href="https://anilist.co" target="_blank" rel="noreferrer" className="underline hover:text-pink-400">
              AniList
            </a>
            . News from MyAnimeList.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-300" aria-label="Footer">
          <Link to="/" className="hover:text-pink-400">Discover</Link>
          <Link to="/topanime" className="hover:text-pink-400">Top Anime</Link>
          <Link to="/schedule" className="hover:text-pink-400">Schedule</Link>
          <Link to="/news" className="hover:text-pink-400">News</Link>
          <Link to="/watchlist" className="hover:text-pink-400">Watchlist</Link>
        </nav>

        <div className="flex flex-col items-center gap-2 sm:items-end">
          <div className="flex gap-4">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                <Icon className="h-5 w-5 text-gray-300 transition hover:text-pink-400" />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} AniNewz · Built by Ronit Bali</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
