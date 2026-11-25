// Latest anime news from MyAnimeList's RSS feed, cached at the edge.
import Parser from 'rss-parser';

const FEED = 'https://myanimelist.net/rss/news.xml';

export default async function handler(req, res) {
  try {
    const feed = await new Parser({ timeout: 8000 }).parseURL(FEED);
    const items = feed.items.slice(0, 10).map((i) => ({
      title: i.title,
      link: i.link,
      pubDate: i.pubDate,
      contentSnippet: (i.contentSnippet || '').slice(0, 300),
    }));
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(items));
  } catch {
    return res.status(502).send(JSON.stringify({ error: 'News unavailable' }));
  }
}
