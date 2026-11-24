// AniList returns RELEASING / FINISHED / NOT_YET_RELEASED / CANCELLED / HIATUS.
const STATUS = {
  RELEASING: { label: 'Airing', dot: 'bg-emerald-400' },
  FINISHED: { label: 'Finished', dot: 'bg-sky-400' },
  NOT_YET_RELEASED: { label: 'Upcoming', dot: 'bg-amber-400' },
  CANCELLED: { label: 'Cancelled', dot: 'bg-red-400' },
  HIATUS: { label: 'Hiatus', dot: 'bg-gray-400' },
};

export const statusInfo = (status) => STATUS[status] || { label: status || 'Unknown', dot: 'bg-gray-400' };

export const seasonLabel = (anime) =>
  anime?.season && anime?.year
    ? `${anime.season.charAt(0)}${anime.season.slice(1).toLowerCase()} ${anime.year}`
    : 'TBA';

export const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
