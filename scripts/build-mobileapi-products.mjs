import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, 'store', 'mobileapi-cache');
const OUT_PATH = path.join(ROOT, 'store', 'mobileapi-products.json');
const PAGE_LIMIT = 30;

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text.length ? text : fallback;
}

function parseRamGb(rawValue) {
  const match = String(rawValue || '').match(/(\d+(?:\.\d+)?)\s*GB\s*RAM/i);
  return match ? Number.parseFloat(match[1]) : null;
}

function parseStorageGb(rawValue) {
  const match = String(rawValue || '').match(/(\d+(?:\.\d+)?)\s*(TB|GB|MB)/i);
  if (!match) {
    return null;
  }

  const amount = Number.parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  if (!Number.isFinite(amount)) {
    return null;
  }

  if (unit === 'TB') {
    return amount * 1024;
  }

  if (unit === 'MB') {
    return amount / 1024;
  }

  return amount;
}

function titleCase(value) {
  return safeText(value)
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeImageUrl(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) {
    return '';
  }

  const matchedUrl = value.match(/https?:\/\/[^"\],\s]+/);
  if (matchedUrl) {
    return matchedUrl[0].split('?')[0];
  }

  return value.split('?')[0];
}

function getDeviceTitle(device) {
  const manufacturer = safeText(device.manufacturer_name || device.manufacturer?.name);
  const name = safeText(device.name);

  if (!manufacturer) {
    return name;
  }

  return name.toLowerCase().startsWith(manufacturer.toLowerCase())
    ? name
    : `${manufacturer} ${name}`.trim();
}

function getSortValue(device) {
  const releaseDate = Date.parse(safeText(device.release_date));
  if (Number.isFinite(releaseDate)) {
    return releaseDate;
  }

  const numericId = Number.parseInt(String(device.id).replace(/\D+/g, ''), 10);
  if (Number.isFinite(numericId)) {
    return numericId;
  }

  return 0;
}

function buildPrice(device) {
  const storageGb = parseStorageGb(device.storage);
  const ramGb = parseRamGb(device.hardware);
  const nameSeed = safeText(device.name).length % 7;

  return Math.max(
    3999,
    Math.round((storageGb ?? 16) * 180 + (ramGb ?? 2) * 1200 + nameSeed * 250),
  );
}

function buildRating(device) {
  const storageGb = parseStorageGb(device.storage) ?? 16;
  const ramGb = parseRamGb(device.hardware) ?? 2;
  const score = 3.6 + Math.min(1.2, (storageGb / 256) * 0.5 + (ramGb / 16) * 0.4);
  return Number(score.toFixed(1));
}

function pickBadge(device, rating, price) {
  const battery = safeText(device.battery_capacity);

  if (rating >= 4.6) {
    return 'Top Rated';
  }

  if (price >= 50000) {
    return 'Premium';
  }

  if (battery.includes('5000') || battery.includes('6000')) {
    return 'Trending';
  }

  return undefined;
}

function normalizeDevice(device, index) {
  if (String(device.device_type || 'phone').toLowerCase() !== 'phone') {
    return null;
  }

  const title = getDeviceTitle(device);
  const imageUrl = normalizeImageUrl(device.image_url);
  const imageBase64 = safeText(device.image_b64);

  if (!title || (!imageUrl && !imageBase64)) {
    return null;
  }

  const manufacturer = safeText(device.manufacturer_name || device.manufacturer?.name);
  const storage = safeText(device.storage);
  const screen = safeText(device.screen_resolution);
  const release = safeText(device.release_date);
  const camera = safeText(device.camera);
  const battery = safeText(device.battery_capacity);
  const hardware = safeText(device.hardware);
  const price = buildPrice(device);
  const rating = buildRating(device);
  const badge = pickBadge(device, rating, price);

  return {
    id: `mobile-${safeText(device.id, `${index}`)}`,
    title,
    category: 'Mobiles & Accessories',
    categoryId: 'mobiles-and-accessories',
    rawCategory: 'Mobiles & Accessories > Smartphones',
    price,
    rating,
    image: imageUrl || `data:image/jpeg;base64,${imageBase64}`,
    imageUrl,
    imageBase64,
    tagline: [storage, screen, release].filter(Boolean).join(' • ') || 'Mobiles & Accessories',
    description: [camera, battery, hardware].filter(Boolean).join(' • ') || 'Mobile device imported from the API.',
    badge,
    brand: manufacturer || titleCase(title.split(' ')[0] || 'Mobile'),
  };
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const entries = await fs.readdir(CACHE_DIR, { withFileTypes: true });
  const pageFiles = entries
    .filter((entry) => entry.isFile() && /^page-\d{3}\.json$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  if (pageFiles.length === 0) {
    throw new Error(`No mobile cache pages found in ${CACHE_DIR}`);
  }

  const devices = [];
  for (const fileName of pageFiles) {
    const payload = await readJson(path.join(CACHE_DIR, fileName));
    if (Array.isArray(payload?.devices)) {
      devices.push(...payload.devices);
    }
  }

  const sortedDevices = devices
    .slice()
    .sort((left, right) => getSortValue(right) - getSortValue(left));

  const normalized = sortedDevices
    .map((device, index) => normalizeDevice(device, index))
    .filter(Boolean);

  const pages = chunkArray(sortedDevices, PAGE_LIMIT).map((pageDevices, index) => ({
    page: index + 1,
    page_size: pageDevices.length,
    total: sortedDevices.length,
    total_pages: Math.ceil(sortedDevices.length / PAGE_LIMIT),
    has_next: index < Math.ceil(sortedDevices.length / PAGE_LIMIT) - 1,
    has_previous: index > 0,
    devices: pageDevices,
    latest_first: true,
  }));

  await fs.writeFile(OUT_PATH, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  console.log(
    `Built ${normalized.length} mobile products from ${pageFiles.length} cached page file(s) into ${OUT_PATH}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
