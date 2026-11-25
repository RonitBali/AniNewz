// Served by api/news.js (cached, server-side RSS parse)
export const fetchMALNews = async () => {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error(`News error: ${res.status}`);
  return res.json();
};
