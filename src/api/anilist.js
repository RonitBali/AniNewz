// AniList GraphQL API - Free, no API key required
const ANILIST_URL = 'https://graphql.anilist.co';

const ANIME_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge }
  bannerImage
  format
  description(asHtml: false)
  episodes
  status
  averageScore
  popularity
  genres
  season
  seasonYear
  startDate { year month day }
  endDate { year month day }
  studios(isMain: true) { nodes { name } }
  trailer { id site }
  siteUrl
  externalLinks { site url type }
  nextAiringEpisode { episode airingAt }
`;

// ---- sessionStorage cache (keeps us well under AniList's 90 requests/min) ----
const CACHE_PREFIX = 'anl:';
const CACHE_TTL = 5 * 60 * 1000;

const cacheGet = (key) => {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_TTL ? data : null;
  } catch {
    return null;
  }
};

const cacheSet = (key, data) => {
  const entry = JSON.stringify({ at: Date.now(), data });
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, entry);
  } catch {
    // Quota full: drop our entries and try once more
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .forEach((k) => sessionStorage.removeItem(k));
      sessionStorage.setItem(CACHE_PREFIX + key, entry);
    } catch {
      /* storage unavailable: run uncached */
    }
  }
};

const gql = async (query, variables, signal) => {
  const key = JSON.stringify([query, variables]);
  const cached = cacheGet(key);
  if (cached) return cached;

  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  cacheSet(key, json.data);
  return json.data;
};

export const isAbort = (err) => err?.name === 'AbortError';

// Normalize AniList anime to the shape the UI uses
export const normalize = (anime) => ({
  mal_id: anime.id, // holds the AniList id (name kept: saved watchlists use it as key)
  title: anime.title?.english || anime.title?.romaji || 'Unknown',
  images: { jpg: { image_url: anime.coverImage?.large, large_image_url: anime.coverImage?.extraLarge } },
  banner: anime.bannerImage,
  type: anime.format ? anime.format.replace(/_/g, ' ') : null,
  synopsis: anime.description?.replace(/<[^>]+>/g, '') || '',
  score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null,
  members: anime.popularity,
  episodes: anime.episodes,
  status: anime.status,
  genres: (anime.genres || []).map((g) => ({ name: g })),
  studios: (anime.studios?.nodes || []).map((s) => ({ name: s.name })),
  url: anime.siteUrl,
  aired: {
    from: anime.startDate?.year
      ? `${anime.startDate.year}-${String(anime.startDate.month || 1).padStart(2, '0')}-${String(anime.startDate.day || 1).padStart(2, '0')}`
      : null,
  },
  season: anime.season,
  year: anime.seasonYear,
  trailer: anime.trailer,
  streamingLinks: (anime.externalLinks || [])
    .filter((l) => l.type === 'STREAMING' && l.url)
    .map((l) => ({ site: l.site, url: l.url })),
  nextEpisode: anime.nextAiringEpisode
    ? { episode: anime.nextAiringEpisode.episode, airingAt: anime.nextAiringEpisode.airingAt }
    : null,
});

// ---- Filters ----
export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music',
  'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller',
];
export const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
export const FORMATS = ['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'];

const TAB_ARGS = {
  airing: 'status: RELEASING, sort: POPULARITY_DESC',
  upcoming: 'status: NOT_YET_RELEASED, sort: POPULARITY_DESC',
  popular: 'sort: POPULARITY_DESC',
};

// One page of anime for a Discover tab (or a search), with optional filters.
// filters: { genre, year, season, format } (all optional strings)
export const browseAnime = async ({ tab = 'popular', search = '', filters = {}, page = 1, perPage = 12, signal } = {}) => {
  const types = { page: 'Int', perPage: 'Int' };
  const values = { page, perPage };
  const args = ['type: ANIME'];

  if (search) {
    types.search = 'String';
    values.search = search;
    args.push('search: $search', 'sort: SEARCH_MATCH');
  } else {
    args.push(TAB_ARGS[tab] || TAB_ARGS.popular);
  }
  if (filters.genre) { types.genre = 'String'; values.genre = filters.genre; args.push('genre: $genre'); }
  if (filters.year) { types.seasonYear = 'Int'; values.seasonYear = Number(filters.year); args.push('seasonYear: $seasonYear'); }
  if (filters.season) { types.season = 'MediaSeason'; values.season = filters.season; args.push('season: $season'); }
  if (filters.format) { types.format = 'MediaFormat'; values.format = filters.format; args.push('format: $format'); }

  const declared = Object.entries(types).map(([k, t]) => `$${k}: ${t}`).join(', ');
  const query = `
    query (${declared}) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(${args.join(', ')}) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, values, signal);
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

export const fetchAiring = (page = 1, perPage = 12, signal) => browseAnime({ tab: 'airing', page, perPage, signal });

export const fetchTopAnime = async (page = 1, perPage = 25, signal) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: SCORE_DESC, status_not: NOT_YET_RELEASED) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { page, perPage }, signal);
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

// One anime by AniList id (deep link page)
export const fetchAnimeById = async (id, signal) => {
  const query = `query ($id: Int) { Media(id: $id, type: ANIME) { ${ANIME_FIELDS} } }`;
  const data = await gql(query, { id: Number(id) }, signal);
  return normalize(data.Media);
};

// Episodes airing between two unix timestamps (seconds), soonest first
export const fetchSchedule = async (start, end, page = 1, signal) => {
  const query = `
    query ($start: Int, $end: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
          airingAt
          episode
          media { ${ANIME_FIELDS} isAdult }
        }
      }
    }
  `;
  const data = await gql(query, { start, end, page }, signal);
  return {
    items: data.Page.airingSchedules
      .filter((s) => s.media && !s.media.isAdult)
      .map((s) => ({ airingAt: s.airingAt, episode: s.episode, anime: normalize(s.media) })),
    hasNext: data.Page.pageInfo.hasNextPage,
  };
};
