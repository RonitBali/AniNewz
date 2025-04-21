// src/components/AnimeNews.js
import React, { useEffect, useState } from 'react';
import { fetchMALNews } from '../Utils/fetchMALNews';

const AnimeNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMALNews()
      .then((items) => {
        setNews(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching anime news:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">📰 Latest Anime News</h2>

      {loading ? (
        <div className="text-gray-400">Loading news...</div>
      ) : (
        <div className="grid gap-4">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 hover:bg-gray-700 transition-all p-4 rounded-lg shadow-md"
            >
              <h3 className="text-white font-semibold">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.contentSnippet}</p>
              <p className="text-pink-500 text-xs mt-2">{new Date(item.pubDate).toLocaleDateString()}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimeNews;
