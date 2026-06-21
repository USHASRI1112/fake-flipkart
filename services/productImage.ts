import type { Product } from '../types/shop';

function slugSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickPalette(seed: number) {
  const palettes = [
    ['#2874F0', '#1D4ED8'],
    ['#DB2777', '#9D174D'],
    ['#F59E0B', '#B45309'],
    ['#10B981', '#047857'],
    ['#8B5CF6', '#6D28D9'],
    ['#0EA5E9', '#0369A1'],
    ['#EF4444', '#B91C1C'],
  ];

  return palettes[seed % palettes.length];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getProductFallbackImageUri(product: Product) {
  const seed = slugSeed(`${product.title}-${product.categoryId}`);
  const [start, end] = pickPalette(seed);
  const title = escapeXml(product.title.length > 28 ? `${product.title.slice(0, 27)}…` : product.title);
  const subtitle = escapeXml(product.category);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" rx="64" fill="url(#bg)" />
      <circle cx="660" cy="140" r="96" fill="rgba(255,255,255,0.14)" />
      <circle cx="130" cy="640" r="120" fill="rgba(255,255,255,0.10)" />
      <text x="64" y="144" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="rgba(255,255,255,0.92)">FakeFlipkart</text>
      <text x="64" y="400" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800" fill="#FFFFFF">${title}</text>
      <text x="64" y="468" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.84)">${subtitle}</text>
      <rect x="64" y="548" width="188" height="56" rx="28" fill="rgba(255,255,255,0.16)" />
      <text x="118" y="586" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">Verified pick</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
