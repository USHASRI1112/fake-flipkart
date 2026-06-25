import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const STORE_DIR = path.join(ROOT, 'store');
const CACHE_DIR = path.join(STORE_DIR, 'mobileapi-cache');
const RAW_OUT_PATH = path.join(STORE_DIR, 'mobileapi-devices.json');
const NORMALIZED_OUT_PATH = path.join(STORE_DIR, 'mobileapi-products.json');
const MANIFEST_OUT_PATH = path.join(CACHE_DIR, 'manifest.json');
const PAGE_LIMIT = Number.parseInt(process.env.MOBILE_API_LIMIT || '30', 10);
const MAX_IMPORT_PAGES = Number.parseInt(process.env.MOBILE_API_MAX_PAGES || '49', 10);
const REQUEST_GAP_MS = Number.parseInt(process.env.MOBILE_API_GAP_MS || '16000', 10);
const MAX_RETRY_ATTEMPTS = Number.parseInt(process.env.MOBILE_API_MAX_RETRIES || '6', 10);
const API_URL = 'https://api.mobileapi.dev/devices';
const API_TOKEN = process.env.MOBILE_API_TOKEN || '55da10f839a9e795533b545e86261bba57cb6c4b';
let lastRequestAt = 0;

function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text.length ? text : fallback;
}

function slugify(value) {
  return safeText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitedFetch(url, options) {
  const elapsed = Date.now() - lastRequestAt;
  if (lastRequestAt > 0 && elapsed < REQUEST_GAP_MS) {
    await sleep(REQUEST_GAP_MS - elapsed);
  }

  lastRequestAt = Date.now();
  return fetch(url, options);
}

function getRetryAfterMs(response, attempt) {
  const header = response.headers.get('retry-after');
  if (header) {
    const seconds = Number.parseFloat(header);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000);
    }

    const parsedDate = Date.parse(header);
    if (Number.isFinite(parsedDate)) {
      return Math.max(parsedDate - Date.now(), REQUEST_GAP_MS);
    }
  }

  const exponentialDelay = REQUEST_GAP_MS * Math.max(1, attempt + 1);
  return Math.max(60000, exponentialDelay);
}

async function fetchResponseWithRetry(url, options, label) {
  let attempt = 0;

  while (attempt < MAX_RETRY_ATTEMPTS) {
    const response = await rateLimitedFetch(url, options);

    if (response.status !== 429) {
      if (!response.ok) {
        throw new Error(`${label} failed with status ${response.status}`);
      }

      return response;
    }

    attempt += 1;
    const retryAfterMs = getRetryAfterMs(response, attempt);
    console.warn(
      `${label} hit 429 rate limit on attempt ${attempt}/${MAX_RETRY_ATTEMPTS}. Waiting ${Math.ceil(retryAfterMs / 1000)}s before retrying.`,
    );
    await sleep(retryAfterMs);
  }

  throw new Error(`${label} failed after ${MAX_RETRY_ATTEMPTS} retries due to rate limiting`);
}

async function fetchJsonWithRetry(url, options, label) {
  const response = await fetchResponseWithRetry(url, options, label);
  return response.json();
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
  const battery = safeText(device.battery_capacity);
  const camera = safeText(device.camera);
  const hardware = safeText(device.hardware);
  const release = safeText(device.release_date);
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

async function fetchMobilePage(page, limit) {
  const url = new URL(API_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  return fetchJsonWithRetry(
    url,
    {
      headers: {
        Authorization: `Token ${API_TOKEN}`,
        Accept: 'application/json',
      },
    },
    `Mobile API page ${page}`,
  );
}

async function fetchImageBase64(url) {
  if (!url) {
    return '';
  }

  try {
    const response = await fetchResponseWithRetry(
      url,
      {
        headers: {
          Accept: 'image/*',
        },
      },
      `Image ${url}`,
    );

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.warn(`Skipping image fetch for ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return '';
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function main() {
  await ensureDir(CACHE_DIR);

  const pages = [];
  const devices = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= MAX_IMPORT_PAGES) {
    const payload = await fetchMobilePage(page, PAGE_LIMIT);

    const withImages = [];
    for (const device of payload.devices) {
      const imageUrl = normalizeImageUrl(device.image_url);
      if (!device.image_b64 && imageUrl) {
        const imageBase64 = await fetchImageBase64(imageUrl);
        withImages.push(imageBase64 ? { ...device, image_b64: imageBase64 } : device);
        continue;
      }

      withImages.push(device);
    }

    const pagePayload = {
      ...payload,
      devices: withImages,
    };

    pages.push({
      page: payload.page,
      page_size: payload.page_size,
      total: payload.total,
      total_pages: payload.total_pages,
      has_next: payload.has_next,
      has_previous: payload.has_previous,
    });

    devices.push(...withImages);
    await writeJson(path.join(CACHE_DIR, `page-${String(page).padStart(3, '0')}.json`), pagePayload);

    console.log(
      `Fetched page ${page}/${payload.total_pages} (${payload.devices.length} devices). Next request in ${REQUEST_GAP_MS}ms if continuing.`,
    );

    hasNext = payload.has_next;
    page += 1;
  }

  const combined = {
    total: devices.length,
    page_limit: PAGE_LIMIT,
    pages_fetched: pages.length,
    is_partial: hasNext && page > MAX_IMPORT_PAGES,
    devices,
  };

  const sortedDevices = devices
    .slice()
    .sort((left, right) => getSortValue(right) - getSortValue(left));

  const normalized = sortedDevices
    .slice()
    .map((device, index) => normalizeDevice(device, index))
    .filter(Boolean);

  const sortedPages = chunkArray(sortedDevices, PAGE_LIMIT);
  const sortedPageManifest = sortedPages.map((pageDevices, index) => ({
    page: index + 1,
    page_size: pageDevices.length,
    total: sortedDevices.length,
    total_pages: sortedPages.length,
    has_next: index < sortedPages.length - 1,
    has_previous: index > 0,
  }));

  for (let index = 0; index < sortedPages.length; index += 1) {
    const pageDevices = sortedPages[index];
    const pagePayload = {
      total: sortedDevices.length,
      page: index + 1,
      page_size: pageDevices.length,
      total_pages: sortedPages.length,
      has_next: index < sortedPages.length - 1,
      has_previous: index > 0,
      devices: pageDevices,
      latest_first: true,
    };

    await writeJson(path.join(CACHE_DIR, `page-${String(index + 1).padStart(3, '0')}.json`), pagePayload);
  }

  await writeJson(MANIFEST_OUT_PATH, {
    page_limit: PAGE_LIMIT,
    pages_fetched: sortedPages.length,
    is_partial: combined.is_partial,
    latest_first: true,
    pages: sortedPageManifest,
  });
  await writeJson(RAW_OUT_PATH, {
    ...combined,
    latest_first: true,
    devices: sortedDevices,
  });
  await writeJson(NORMALIZED_OUT_PATH, normalized);

  console.log(
    `Imported ${devices.length} devices across ${pages.length} page(s) into ${RAW_OUT_PATH} and ${NORMALIZED_OUT_PATH}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
