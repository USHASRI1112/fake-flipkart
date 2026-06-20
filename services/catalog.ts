import type { Category, Product } from '../types/shop';

export type CatalogProduct = Product;

type DummyJsonProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  thumbnail: string;
  images: string[];
  discountPercentage: number;
  stock: number;
  availabilityStatus: string;
  brand?: string;
};

type DummyJsonProductsResponse = {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
};

const DUMMYJSON_BASE = 'https://dummyjson.com';

type CategoryGroupId =
  | 'food'
  | 'mobiles'
  | 'fashion'
  | 'cars'
  | 'bikes'
  | 'jewelry'
  | 'luxury'
  | 'electronics';

type CategoryGroup = {
  id: CategoryGroupId;
  name: string;
  icon: string;
  tint: string;
  rawCategories: readonly string[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'food', name: 'Food', icon: 'restaurant', tint: '#F97316', rawCategories: ['groceries'] },
  {
    id: 'mobiles',
    name: 'Mobiles',
    icon: 'smartphone',
    tint: '#2874F0',
    rawCategories: ['smartphones', 'mobile-accessories', 'tablets'],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: 'checkroom',
    tint: '#DB2777',
    rawCategories: [
      'womens-dresses',
      'womens-shoes',
      'womens-bags',
      'womens-jewellery',
      'mens-shirts',
      'mens-shoes',
      'mens-watches',
      'tops',
      'sunglasses',
    ],
  },
  { id: 'cars', name: 'Cars', icon: 'directions-car', tint: '#111827', rawCategories: ['vehicle'] },
  { id: 'bikes', name: 'Bikes', icon: 'two-wheeler', tint: '#059669', rawCategories: ['motorcycle'] },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: 'diamond',
    tint: '#B45309',
    rawCategories: ['womens-jewellery', 'mens-watches', 'womens-watches'],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    icon: 'card-giftcard',
    tint: '#7C3AED',
    rawCategories: [],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'devices',
    tint: '#0F766E',
    rawCategories: ['laptops', 'mobile-accessories', 'smartphones', 'tablets'],
  },
];

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isLuxuryProduct(rawProduct: DummyJsonProduct) {
  return rawProduct.price >= 1000 || rawProduct.discountPercentage >= 25 || rawProduct.rating >= 4.8;
}

function inferCategoryGroup(rawCategory: string, rawProduct?: DummyJsonProduct): CategoryGroupId {
  const matched = CATEGORY_GROUPS.find(
    (group) => group.rawCategories.length > 0 && group.rawCategories.includes(rawCategory),
  );

  if (matched) {
    return matched.id;
  }

  if (rawProduct && isLuxuryProduct(rawProduct)) {
    return 'luxury';
  }

  return 'electronics';
}

function buildTagline(rawProduct: DummyJsonProduct) {
  const brand = rawProduct.brand ? `${rawProduct.brand} • ` : '';
  const discount = rawProduct.discountPercentage > 0 ? `${Math.round(rawProduct.discountPercentage)}% off` : '';
  return `${brand}${discount || rawProduct.availabilityStatus}`.trim();
}

function mapRawProduct(rawProduct: DummyJsonProduct): Product {
  const categoryId = inferCategoryGroup(rawProduct.category, rawProduct);
  const category = CATEGORY_GROUPS.find((group) => group.id === categoryId)?.name ?? titleCase(rawProduct.category);

  return {
    id: String(rawProduct.id),
    title: rawProduct.title,
    category,
    categoryId,
    rawCategory: rawProduct.category,
    price: Math.round(rawProduct.price),
    rating: rawProduct.rating,
    image: rawProduct.thumbnail || rawProduct.images[0] || '',
    tagline: buildTagline(rawProduct),
    description: rawProduct.description,
    badge:
      rawProduct.discountPercentage >= 20
        ? 'Hot Deal'
        : isLuxuryProduct(rawProduct)
          ? 'Luxury'
          : undefined,
  };
}

export async function fetchCatalogProducts() {
  const response = await fetch(`${DUMMYJSON_BASE}/products?limit=0`);
  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status})`);
  }

  const json = (await response.json()) as DummyJsonProductsResponse;
  return json.products.map(mapRawProduct);
}

export function getCatalogCategories(products: Product[]) {
  const availableGroupIds = new Set(products.map((product) => product.categoryId));

  return CATEGORY_GROUPS.filter((group) =>
    group.id === 'luxury' ? true : availableGroupIds.has(group.id),
  ).map(({ id, name, icon, tint }) => ({ id, name, icon, tint })) as Category[];
}

export function getProductById(products: Product[], id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsForCategory(products: Product[], categoryId: string) {
  if (categoryId === 'luxury') {
    return products.filter((product) => product.categoryId === 'luxury');
  }

  return products.filter((product) => product.categoryId === categoryId);
}

export function getLuxuryProducts(products: Product[]) {
  return products.filter((product) => product.categoryId === 'luxury');
}

export function getTrendingProducts(products: Product[]) {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
}

export function getCategoryTitle(categoryId: string) {
  return CATEGORY_GROUPS.find((group) => group.id === categoryId)?.name ?? titleCase(categoryId);
}
