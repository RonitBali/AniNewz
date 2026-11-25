import React, { useEffect, useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { fetchMALNews } from '../Utils/fetchMALNews';
import useDocumentTitle from '../Utils/useDocumentTitle';

const AnimeNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useDocumentTitle('Anime news');

  useEffect(() => {
    fetchMALNews()
      .then(setNews)
      .catch((err) => {
        console.error('Error fetching anime news:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Latest News</h1>
        <p className="mt-2 text-sm text-gray-300">Fresh headlines from MyAnimeList. Opens in a new tab.</p>
      </header>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-pink-400" />
          <p className="text-gray-200">Couldn't load the news right now. Try again in a moment.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {news.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group block rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-pink-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold leading-snug text-gray-100 transition group-hover:text-pink-400">{item.title}</h2>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition group-hover:text-pink-400" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-gray-400">{item.contentSnippet || (item.description || '').replace(/<[^>]+>/g, '')}</p>
              <p className="mt-3 text-xs font-medium text-pink-400">
                {new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeNews;
