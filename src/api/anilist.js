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
`;

const gql = async (query, variables) => {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
};

// Normalize AniList anime to a shape similar to Jikan's for easy use
export const normalize = (anime) => ({
  mal_id: anime.id,
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
});

// Build one page query. `args` is the media(...) argument string.
const buildQuery = (args, vars) => {
  const declared = Object.entries(vars).map(([k, t]) => `$${k}: ${t}`).join(', ');
  const query = `
    query ($page: Int, $perPage: Int${declared ? ', ' + declared : ''}) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(${args}) { ${ANIME_FIELDS} }
      }
    }
  `;
  return query;
};

const runPage = async (args, types, values, page, perPage) => {
  const query = buildQuery(args, types);
  const data = await gql(query, { page, perPage, ...values });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

export const fetchAiring = (page = 1, perPage = 12) =>
  runPage('status: RELEASING, type: ANIME, sort: POPULARITY_DESC', {}, {}, page, perPage);

export const fetchUpcoming = (page = 1, perPage = 12) =>
  runPage('status: NOT_YET_RELEASED, type: ANIME, sort: POPULARITY_DESC', {}, {}, page, perPage);

export const fetchPopular = (page = 1, perPage = 12) =>
  runPage('type: ANIME, sort: POPULARITY_DESC', {}, {}, page, perPage);

export const fetchTopAnime = (page = 1, perPage = 25) =>
  runPage('type: ANIME, sort: SCORE_DESC, status_not: NOT_YET_RELEASED', {}, {}, page, perPage);

export const searchAnime = (searchQuery, page = 1, perPage = 12) =>
  runPage('search: $search, type: ANIME, sort: SEARCH_MATCH', { search: 'String' }, { search: searchQuery }, page, perPage);
