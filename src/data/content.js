// Starting website content. Everything here is editable in Admin → Homepage / Pages;
// these values are only used the first time (or after "Reset").
import { DEFAULT_SETTINGS as S, formatPrice } from '../config/site';
import { db, registerSeed, useCollection } from '../services/db';

const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;
const withIds = (prefix, list) => list.map((item, i) => ({ id: `${prefix}${i + 1}`, ...item }));

const TERMS_INTRO = `These terms apply to every order placed with ${S.name} through this website, WhatsApp or our stores. By placing an order you agree to them, so please read them before you buy.`;
const TERMS_SECTIONS = withIds('t', [
  {
    title: 'Prices and payment',
    body: `All prices are in Sri Lankan Rupees (LKR) and include all taxes.\n\nWe accept:\n- Card payments through PayHere\n- Bank transfer\n- Cash on delivery\n- 0% installment plans on orders above ${formatPrice(S.installmentThreshold)}\n\nCard payments are processed securely by PayHere. We never see or store your card number.`,
  },
  {
    title: 'Orders and confirmation',
    body: 'Your order is confirmed once you receive an order number by SMS, WhatsApp or email.\n\nIf an item is out of stock or shown at a wrong price because of an error, we will contact you before dispatch. You can then choose a replacement or a full refund.',
  },
  {
    title: 'Pre-orders',
    body: 'A pre-order reserves a figure before it is released. You pay a deposit when you order, and the balance is collected before dispatch.\n\n- Release dates are set by manufacturers and may change.\n- We will keep you updated if a date moves.\n- Your deposit is refundable if the manufacturer cancels the product or delays it by more than 6 months.',
  },
  {
    title: 'Product images and descriptions',
    body: 'Product images are for illustration. Final products may vary slightly from the prototypes shown by manufacturers, including paint and packaging.',
  },
  {
    title: 'Delivery',
    body: 'We deliver to all 25 districts in Sri Lanka. Delivery times are explained in our [Shipping Policy](/pages/shipping).\n\nPlease check your parcel when it arrives and tell us within 48 hours if anything is wrong.',
  },
  {
    title: 'Returns and refunds',
    body: 'Damaged or incorrect items are replaced or refunded when reported within 48 hours with an unboxing video. Full details are in our [Returns & Refunds](/pages/returns) policy.',
  },
  {
    title: S.coinsName,
    body: `You earn ${S.coinsName} on eligible orders.\n\n- Coins have no cash value and cannot be exchanged for money.\n- Coins expire 12 months after they are earned.\n- Coins earned on an order that is returned or refunded may be cancelled.`,
  },
  {
    title: 'Changes to these terms',
    body: 'We may update these terms from time to time. The version shown on this page on the day you place your order is the one that applies.',
  },
]);
const DEFAULT_TERMS = {
  image: unsplash('1762786613960-96fc8a8d8d6b', 1920),
  intro: TERMS_INTRO,
  sections: TERMS_SECTIONS,
  body: [TERMS_INTRO, ...TERMS_SECTIONS.map((s) => `${s.title}\n${s.body}`)].join('\n\n'),
};

registerSeed('heroSlides', () => withIds('hs', [
  {
    eyebrow: 'New Arrival',
    title: 'Judgment Day Is Here',
    text: 'The T-800 Endoskeleton has landed in Sri Lanka. Limited stock available.',
    cta: 'Shop Sci-Fi',
    link: '/collections/sci-fi',
    image: unsplash('1624371960524-ade99abadb34'),
    baseColor: '#020617',
    glowColor: '#06b6d4',
    enabled: true,
  },
  {
    eyebrow: 'Pre-Order Now',
    title: 'Museum-Grade Statues',
    text: `Reserve premium statues with just ${Math.round(S.depositRate * 100)}% down and pay the rest on arrival.`,
    cta: 'View Pre-Orders',
    link: '/collections/pre-orders',
    image: unsplash('1702138129392-364adea0ad00'),
    baseColor: '#1a0204',
    glowColor: '#b90a1c',
    enabled: true,
  },
  {
    eyebrow: 'Up To 20% Off',
    title: 'The Big Collector Sale',
    text: 'Hand-picked figures and replicas at their lowest prices.',
    cta: 'Shop The Sale',
    link: '/collections/sale',
    image: unsplash('1604882846805-a6813013c2b5'),
    baseColor: '#1a0303',
    glowColor: '#ef4444',
    enabled: true,
  },
]));

// Leave `logo` empty to show an initials badge.
registerSeed('brandStrip', () => withIds('br', [
  { name: 'Hot Toys', logo: '' },
  { name: 'Iron Studios', logo: '/brands/iron-studios.png' },
  { name: 'Funko', logo: '/brands/funko.png' },
  { name: 'McFarlane Toys', logo: '/brands/mcfarlane-toys.png' },
  { name: 'NECA', logo: '/brands/neca.png' },
  { name: 'Bandai', logo: '/brands/bandai.png' },
  { name: 'Hasbro', logo: '/brands/hasbro.png' },
  { name: 'Prime 1 Studio', logo: '/brands/prime-1-studio.png' },
  { name: 'threezero', logo: '/brands/threezero.png' },
  { name: 'Jada Toys', logo: '/brands/jada-toys.png' },
  { name: 'Banpresto', logo: '' },
  { name: 'Hiya Toys', logo: '/brands/hiya-toys.png' },
  { name: 'Sideshow', logo: '/brands/sideshow.png' },
  { name: 'Mezco', logo: '/brands/mezco.png' },
]));

// "Shop by character" tiles — each one searches the catalogue for `query`.
registerSeed('characters', () => withIds('ch', [
  { name: 'Spider-Man', query: 'spider-man', image: unsplash('1557985594-29f3ad9f5134', 300) },
  { name: 'Batman', query: 'batman', image: unsplash('1561994495-7be2d2a3fa14', 300) },
  { name: 'Iron Man', query: 'iron man', image: unsplash('1592435468595-ab8dd76cd754', 300) },
  { name: 'Naruto', query: 'naruto', image: unsplash('1714537076751-f3955b5578a7', 300) },
  { name: 'Darth Vader', query: 'darth vader', image: unsplash('1521985179118-6008b8cef2c2', 300) },
  { name: 'Deadpool', query: 'deadpool', image: unsplash('1674448417387-345997fcd888', 300) },
  { name: 'Luffy', query: 'luffy', image: unsplash('1621478374422-35206faeddfb', 300) },
  { name: 'Superman', query: 'superman', image: unsplash('1558679908-541bcf1249ff', 300) },
]));

registerSeed('perks', () => withIds('pk', [
  { icon: 'truck', title: 'Free Island-wide Delivery', text: 'Insured delivery to all 25 districts' },
  { icon: 'shield', title: '100% Authentic', text: 'Officially licensed products' },
  { icon: 'card', title: '0% Installments', text: `On orders above ${formatPrice(S.installmentThreshold)}` },
  { icon: 'store', title: 'Visit Our Stores', text: 'Colombo & Kandy' },
]));

// Sample testimonials — replace with real customer reviews before launch.
registerSeed('testimonials', () => withIds('tm', [
  { name: 'Kasun P.', city: 'Colombo', rating: 5, text: 'Packaging was insane, double boxed with foam all around. My Hot Toys figure arrived in perfect condition.' },
  { name: 'Dilini R.', city: 'Kandy', rating: 5, text: 'Pre-order process was smooth and they kept me updated the whole way. Will definitely order again.' },
  { name: 'Ashan W.', city: 'Galle', rating: 5, text: 'Genuine products at fair prices. Customer support replied on WhatsApp within minutes.' },
  { name: 'Nethmi S.', city: 'Negombo', rating: 5, text: 'Visited the store and the display is amazing. Staff really know their collectibles.' },
  { name: 'Ravindu D.', city: 'Kurunegala', rating: 5, text: 'The 0% installment plan made it easy to finally get the statue I wanted for years.' },
]));

registerSeed('faqs', () => withIds('fq', [
  { q: 'Do you deliver island-wide?', a: 'Yes. We deliver to all 25 districts in Sri Lanka, and delivery is free on every order. Colombo orders usually arrive in 1–2 days, other areas in 2–4 days.' },
  { q: 'How do pre-orders work?', a: `Pay ${Math.round(S.depositRate * 100)}% now to reserve the item and the balance when it arrives in Sri Lanka. We keep you updated on the release date.` },
  { q: 'Are your products authentic?', a: 'Every product is 100% officially licensed and sourced from authorised distributors.' },
  { q: 'Can I pay in installments?', a: `0% installment plans are available on orders above ${formatPrice(S.installmentThreshold)} with participating bank credit cards.` },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes, for in-stock items. Pre-orders need the deposit paid online or by bank transfer.' },
  { q: 'What if my item arrives damaged?', a: 'Record an unboxing video and contact us within 48 hours. We will arrange a replacement or refund.' },
  { q: 'How do Realm Coins work?', a: `You earn 1 coin for every Rs. 100 spent. Each coin is worth Rs. ${S.coinValue} on your next order.` },
]));

// Information pages at /pages/:slug. Paragraphs are separated by a blank line.
registerSeed('pages', () => [
  {
    id: 'about', slug: 'about', title: 'About Us', showInFooter: true,
    body: [
      `${S.name} is Sri Lanka's home for premium action figures, statues and pop-culture collectibles.`,
      'We are collectors ourselves. Every figure we sell is officially licensed, carefully inspected and packed to survive the journey to your shelf.',
      'From Hot Toys and Iron Studios to Funko and Bandai, we bring the world’s best collectible brands to Sri Lanka, with local warranty support, installment plans and island-wide delivery.',
    ].join('\n\n'),
  },
  {
    id: 'shipping', slug: 'shipping', title: 'Shipping Policy', showInFooter: true,
    body: [
      'Delivery is free island-wide on all orders.',
      'In-stock orders are dispatched within 1–2 business days. Colombo and suburbs: 1–2 days. Other districts: 2–4 days.',
      'Every parcel is double-boxed and insured. You will receive a tracking update by SMS/WhatsApp when your order ships.',
      'Pre-orders ship as soon as stock arrives in Sri Lanka. We will contact you to collect the balance payment before dispatch.',
    ].join('\n\n'),
  },
  {
    id: 'returns', slug: 'returns', title: 'Returns & Refunds', showInFooter: true,
    body: [
      'If your item arrives damaged or incorrect, contact us within 48 hours with an unboxing video.',
      'We will arrange a replacement, or a full refund if a replacement is not available.',
      'Unopened items can be returned within 7 days for store credit. Opened collectibles cannot be returned unless faulty.',
      'Pre-order deposits are refundable if the manufacturer cancels or delays the product by more than 6 months.',
    ].join('\n\n'),
  },
  {
    id: 'privacy', slug: 'privacy', title: 'Privacy Policy', showInFooter: true,
    body: [
      'We collect only the details needed to process your order: name, contact details and delivery address.',
      'Card payments are processed securely by PayHere. We never see or store your card number.',
      'We do not sell your personal data. You can ask us to delete your account and data at any time.',
    ].join('\n\n'),
  },
  { id: 'terms', slug: 'terms', title: 'Terms & Conditions', showInFooter: true, ...DEFAULT_TERMS },
]);

// ── Information pages with sub-topics ───────────────────────────────────────
// A page has an optional `intro` and a list of `sections` ({ id, title, body }).
// `body` on the page is kept as a plain-text copy for previews and read time.
export const pageBody = (intro, sections) =>
  [intro, ...sections.map((s) => [s.title, s.body].filter(Boolean).join('\n'))].filter((x) => x && x.trim()).join('\n\n');

// Older pages only have `body`: each paragraph becomes a topic without a heading.
export function pageSections(page) {
  if (Array.isArray(page?.sections)) return { intro: page.intro || '', sections: page.sections };
  const paragraphs = (page?.body || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return { intro: '', sections: paragraphs.map((body, i) => ({ id: `p${i + 1}`, title: '', body })) };
}

const OLD_TERMS_BODY = [
  'Prices are in Sri Lankan Rupees (LKR) and include all taxes.',
  'Product images are for illustration. Final products may vary slightly from prototypes shown by manufacturers.',
  'Pre-order release dates are set by manufacturers and may change.',
  `${S.coinsName} have no cash value and expire 12 months after they are earned.`,
].join('\n\n');

// Give the untouched starter Terms page its new topics (admin edits are left alone).
export function upgradeTermsPage() {
  const terms = db.all('pages').find((p) => p.id === 'terms');
  if (terms && !terms.sections && (terms.body || '').trim() === OLD_TERMS_BODY) db.update('pages', 'terms', DEFAULT_TERMS);
  else if (terms && !('image' in terms)) db.update('pages', 'terms', { image: DEFAULT_TERMS.image });
}

// Banner photo and text for collection pages (brand, category, franchise). Empty means automatic.
registerSeed('collectionBanners', () => []);

export const CONTENT_COLLECTIONS = ['heroSlides', 'brandStrip', 'characters', 'perks', 'testimonials', 'faqs', 'pages', 'collectionBanners'];

// Live content for the storefront.
export const useContent = (name) => useCollection(name);
