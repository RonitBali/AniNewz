// AniList GraphQL API - Free, no API key required
const ANILIST_URL = 'https://graphql.anilist.co';

const ANIME_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge }
  bannerImage
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
});

// Fetch currently airing anime
export const fetchAiring = async (page = 1, perPage = 12) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { page, perPage });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

// Fetch upcoming anime
export const fetchUpcoming = async (page = 1, perPage = 12) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(status: NOT_YET_RELEASED, type: ANIME, sort: POPULARITY_DESC) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { page, perPage });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

// Fetch most popular anime
export const fetchPopular = async (page = 1, perPage = 12) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: POPULARITY_DESC) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { page, perPage });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

// Fetch top anime (by score)
export const fetchTopAnime = async (page = 1, perPage = 25) => {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: SCORE_DESC, status_not: NOT_YET_RELEASED) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { page, perPage });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};

// Search anime by title
export const searchAnime = async (searchQuery, page = 1, perPage = 12) => {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${ANIME_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { search: searchQuery, page, perPage });
  return {
    data: data.Page.media.map(normalize),
    pagination: { last_visible_page: data.Page.pageInfo.lastPage },
  };
};
