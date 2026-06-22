import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, 'store', 'data.csv');
const MOBILES_CSV_PATH = path.join(ROOT, 'store', 'mobiles.csv');
const FOOD_CSV_PATH = path.join(ROOT, 'store', 'food.csv');
const OUT_PATH = path.join(ROOT, 'store', 'catalog.generated.json');
const LIMIT = 5000;

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function extractCategoryPath(rawValue) {
  const cleaned = rawValue
    .replace(/^\["?/, '')
    .replace(/"?\]$/, '')
    .replace(/""/g, '"')
    .trim();

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split('>>')
    .map((part) => part.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
}

function shouldExcludeRow(row) {
  const categoryPath = extractCategoryPath(row.product_category_tree);
  const rootCategory = categoryPath[0] || '';
  const clothingPath = rootCategory.toLowerCase() === 'clothing';
  const brand = safeText(row.brand).toLowerCase();
  const title = safeText(row.product_name).toLowerCase();

  return (
    clothingPath &&
    (
      categoryPath.some((part) => part.toLowerCase() === 'bras') ||
      brand.includes('clovia') ||
      title.includes('clovia') ||
      categoryPath.some((part) => part.toLowerCase().includes('clovia'))
    )
  );
}

function extractFirstUrl(rawValue) {
  const match = String(rawValue || '').match(/https?:\/\/[^"\],\s]+/);
  return match ? match[0].split('?')[0] : '';
}

function parseNumber(rawValue) {
  const value = String(rawValue || '').replace(/[^0-9.]+/g, '');
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function safeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text.length ? text : fallback;
}

function scoreRow(row) {
  if (shouldExcludeRow(row)) {
    return -1;
  }

  let score = 0;
  const categoryPath = extractCategoryPath(row.product_category_tree);
  const hasImage = extractFirstUrl(row.image);
  const discounted = parseNumber(row.discounted_price);
  const rating = parseNumber(row.product_rating) ?? parseNumber(row.overall_rating);

  if (hasImage) score += 4;
  if (categoryPath.length) score += 3;
  if (discounted !== null) score += 2;
  if (rating !== null) score += 2;
  if (safeText(row.brand)) score += 1;

  return score;
}

function scoreMobileRow(row) {
  let score = 8;
  if (safeText(row.names)) score += 4;
  if (safeText(row.images_links)) score += 4;
  if (safeText(row.price_details)) score += 3;
  if (parseNumber(row.stars) !== null) score += 2;
  if (safeText(row.memory)) score += 1;
  if (safeText(row.camara_info)) score += 1;
  return score;
}

function scoreFoodRow(row) {
  let score = 7;
  if (safeText(row.name)) score += 4;
  if (safeText(row.image_url)) score += 4;
  if (parseNumber(row.price) !== null) score += 3;
  if (parseNumber(row.mrp) !== null) score += 1;
  if (safeText(row.variant)) score += 1;
  return score;
}

function pickBadge(discounted, retail, categoryId, rating) {
  const discountPercent =
    discounted !== null && retail !== null && retail > discounted
      ? ((retail - discounted) / retail) * 100
      : 0;

  if (discountPercent >= 45) {
    return 'Hot Deal';
  }

  if (rating !== null && rating >= 4.5) {
    return 'Top Rated';
  }

  if (['jewellery', 'watches', 'mobiles-accessories', 'mobiles-and-accessories', 'smartphone'].includes(categoryId)) {
    return 'Trending';
  }

  return undefined;
}

function buildTagline(row, retail, discounted, categoryId) {
  const brand = safeText(row.brand);
  const parts = [];

  if (brand) {
    parts.push(brand);
  }

  if (discounted !== null && retail !== null && retail > discounted) {
    const percent = Math.round(((retail - discounted) / retail) * 100);
    parts.push(`${percent}% off`);
  } else if (categoryId) {
    parts.push(titleCase(categoryId.replace(/-/g, ' ')));
  }

  return parts.length ? parts.join(' • ') : 'Flipkart marketplace pick';
}

function buildDescription(row) {
  const description = safeText(row.description);
  if (!description) {
    return 'A curated marketplace item imported from the Flipkart CSV dataset.';
  }

  return description.length > 180 ? `${description.slice(0, 177)}...` : description;
}

function extractMobileBrand(title) {
  const cleaned = safeText(title);
  if (!cleaned) {
    return '';
  }

  const firstToken = cleaned.split(/\s+/)[0] || '';
  if (!firstToken) {
    return '';
  }

  return firstToken.replace(/[()|]/g, '').trim();
}

function normalizeRow(row, index) {
  const categoryPath = extractCategoryPath(row.product_category_tree);
  const rootCategory = categoryPath[0] || 'Misc';
  const categoryId = slugify(rootCategory || 'misc') || 'misc';
  const title = safeText(row.product_name);

  if (categoryId === 'clothing' && categoryPath.some((part) => part.toLowerCase() === 'bras')) {
    return null;
  }

  if (categoryId === 'clothing') {
    const lowerTitle = title.toLowerCase();
    const lowerBrand = safeText(row.brand).toLowerCase();
    if (
      lowerTitle.includes('clovia') ||
      lowerBrand.includes('clovia') ||
      categoryPath.some((part) => part.toLowerCase().includes('clovia'))
    ) {
      return null;
    }
  }

  const image = extractFirstUrl(row.image);
  const retail = parseNumber(row.retail_price);
  const discounted = parseNumber(row.discounted_price);
  const rating = parseNumber(row.product_rating) ?? parseNumber(row.overall_rating) ?? null;
  const price = discounted ?? retail ?? null;

  if (!title || !price || !image) {
    return null;
  }

  const parsedPid = safeText(row.pid, `${index}`);
  const discountText = discounted !== null && retail !== null && retail > discounted
    ? `${Math.round(((retail - discounted) / retail) * 100)}% off`
    : '';

  return {
    id: parsedPid,
    title,
    category: titleCase(rootCategory),
    categoryId,
    rawCategory: categoryPath.join(' > ') || rootCategory,
    price: Math.round(price),
    rating: rating !== null ? Number(rating.toFixed(1)) : 4.2,
    image,
    tagline: buildTagline(row, retail, discounted, categoryId),
    description: buildDescription(row),
    badge: pickBadge(discounted, retail, categoryId, rating),
    brand: safeText(row.brand),
    discountLabel: discountText,
  };
}

function parsePriceDetails(rawValue) {
  const matches = String(rawValue || '').match(/₹\s*[\d,]+(?:\.\d+)?/g) || [];
  const values = matches
    .map((match) => Number.parseFloat(match.replace(/[^0-9.]+/g, '')))
    .filter((value) => Number.isFinite(value));

  return {
    discounted: values[0] ?? null,
    retail: values[1] ?? null,
  };
}

function normalizeMobileRow(row, index) {
  const title = safeText(row.names);
  const image = extractFirstUrl(row.images_links);
  const { discounted, retail } = parsePriceDetails(row.price_details);
  const rating = parseNumber(row.stars) ?? null;
  const price = discounted ?? retail ?? null;

  if (!title || !price || !image) {
    return null;
  }

  const mobileCategoryId = 'mobiles-and-accessories';
  const discountText =
    discounted !== null && retail !== null && retail > discounted
      ? `${Math.round(((retail - discounted) / retail) * 100)}% off`
      : '';

  const badge =
    (rating !== null && rating >= 4.5 && 'Top Rated') ||
    (discountText && 'Hot Deal') ||
    pickBadge(discounted, retail, mobileCategoryId, rating);

  const taglineParts = [
    safeText(row.memory),
    safeText(row.display),
    safeText(row.processor),
    discountText,
  ].filter(Boolean);

  const descriptionParts = [
    safeText(row.camara_info),
    safeText(row.battery),
    safeText(row.warranty),
  ].filter(Boolean);

  return {
    id: safeText(row.id, `${index}`),
    title,
    category: 'Mobiles & Accessories',
    categoryId: mobileCategoryId,
    rawCategory: 'Mobiles & Accessories > Smartphones',
    price: Math.round(price),
    rating: rating !== null ? Number(rating.toFixed(1)) : 4.2,
    image,
    tagline: taglineParts.join(' • ') || 'Mobiles & Accessories',
    description:
      descriptionParts.join(' • ') ||
      'Mobile listing imported from the supplemental mobiles catalog.',
    badge,
    brand: extractMobileBrand(title),
    discountLabel: discountText,
  };
}

function normalizeFoodRow(row, index) {
  const title = safeText(row.name);
  const image = extractFirstUrl(row.image_url);
  const discounted = parseNumber(row.price);
  const retail = parseNumber(row.mrp);
  const price = discounted ?? retail ?? null;
  const variant = safeText(row.variant);
  const stock = parseNumber(row.stock);

  if (!title || !price || !image) {
    return null;
  }

  const foodCategoryId = 'food-and-nutrition';
  const discountText =
    discounted !== null && retail !== null && retail > discounted
      ? `${Math.round(((retail - discounted) / retail) * 100)}% off`
      : '';
  const ratingSeed = stock !== null ? Math.min(4.9, 4.0 + Math.min(0.9, stock / 1000)) : 4.2;
  const badge =
    discountText && Number.parseInt(discountText, 10) >= 25
      ? 'Hot Deal'
      : variant.toLowerCase().includes('pack')
        ? 'Family Pack'
        : undefined;

  return {
    id: safeText(row.asin, `${index}`),
    title,
    category: 'Food & Nutrition',
    categoryId: foodCategoryId,
    rawCategory: 'Food & Nutrition > Grocery',
    price: Math.round(price),
    rating: Number(ratingSeed.toFixed(1)),
    image,
    tagline: [variant || 'Food essentials', discountText].filter(Boolean).join(' • '),
    description: [
      retail !== null ? `MRP ${Math.round(retail)}` : '',
      stock !== null ? `Stock ${Math.round(stock)}` : '',
    ]
      .filter(Boolean)
      .join(' • ') || 'Food product imported from the supplemental grocery catalog.',
    badge,
    brand: extractMobileBrand(title),
    discountLabel: discountText,
  };
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    return row;
  });
}

function main() {
  const primaryRows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const mobileRows = fs.existsSync(MOBILES_CSV_PATH) ? parseCsv(fs.readFileSync(MOBILES_CSV_PATH, 'utf8')) : [];
  const foodRows = fs.existsSync(FOOD_CSV_PATH) ? parseCsv(fs.readFileSync(FOOD_CSV_PATH, 'utf8')) : [];
  const normalized = [
    ...primaryRows.map((row, index) => ({ row, index, score: scoreRow(row), source: 'flipkart' })),
    ...mobileRows.map((row, index) => ({ row, index, score: scoreMobileRow(row), source: 'mobile' })),
    ...foodRows.map((row, index) => ({ row, index, score: scoreFoodRow(row), source: 'food' })),
  ]
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, LIMIT)
    .map(({ row, index, source }) => {
      if (source === 'mobile') {
        return normalizeMobileRow(row, index);
      }

      if (source === 'food') {
        return normalizeFoodRow(row, index);
      }

      return normalizeRow(row, index);
    })
    .filter(Boolean);

  fs.writeFileSync(OUT_PATH, JSON.stringify(normalized, null, 2));
  console.log(`Wrote ${normalized.length} catalog items to ${OUT_PATH}`);
}

main();
