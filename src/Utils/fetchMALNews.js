// src/utils/fetchMALNews.js
export const fetchMALNews = async () => {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://myanimelist.net/rss/news.xml`);
    const data = await res.json();
    return data.items.slice(0, 10);
  };
  