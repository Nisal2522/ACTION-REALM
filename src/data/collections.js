import { slugify } from '../config/site';
import { getBrands, getCategories, getFranchises, isAvailableNow, isOnSale, isPreorder, isSoldOut } from './products';

const SPECIAL = {
  all: { title: 'All Products', filter: () => true },
  'in-stock': { title: 'In Stock', filter: isAvailableNow },
  'pre-orders': { title: 'Pre-Orders', filter: isPreorder },
  'new-arrivals': { title: 'New Arrivals', filter: (p) => p.isNew },
  'sold-out': { title: 'Sold Out', filter: isSoldOut },
  sale: { title: 'On Sale', filter: isOnSale },
};

export function getCollection(slug) {
  if (SPECIAL[slug]) return { slug, kind: 'special', ...SPECIAL[slug] };
  const category = getCategories().find((c) => slugify(c) === slug);
  if (category) return { slug, kind: 'category', title: category, filter: (p) => p.category === category };
  const franchise = getFranchises().find((f) => slugify(f) === slug);
  if (franchise) return { slug, kind: 'franchise', title: franchise, filter: (p) => p.franchise === franchise };
  const brand = getBrands().find((b) => slugify(b) === slug);
  if (brand) return { slug, kind: 'brand', title: brand, filter: (p) => p.brand === brand };
  return null;
}

// Every collection page, grouped for admin dropdowns.
export const collectionOptions = () => [
  ...Object.entries(SPECIAL).map(([slug, c]) => ({ value: slug, label: `Collection: ${c.title}` })),
  ...getBrands().map((b) => ({ value: slugify(b), label: `Brand: ${b}` })),
  ...getCategories().map((c) => ({ value: slugify(c), label: `Category: ${c}` })),
  ...getFranchises().map((f) => ({ value: slugify(f), label: `Franchise: ${f}` })),
];

export const collectionUrl = (name) => `/collections/${slugify(name)}`;
