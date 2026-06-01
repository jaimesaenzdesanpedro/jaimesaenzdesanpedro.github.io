/**
 * Tavily web search client. Returns the top results for a query.
 */
export async function tavilySearch(query, { maxResults = 5 } = {}) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('TAVILY_API_KEY is not configured');

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'advanced',
      max_results: maxResults,
      include_answer: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Tavily request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const results = (data.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
  return { answer: data.answer || '', results };
}
