// Store settings. These are only the DEFAULTS — once the site has loaded, the live values come
// from Admin → Settings (stored by the backend) and are copied into SITE by applySettings().
export const DEFAULT_SETTINGS = {
  name: 'ACTION REALM',
  tagline: 'Collectibles',
  slogan: 'The World of Legends', // shown under the logo
  logo: '/logo-256.png',
  accentColor: '#b90a1c',
  url: 'https://actionrealm.lk', // your live domain, used for share links
  description: "Sri Lanka's home for premium action figures, statues and pop-culture collectibles. Island-wide delivery.",
  email: 'support@actionrealm.lk',
  phone: '+94 77 123 4567',
  whatsapp: '94771234567', // country code + number, digits only
  socials: { instagram: '#', youtube: '#', facebook: '#' },

  stores: [
    { city: 'Colombo', address: 'Add your store address here', hours: '10 AM – 8 PM', map: 'https://maps.google.com/?q=Colombo' },
    { city: 'Kandy', address: 'Add your store address here', hours: '10 AM – 7 PM', map: 'https://maps.google.com/?q=Kandy' },
  ],
  bank: { name: 'Commercial Bank', branch: 'Colombo 03', accountName: 'Action Realm (Pvt) Ltd', accountNumber: '0000000000' },

  deliveryFee: 0, // Rs. per order; 0 = free delivery
  freeDeliveryOver: 0, // free delivery when the order is at least this much (0 = off)
  deliveryDays: { colombo: '1–2', other: '2–4' },
  payments: { card: true, bank: true, cod: true },
  installmentThreshold: 25000, // 0% installment plans on orders above this (Rs.)

  coinsName: 'Realm Coins',
  coinsRate: 0.01, // 1 coin per Rs. 100 spent
  coinValue: 1, // each coin is worth Rs. 1 at checkout
  depositRate: 0.3, // pre-orders: pay 30% now, rest on arrival
  saleEndsAt: '2026-10-31T23:59', // countdown on sale items; empty = hidden

  categories: ['Action Figures', 'Statues', '1/6 Scale Figures', 'Replicas', 'Funko Pop', 'Diecast'],
  franchises: ['Marvel', 'DC', 'Anime', 'Gaming', 'Horror', 'Sci-Fi'],
  trendingFranchise: 'Marvel',
  homeTabCount: 14,

  // Homepage sections, in display order.
  homeSections: [
    { id: 'hero', enabled: true },
    { id: 'brands', enabled: true },
    { id: 'perks', enabled: true },
    { id: 'tabs', enabled: true },
    { id: 'characters', enabled: true },
    { id: 'categories', enabled: true },
    { id: 'picks', enabled: true },
    { id: 'trending', enabled: true },
    { id: 'recent', enabled: true },
    { id: 'testimonials', enabled: true },
    { id: 'faq', enabled: true },
  ],

  popup: {
    enabled: true,
    delaySeconds: 12,
    title: 'Get 10% Off Your First Order',
    text: 'Join for new drops, pre-order alerts and members-only deals.',
    code: 'WELCOME10',
  },

  // ── Theme (Admin → Theme) ──
  defaultMode: 'dark', // colour mode for first-time visitors
  radius: 12, // corner rounding in px

  // ── Navigation (Admin → Navigation) ──
  // type 'link' opens a page; type 'franchises' shows the franchise dropdown.
  headerMenu: [
    { id: 'm1', label: 'Home', url: '/', type: 'link', enabled: true },
    { id: 'm2', label: 'About Us', url: '/about', type: 'link', enabled: true },
    {
      id: 'm3', label: 'Stocks', url: '/collections/all', type: 'dropdown', enabled: true,
      children: [
        { label: 'In Stock', url: '/collections/in-stock' },
        { label: 'Pre-Order', url: '/collections/pre-orders' },
        { label: 'Sold Out', url: '/collections/sold-out' },
        { label: 'New Arrivals', url: '/collections/new-arrivals' },
      ],
    },
    { id: 'm4', label: 'Franchises', url: '', type: 'franchises', enabled: true },
    { id: 'm5', label: 'Sale', url: '/collections/sale', type: 'link', enabled: true },
    { id: 'm6', label: 'Contact Us', url: '/contact', type: 'link', enabled: true },
  ],
  footer: {
    columns: [
      {
        id: 'f1',
        title: 'Shop',
        links: [
          { label: 'All Products', url: '/collections/all' },
          { label: 'In Stock', url: '/collections/in-stock' },
          { label: 'Pre-Orders', url: '/collections/pre-orders' },
          { label: 'New Arrivals', url: '/collections/new-arrivals' },
          { label: 'Sale', url: '/collections/sale' },
        ],
      },
      {
        id: 'f2',
        title: 'Help',
        links: [
          { label: 'Track Order', url: '/track-order' },
          { label: 'Contact Us', url: '/contact' },
          { label: 'Terms and Conditions', url: '/pages/terms' },
          { label: 'Realm Coins', url: '/rewards' },
          { label: 'My Account', url: '/account' },
        ],
      },
    ],
    showStores: true,
    showNewsletter: true,
    newsletterTitle: 'Newsletter',
    newsletterText: 'Get new drops, pre-order alerts and exclusive offers.',
    showPaymentBadges: true,
    bottomText: 'All trademarks belong to their respective owners.',
  },

  // ── Page content (Admin → Pages) ──
  homeTitles: {
    characters: 'Shop By Franchise',
    categories: 'Shop By Character',
    picks: "Collector's Picks",
    trending: 'Trending',
    recent: 'Recently Viewed',
    testimonials: 'What Collectors Say',
    faq: 'Frequently Asked Questions',
  },
  about: {
    heroLabel: 'About Action Realm',
    heroTitle: 'Built by collectors,\nfor collectors.',
    heroText: "Sri Lanka's home for premium action figures, statues and pop-culture collectibles. Island-wide delivery.",
    heroImage: 'https://images.unsplash.com/photo-1604882846805-a6813013c2b5?auto=format&fit=crop&w=1920&q=75',
    storyLabel: 'Our story',
    storyTitle: "Bringing the world's best collectibles to Sri Lanka",
    storyText: [
      "ACTION REALM is Sri Lanka's home for premium action figures, statues and pop-culture collectibles.",
      'We are collectors ourselves. Every figure we sell is officially licensed, carefully inspected and packed to survive the journey to your shelf.',
      'From Hot Toys and Iron Studios to Funko and Bandai, we bring the world’s best collectible brands to Sri Lanka, with local warranty support, installment plans and island-wide delivery.',
    ].join('\n\n'),
    storyButton: 'Explore the collection',
    storyImage1: 'https://images.unsplash.com/photo-1741512612523-d6b9b7cdd18b?auto=format&fit=crop&w=700&q=75',
    storyImage2: 'https://images.unsplash.com/photo-1623039902375-29258147f39e?auto=format&fit=crop&w=500&q=75',
    showStats: true,
    valuesTitle: 'What we stand for',
    values: [
      { icon: 'shield', title: '100% Authentic', text: 'Every figure is officially licensed and sourced from authorised distributors. No bootlegs, ever.' },
      { icon: 'store', title: 'Packed Like Treasure', text: 'Double-boxed, foam-wrapped and inspected before it leaves us, so it reaches your shelf in mint condition.' },
      { icon: 'truck', title: 'Island-wide Delivery', text: 'Insured delivery to all 25 districts, with updates on WhatsApp from dispatch to your door.' },
      { icon: 'heart', title: 'Run by Collectors', text: 'We collect too. Ask us anything, from scale and paint quality to release dates.' },
    ],
    showStores: true,
    storesTitle: 'Visit our stores',
    ctaTitle: 'Ready to grow your collection?',
    ctaText: 'Browse in-stock figures, reserve upcoming releases, or ask us for something special.',
  },
  contact: {
    label: 'Contact us',
    title: "We're here to help",
    text: "Questions about an order, a pre-order or a figure you're hunting for? We usually reply within a few hours.",
    formTitle: 'Send us a message',
    topics: ['Order question', 'Pre-order', 'Product request', 'Store visit', 'Other'],
    showMap: true,
  },
  login: {
    loginTitle: 'Welcome back',
    registerTitle: 'Join the Realm',
    image: 'https://images.unsplash.com/photo-1604882846805-a6813013c2b5?auto=format&fit=crop&w=1600&q=75',
    showDemo: true,
  },

  // PayHere (payhere.lk). Real card payments need a merchant ID AND a small server that
  // generates the payment hash with your merchant secret — never put the secret here.
  payhere: { merchantId: '', sandbox: true, hashEndpoint: '' },
  analytics: { gaId: '', metaPixelId: '' },
};

// Live settings object used everywhere in the app.
export const SITE = structuredClone(DEFAULT_SETTINGS);

// Deep-merge saved values over the defaults, so options added later always have a value.
// Arrays are replaced as a whole (they are edited as complete lists).
const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, saved) {
  if (!isPlain(base) || !isPlain(saved)) return saved === undefined ? base : saved;
  const out = { ...base };
  Object.keys(saved).forEach((k) => { out[k] = merge(base[k], saved[k]); });
  return out;
}

export function applySettings(doc) {
  if (!doc) return;
  const { id, createdAt, updatedAt, ...values } = doc; // eslint-disable-line no-unused-vars
  const merged = merge(structuredClone(DEFAULT_SETTINGS), values);
  Object.keys(SITE).forEach((k) => delete SITE[k]);
  Object.assign(SITE, merged);
}

export const HOME_SECTION_LABELS = {
  hero: 'Hero banner slider',
  brands: 'Brand logo strip',
  perks: 'Perks (delivery, authentic…)',
  tabs: 'Product tabs (In stock / Pre-orders / New / Sale)',
  characters: 'Shop by franchise (round photos)',
  categories: 'Shop by character (category tiles)',
  picks: "Collector's Picks (featured products)",
  trending: 'Trending franchise row',
  recent: 'Recently viewed',
  testimonials: 'Testimonials',
  faq: 'FAQ',
};

export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
  'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export const formatPrice = (n) => `Rs. ${Math.round(n).toLocaleString('en-LK')}`;

// Delivery charge for an order subtotal, using the live settings.
export function deliveryFor(subtotal) {
  if (!SITE.deliveryFee) return 0;
  if (SITE.freeDeliveryOver && subtotal >= SITE.freeDeliveryOver) return 0;
  return SITE.deliveryFee;
}

// Short customer-facing delivery line, e.g. "Free island-wide delivery".
export function deliveryText() {
  if (!SITE.deliveryFee) return 'Free island-wide delivery';
  if (SITE.freeDeliveryOver) return `Island-wide delivery ${formatPrice(SITE.deliveryFee)} · free over ${formatPrice(SITE.freeDeliveryOver)}`;
  return `Island-wide delivery ${formatPrice(SITE.deliveryFee)}`;
}

export const deliveryDaysFor = (district) =>
  district === 'Colombo' || district === 'Gampaha' ? SITE.deliveryDays.colombo : SITE.deliveryDays.other;

// Sri Lankan mobile numbers: 07XXXXXXXX or +947XXXXXXXX
export const isValidPhone = (s) => /^(?:\+94|0)7\d{8}$/.test(s.replace(/[\s-]/g, ''));

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
