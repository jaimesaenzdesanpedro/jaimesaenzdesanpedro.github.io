import Anthropic from '@anthropic-ai/sdk';

// The spec requested 'claude-sonnet-4-20250514', but that snapshot is no longer
// available on this account (superseded). Default to an available pinned Sonnet
// and allow an override via ANTHROPIC_MODEL so the original can be restored on an
// account that still has access to it.
export const RESEARCH_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

let client;
function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/**
 * Generates the structured market research report.
 * @returns parsed JSON object matching the report schema.
 */
export async function generateResearch({ sector, market_cap, horizon, geography, tavilyResults }) {
  const prompt = `You are a financial research analyst. Based on the following real-time search data, generate a structured market research report for the ${sector} sector.
Filters: Market cap: ${market_cap}, Horizon: ${horizon}, Geography: ${geography}
Search data: ${JSON.stringify(tavilyResults)}
Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "macro_context": "2-3 paragraph analysis of the sector macro environment",
  "highlight": "one key stat or insight to highlight",
  "companies": [
    {
      "name": "Company name",
      "ticker": "TICK",
      "domain": "company.com",
      "description": "one line description with key metrics",
      "ytd": "+23%",
      "pe": "83x",
      "signal": "Earnings Jun 3",
      "signal_type": "watch"
    }
  ],
  "catalysts": [
    {
      "date": "Jun 3",
      "title": "Event title",
      "description": "2-sentence description"
    }
  ]
}
Return 3-5 companies and 4 catalysts.`;

  const message = await getClient().messages.create({
    model: RESEARCH_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  return parseReport(text);
}

/** Robustly parse a JSON object out of the model response. */
function parseReport(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('Could not parse research JSON from model response');
  }
}
