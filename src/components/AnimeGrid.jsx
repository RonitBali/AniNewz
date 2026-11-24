import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimeCard from './AnimeCard';
import AnimeModal from './AnimeModal';

// Responsive poster grid that owns the details modal.
// showRank: number cards 1..n (Top Anime page).
const AnimeGrid = ({ items, showRank = false }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      >
        {items.map((anime, i) => (
          <motion.div
            key={anime.mal_id}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          >
            <AnimeCard anime={anime} onOpen={setSelected} rank={showRank ? i + 1 : undefined} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && <AnimeModal key={selected.mal_id} anime={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
};

export default AnimeGrid;
