import { useContent } from '../data/content';

const KIND_LABEL = { brand: 'Brand', category: 'Category', franchise: 'Franchise', special: 'Collection' };

const SPECIAL_TEXT = {
  all: 'Every figure, statue and collectible in the store.',
  'in-stock': 'Ready to ship today, delivered island-wide.',
  'pre-orders': 'Reserve upcoming releases before they sell out.',
  'new-arrivals': 'The latest figures to land in Sri Lanka.',
  'sold-out': 'Past releases. Ask us to tell you if they come back.',
  sale: 'Limited-time prices on selected collectibles.',
};

function defaultText({ kind, slug, title }) {
  if (kind === 'brand') return `Officially licensed ${title} collectibles, available in Sri Lanka with island-wide delivery.`;
  if (kind === 'category') return `Every ${title.toLowerCase()} we stock, from new arrivals to hard-to-find pieces.`;
  if (kind === 'franchise') return `Figures, statues and collectibles from the ${title} universe.`;
  return SPECIAL_TEXT[slug] || '';
}

// Starter banner photos (Unsplash). Replace any of them in Admin → Pages → Collection banners.
const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=75`;
const PHOTOS = {
  // Collections
  all: '1762786613960-96fc8a8d8d6b',
  'in-stock': '1754677216419-1abdbc50d7fa',
  'pre-orders': '1788270126378-f6929d58923f',
  'new-arrivals': '1787724168517-833666987ced',
  'sold-out': '1521985179118-6008b8cef2c2',
  sale: '1773517439221-fedfe02b3cc6',
  // Franchises
  marvel: '1792409279688-5309a2dcb7b1',
  dc: '1559107503-521c2b36b98d',
  anime: '1769479027867-817973e429af',
  gaming: '1566577134770-3d85bb3a9cc4',
  horror: '1748255743605-6c6ad36a80bd',
  'sci-fi': '1518331647614-7a1f04cd34cf',
  // Categories
  'action figures': '1754677216771-7fcfb5a7a10e',
  statues: '1758179761862-9c6c1978ad6b',
  '1/6 scale figures': '1748255743639-04447bb6818a',
  replicas: '1679271045050-0d437f2b9b15',
  'funko pop': '1565991336106-8bf0a1261870',
  diecast: '1696824711755-6074a43fc1d1',
  // Brands
  'hot toys': '1748255743639-04447bb6818a',
  'iron studios': '1758179761862-9c6c1978ad6b',
  'prime 1 studio': '1685382633381-5957265de35e',
  sideshow: '1679271045050-0d437f2b9b15',
  bandai: '1769479027867-817973e429af',
  banpresto: '1769479027867-817973e429af',
  funko: '1565991336106-8bf0a1261870',
  'jada toys': '1696824711630-1cc63814f387',
  hasbro: '1792409279688-5309a2dcb7b1',
  'mcfarlane toys': '1709825039088-64019a4b4bf1',
  neca: '1761848022102-925fff754db0',
  mezco: '1774060526589-ef13301f6e17',
  'hiya toys': '1781887609171-c374c636de2e',
  threezero: '1624371960524-ade99abadb34',
};
// Brands added later still get a fitting photo, picked by name so it never changes.
const POOL = ['1754677216828-17789faecc09', '1635267249830-f20f0f7f92fb', '1781887609171-c374c636de2e', '1709825039088-64019a4b4bf1', '1758179761862-9c6c1978ad6b'];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function starterPhoto({ kind, slug, title }) {
  const id = PHOTOS[slug] || PHOTOS[title.toLowerCase()];
  if (id) return photo(id);
  return kind === 'special' ? photo(PHOTOS.all) : photo(POOL[hash(title) % POOL.length]);
}

export default function CollectionBanner({ collection }) {
  const banner = useContent('collectionBanners').find((b) => b.collection === collection.slug);
  const strip = useContent('brandStrip');
  const brandLogo = collection.kind === 'brand' ? strip.find((b) => b.name.toLowerCase() === collection.title.toLowerCase())?.logo : null;
  const image = banner?.image || starterPhoto(collection);
  const text = banner?.text?.trim() || defaultText(collection);

  return (
    <header className={`cbanner cbanner-${collection.kind || 'special'} ${collection.slug === 'sale' ? 'is-sale' : ''}`}>
      <img key={image} className="cbanner-photo" src={image} alt="" fetchpriority="high" />
      <span className="cbanner-mark" aria-hidden="true">{collection.title}</span>
      <div className="cbanner-body">
        <span className="cbanner-eyebrow"><i aria-hidden="true" />{KIND_LABEL[collection.kind] || 'Collection'}</span>
        <div className="cbanner-title">
          {brandLogo && <span className="cbanner-logo"><img src={brandLogo} alt="" /></span>}
          <h1>{collection.title}</h1>
        </div>
        <span className="cbanner-rule" aria-hidden="true" />
        {text && <p>{text}</p>}
      </div>
    </header>
  );
}
