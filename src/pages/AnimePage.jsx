import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import AnimeDetail from '../components/AnimeDetail';
import { fetchAnimeById, isAbort } from '../api/anilist';
import useDocumentTitle from '../Utils/useDocumentTitle';

// Shareable page for one anime: /anime/:id
const AnimePage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [error, setError] = useState(null);

  useDocumentTitle(anime?.title);

  useEffect(() => {
    if (!/^\d+$/.test(id)) {
      setError('That anime link is not valid.');
      return;
    }
    const controller = new AbortController();
    setAnime(null);
    setError(null);
    fetchAnimeById(id, controller.signal)
      .then(setAnime)
      .catch((err) => {
        if (isAbort(err)) return;
        setError("Couldn't find that anime.");
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-300 transition hover:text-pink-400">
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </Link>

      {!anime && !error && <div className="skeleton h-[32rem] w-full rounded-xl" />}

      {error && (
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg p-8 text-center">
          <AlertCircle className="h-8 w-8 text-pink-400" />
          <p className="text-gray-200">{error}</p>
        </div>
      )}

      {anime && (
        <div className="glass-strong relative overflow-hidden rounded-xl shadow-2xl">
          <AnimeDetail anime={anime} />
        </div>
      )}
    </div>
  );
};

export default AnimePage;
