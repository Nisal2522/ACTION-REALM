import { SITE, slugify } from '../config/site';
import { db, registerSeed, useCollection } from '../services/db';

// Category and franchise lists are edited in Admin → Settings → Catalogue.
export const getCategories = () => SITE.categories;
export const getFranchises = () => SITE.franchises;

// Colours used to render placeholder artwork for products without a photo.
export const PALETTE = {
  Marvel: ['#ef4444', '#2a0606'],
  DC: ['#3b82f6', '#06102b'],
  Anime: ['#f97316', '#2b1200'],
  Gaming: ['#22c55e', '#04200d'],
  Horror: ['#a855f7', '#14072a'],
  'Sci-Fi': ['#06b6d4', '#021f26'],
};

// Free stock photos from Unsplash (unsplash.com/license).
export const unsplash = (photoId, w = 800) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&q=75`;

const PHOTOS = {
  1: '1592435468595-ab8dd76cd754',
  2: '1561994495-7be2d2a3fa14',
  3: '1557985594-29f3ad9f5134',
  4: '1714537076751-f3955b5578a7',
  5: '1752588807777-87763c8b6fcb',
  6: '1624371960524-ade99abadb34',
  7: '1521985179118-6008b8cef2c2',
  8: '1628864021318-17265a845a52',
  9: '1776426275153-55cd6f8dc995',
  10: '1606663889134-b1dedb5ed8b7',
  11: '1601513445506-2ab0d4fb4229',
  12: '1776426284678-5f0ac0dd2112',
  13: '1705932461994-6fb2b07f27dd',
  14: '1621478374422-35206faeddfb',
  15: '1558679908-541bcf1249ff',
  16: '1638379036667-ee3e8d663f2d',
  17: '1696824711583-651876031b30',
  18: '1608278047522-58806a6ac85b',
  19: '1694747993145-60b3267cf55e',
  20: '1741512612523-d6b9b7cdd18b',
  21: '1561994508-07f91d13a9ff',
  22: '1674448417387-345997fcd888',
  23: '1635875560469-2b94b774c187',
  24: '1773754070201-4977cce86dfd',
  25: '1623039902375-29258147f39e',
  26: '1632109243117-2432e8485c63',
  27: '1765633358993-c8a68fd47d6f',
  28: '1776426400619-414d635cb703',
  29: '1635267249830-f20f0f7f92fb',
  30: '1696824711591-018c23ff9248',
};

export const describe = (name, brand, franchise) =>
  `${name} from ${brand}. A highly detailed, officially licensed collectible from the ${franchise} universe, sculpted and painted for display, packed with care and delivered insured island-wide.`;

const p = (id, name, brand, category, franchise, price, opts = {}) => ({
  id,
  slug: slugify(name),
  name,
  brand,
  category,
  franchise,
  price,
  compareAt: null,
  status: 'instock',
  isNew: false,
  featured: false,
  eta: null,
  releaseDate: null,
  stock: 5,
  image: PHOTOS[id] ? unsplash(PHOTOS[id]) : '',
  description: describe(name, brand, franchise),
  ...opts,
});

// Sample catalogue (prices in LKR). Edit products from the Admin panel at /admin.
const SEED_PRODUCTS = () => [
  p(1, 'Iron Man Mark LXXXV 1/6 Scale Figure', 'Hot Toys', '1/6 Scale Figures', 'Marvel', 121999, { featured: true, stock: 2 }),
  p(2, 'Batman Arkham Knight Art Scale Statue', 'Iron Studios', 'Statues', 'DC', 100999, { featured: true }),
  p(3, 'Spider-Man Advanced Suit Action Figure', 'Hasbro', 'Action Figures', 'Marvel', 10499, { compareAt: 11999 }),
  p(4, 'Naruto Uzumaki Sage Mode Figure', 'Bandai', 'Action Figures', 'Anime', 17499, { isNew: true, featured: true }),
  p(5, 'Tanjiro Kamado Pop! Vinyl', 'Funko', 'Funko Pop', 'Anime', 4499),
  p(6, 'T-800 Endoskeleton Ultimate Figure', 'NECA', 'Action Figures', 'Sci-Fi', 15499, { isNew: true }),
  p(7, 'Darth Vader 1/6 Scale Figure', 'Hot Toys', '1/6 Scale Figures', 'Sci-Fi', 114999, { status: 'preorder', eta: 'Q2 2027', releaseDate: '2027-05-15' }),
  p(8, 'The Joker Deluxe Art Scale Statue', 'Iron Studios', 'Statues', 'DC', 86999, { status: 'preorder', eta: 'Q1 2027', releaseDate: '2027-02-15' }),
  p(9, 'Spawn Deluxe Action Figure', 'McFarlane Toys', 'Action Figures', 'Horror', 8499),
  p(10, 'Kratos Ultimate Action Figure', 'NECA', 'Action Figures', 'Gaming', 13999, { featured: true }),
  p(11, 'Pennywise Ultimate Figure', 'NECA', 'Action Figures', 'Horror', 13499, { compareAt: 14999 }),
  p(12, 'Michael Myers Ultimate Figure', 'NECA', 'Action Figures', 'Horror', 11999, { stock: 0 }),
  p(13, 'Goku Ultra Instinct Figure', 'Bandai', 'Action Figures', 'Anime', 18999, { status: 'preorder', eta: 'Dec 2026', releaseDate: '2026-12-15' }),
  p(14, 'Luffy Gear 5 Statue', 'Banpresto', 'Statues', 'Anime', 10499, { isNew: true }),
  p(15, 'Superman Museum Masterline Statue', 'Prime 1 Studio', 'Statues', 'DC', 314999, { status: 'preorder', eta: 'Q3 2027', releaseDate: '2027-08-15' }),
  p(16, 'Thor Love and Thunder 1/6 Scale Figure', 'Hot Toys', '1/6 Scale Figures', 'Marvel', 111999, { compareAt: 125999 }),
  p(17, 'Batmobile 1:24 Diecast Vehicle', 'Jada Toys', 'Diecast', 'DC', 11499),
  p(18, 'Optimus Prime DLX Figure', 'threezero', 'Action Figures', 'Sci-Fi', 76999, { isNew: true, featured: true }),
  p(19, 'Mjolnir Electronic Replica', 'Hasbro', 'Replicas', 'Marvel', 44999),
  p(20, 'Infinity Gauntlet Electronic Replica', 'Hasbro', 'Replicas', 'Marvel', 34999, { compareAt: 41999 }),
  p(21, 'Batman Classic Pop! Vinyl', 'Funko', 'Funko Pop', 'DC', 3999, { stock: 0 }),
  p(22, 'Deadpool Pop! Vinyl', 'Funko', 'Funko Pop', 'Marvel', 3999, { isNew: true }),
  p(23, 'Geralt of Rivia Action Figure', 'McFarlane Toys', 'Action Figures', 'Gaming', 9999),
  p(24, 'Venom Art Scale Statue', 'Iron Studios', 'Statues', 'Marvel', 69999, { featured: true }),
  p(25, 'The Mandalorian 1/6 Scale Figure', 'Hot Toys', '1/6 Scale Figures', 'Sci-Fi', 118999, { stock: 1 }),
  p(26, 'Ghostface Pop! Vinyl', 'Funko', 'Funko Pop', 'Horror', 3999, { compareAt: 4499 }),
  p(27, 'Gojo Satoru Figure', 'Bandai', 'Action Figures', 'Anime', 18499, { isNew: true }),
  p(28, 'Doom Slayer 1/12 Figure', 'Hiya Toys', 'Action Figures', 'Gaming', 13999, { status: 'preorder', eta: 'Jan 2027', releaseDate: '2027-01-20' }),
  p(29, 'Lightsaber Force FX Replica', 'Hasbro', 'Replicas', 'Sci-Fi', 65999, { status: 'preorder', eta: 'Nov 2026', releaseDate: '2026-11-20' }),
  p(30, 'Ecto-1 1:24 Diecast Vehicle', 'Jada Toys', 'Diecast', 'Sci-Fi', 10499, { compareAt: 11999 }),
];
registerSeed('products', SEED_PRODUCTS);

// Live catalogue — always read through these so admin edits show up everywhere.
export const getProducts = () => db.all('products');
export const useProducts = () => useCollection('products');
export const getProduct = (id) => getProducts().find((x) => x.id === id);
export const getProductBySlug = (slug) => getProducts().find((x) => x.slug === slug);
export const getBrands = (list = getProducts()) => [...new Set(list.map((x) => x.brand))].sort();

export const isOnSale = (x) => Boolean(x.compareAt && x.compareAt > x.price);

const DEMO_GALLERY_SIZE = 12;
const POOL = Object.values(PHOTOS);
export function productPhotos(product) {
  if (product.images?.length) return product.images;
  if (!product.image) return [];
  if (!product.image.includes('images.unsplash.com')) return [product.image]; // admin-uploaded single photo
  const start = (Number(product.id) || 0) % POOL.length;
  const extra = [];
  for (let i = 1; extra.length < DEMO_GALLERY_SIZE - 1 && i < POOL.length; i += 1) {
    const src = unsplash(POOL[(start + i * 7) % POOL.length]);
    if (src !== product.image && !extra.includes(src)) extra.push(src);
  }
  return [product.image, ...extra];
}
export const isSoldOut = (x) => x.status === 'instock' && x.stock <= 0;
export const isAvailableNow = (x) => x.status === 'instock' && x.stock > 0;
export const isPreorder = (x) => x.status === 'preorder';
export const productColors = (x) => PALETTE[x.franchise] || ['#64748b', '#0f172a'];

// Create or update a product (used by the admin panel).
export function saveProduct(data) {
  const list = getProducts();
  let slug = slugify(data.name);
  if (list.some((x) => x.slug === slug && x.id !== data.id)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const doc = { ...data, slug };
  if (data.id) return db.update('products', data.id, doc);
  const id = Math.max(0, ...list.map((x) => Number(x.id) || 0)) + 1;
  return db.insert('products', { ...p(id, data.name, data.brand, data.category, data.franchise, data.price), image: '', ...doc, id });
}
