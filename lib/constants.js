export const SECTORS = [
  { id: 'ai', name: 'AI / Software', icon: '🤖', blurb: 'Cloud, SaaS, ML' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏢', blurb: 'REITs, data centers' },
  { id: 'energy', name: 'Energy', icon: '⚡', blurb: 'Renewables, Oil & Gas' },
  { id: 'healthcare', name: 'Healthcare', icon: '💊', blurb: 'Biotech, pharma' },
  { id: 'fintech', name: 'Fintech', icon: '💳', blurb: 'Payments, digital banking' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', blurb: 'Cloud sec, endpoints' },
  { id: 'other', name: 'Other', icon: '🔍', blurb: 'Custom sector', custom: true },
];

export const MARKET_CAPS = [
  { id: 'small', label: 'Small Cap', sub: '<$2B' },
  { id: 'mid', label: 'Mid Cap', sub: '$2B–$10B' },
  { id: 'large', label: 'Large Cap', sub: '$10B+' },
  { id: 'all', label: 'All', sub: '' },
];

export const HORIZONS = [
  { id: 'short', label: 'Short-term', sub: 'days–weeks' },
  { id: 'mid', label: 'Mid-term', sub: '3–12 months' },
  { id: 'long', label: 'Long-term', sub: '1 year+' },
];

export const GEOGRAPHIES = [
  { id: 'global', label: 'Global' },
  { id: 'us', label: 'United States' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia', label: 'Asia' },
  { id: 'emerging', label: 'Emerging Markets' },
];

export function sectorIcon(sectorName) {
  const match = SECTORS.find(
    (s) => s.name.toLowerCase() === String(sectorName || '').toLowerCase()
  );
  return match ? match.icon : '🔍';
}

export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
