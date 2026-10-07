import { slugify } from '../config/site';
import { CATEGORIES, FRANCHISES, getBrands, isAvailableNow, isOnSale, isPreorder } from './products';

const SPECIAL = {
  all: { title: 'All Products', filter: () => true },
  'in-stock': { title: 'In Stock Now', filter: isAvailableNow },
  'pre-orders': { title: 'Pre-Orders', filter: isPreorder },
  'new-arrivals': { title: 'New Arrivals', filter: (p) => p.isNew },
  sale: { title: 'On Sale', filter: isOnSale },
};

export function getCollection(slug) {
  if (SPECIAL[slug]) return { slug, ...SPECIAL[slug] };
  const category = CATEGORIES.find((c) => slugify(c) === slug);
  if (category) return { slug, title: category, filter: (p) => p.category === category };
  const franchise = FRANCHISES.find((f) => slugify(f) === slug);
  if (franchise) return { slug, title: franchise, filter: (p) => p.franchise === franchise };
  const brand = getBrands().find((b) => slugify(b) === slug);
  if (brand) return { slug, title: brand, filter: (p) => p.brand === brand };
  return null;
}

export const collectionUrl = (name) => `/collections/${slugify(name)}`;
