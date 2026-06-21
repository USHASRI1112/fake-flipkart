import catalogData from '../store/catalog.generated.json';
import type { Category, Product } from '../types/shop';

export type CatalogProduct = Product;

const CATALOG_PRODUCTS = catalogData as CatalogProduct[];

const FEATURED_CATEGORY_IDS = ['mobiles-and-accessories', 'food-and-nutrition'];

type CategoryMeta = {
  name: string;
  icon: string;
  tint: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  clothing: { name: 'Clothing', icon: 'checkroom', tint: '#DB2777' },
  jewellery: { name: 'Jewellery', icon: 'diamond', tint: '#B45309' },
  footwear: { name: 'Footwear', icon: 'two-wheeler', tint: '#059669' },
  'mobiles-and-accessories': { name: 'Mobiles & Accessories', icon: 'smartphone', tint: '#2874F0' },
  'mobiles-accessories': { name: 'Mobiles & Accessories', icon: 'smartphone', tint: '#2874F0' },
  automotive: { name: 'Automotive', icon: 'directions-car', tint: '#111827' },
  'home-decor-festive-needs': { name: 'Home Decor', icon: 'home', tint: '#7C3AED' },
  'beauty-and-personal-care': { name: 'Beauty', icon: 'spa', tint: '#F97316' },
  'home-furnishing': { name: 'Home Furnishing', icon: 'weekend', tint: '#0F766E' },
  'kitchen-dining': { name: 'Kitchen & Dining', icon: 'restaurant', tint: '#F59E0B' },
  'food-and-nutrition': { name: 'Food & Nutrition', icon: 'fastfood', tint: '#EA580C' },
  computers: { name: 'Computers', icon: 'devices', tint: '#0EA5E9' },
  watches: { name: 'Watches', icon: 'watch', tint: '#7C3AED' },
  'baby-care': { name: 'Baby Care', icon: 'child-care', tint: '#EC4899' },
  'tools-hardware': { name: 'Tools & Hardware', icon: 'handyman', tint: '#6B7280' },
  'toys-school-supplies': { name: 'Toys & School Supplies', icon: 'toys', tint: '#2563EB' },
  'health-personal-care': { name: 'Health', icon: 'health-and-safety', tint: '#16A34A' },
  'bags-wallets-belts': { name: 'Bags', icon: 'workspaces', tint: '#8B5CF6' },
  sports: { name: 'Sports', icon: 'sports-soccer', tint: '#F97316' },
  stationery: { name: 'Stationery', icon: 'edit', tint: '#14B8A6' },
  furniture: { name: 'Furniture', icon: 'weekend', tint: '#A16207' },
  misc: { name: 'More', icon: 'apps', tint: '#4B5563' },
};

function titleCase(value: string) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseBreadcrumbs(rawCategory: string) {
  return rawCategory
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean);
}

function shouldExcludeProduct(product: Product) {
  const breadcrumbs = parseBreadcrumbs(product.rawCategory);
  const lowerTitle = product.title.toLowerCase();
  const lowerBrand = (product.brand || '').toLowerCase();
  return (
    product.categoryId === 'clothing' &&
    (
      breadcrumbs.some((part) => part.toLowerCase() === 'bras') ||
      lowerTitle.includes('clovia') ||
      lowerBrand.includes('clovia') ||
      breadcrumbs.some((part) => part.toLowerCase().includes('clovia')) ||
      product.rawCategory.toLowerCase().includes('clovia')
    )
  );
}

function iconForCategory(categoryId: string) {
  return CATEGORY_META[categoryId]?.icon ?? 'apps';
}

function tintForCategory(categoryId: string) {
  return CATEGORY_META[categoryId]?.tint ?? '#4B5563';
}

function nameForCategory(categoryId: string) {
  return CATEGORY_META[categoryId]?.name ?? titleCase(categoryId);
}

function isFeaturedProduct(product: CatalogProduct) {
  return product.badge === 'Hot Deal' || product.badge === 'Top Rated' || product.rating >= 4.7;
}

function scoreProduct(product: CatalogProduct) {
  let score = 0;
  if (product.image) score += 4;
  if (product.rating >= 4) score += 3;
  if (product.badge) score += 2;
  if (product.price > 5000) score += 1;
  return score;
}

export async function fetchCatalogProducts() {
  return CATALOG_PRODUCTS;
}

export function getCatalogCategories(products: Product[]) {
  const counts = new Map<string, number>();

  for (const product of products) {
    if (shouldExcludeProduct(product)) {
      continue;
    }

    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
  }

  const prioritizedIds = FEATURED_CATEGORY_IDS.filter((id) => counts.has(id));
  const remainingIds = [...counts.entries()]
    .filter(([id]) => !prioritizedIds.includes(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return [...prioritizedIds, ...remainingIds]
    .slice(0, 8)
    .map((id) => ({
      id,
      name: nameForCategory(id),
      icon: iconForCategory(id),
      tint: tintForCategory(id),
    })) as Category[];
}

export function getProductById(products: Product[], id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsForCategory(products: Product[], categoryId: string) {
  return products.filter((product) => product.categoryId === categoryId && !shouldExcludeProduct(product));
}

export function getProductSubcategory(product: Product) {
  const breadcrumbs = parseBreadcrumbs(product.rawCategory);
  const candidate = breadcrumbs[1] || breadcrumbs[breadcrumbs.length - 2] || breadcrumbs[0] || 'All';
  return {
    id: slugify(candidate || 'all'),
    name: candidate || 'All',
  };
}

export function getCategorySubcategories(products: Product[], categoryId: string) {
  const counts = new Map<string, { id: string; name: string; count: number }>();

  for (const product of products) {
    if (product.categoryId !== categoryId) {
      continue;
    }

    if (shouldExcludeProduct(product)) {
      continue;
    }

    const subcategory = getProductSubcategory(product);
    const existing = counts.get(subcategory.id);

    if (existing) {
      existing.count += 1;
    } else {
      counts.set(subcategory.id, { ...subcategory, count: 1 });
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 12);
}

export function filterCategoryProducts(
  products: Product[],
  categoryId: string,
  options?: {
    subcategoryId?: string;
    query?: string;
  },
) {
  const normalizedQuery = options?.query?.trim().toLowerCase() ?? '';

  return products.filter((product) => {
    if (product.categoryId !== categoryId) {
      return false;
    }

    if (shouldExcludeProduct(product)) {
      return false;
    }

    if (options?.subcategoryId && options.subcategoryId !== 'all') {
      const subcategory = getProductSubcategory(product);
      if (subcategory.id !== options.subcategoryId) {
        return false;
      }
    }

    if (normalizedQuery) {
      const haystack = [
        product.title,
        product.category,
        product.rawCategory,
        product.tagline,
        product.description,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}

export function getLuxuryProducts(products: Product[]) {
  return [...products].filter(isFeaturedProduct).sort((a, b) => scoreProduct(b) - scoreProduct(a)).slice(0, 12);
}

export function getTrendingProducts(products: Product[]) {
  return [...products].sort((a, b) => scoreProduct(b) - scoreProduct(a)).slice(0, 4);
}

export function getCategoryTitle(categoryId: string) {
  return nameForCategory(categoryId);
}
