// Resolves an AniList ID to its reanime.cz watch page and redirects there.
// reanime.cz routes by slug ("one-piece-xamk74"), not by AniList ID, and its
// search results embed `anime_id:"<slug>",anilist_id:<id>`, so we match on that.
const BASE = 'https://reanime.cz';

export default async function handler(req, res) {
  const { id = '' } = req.query;
  const title = String(req.query.title || '').slice(0, 200);
  const searchUrl = `${BASE}/search?q=${encodeURIComponent(title)}`;

  try {
    if (/^d{1,9}$/.test(id) && title) {
      const r = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await r.text();
      const re = /anime_id:"([^"]+)",anilist_id:(\d+)/g;
      let m;
      while ((m = re.exec(html))) {
        if (m[2] === String(id)) {
          res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
          return res.redirect(302, `${BASE}/watch/${m[1]}?ep=1&lang=sub`);
        }
      }
    }
  } catch {
    // fall through to the search page
  }

  // No exact match: land on the site's search for this title.
  return res.redirect(302, searchUrl);
}
