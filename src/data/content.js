// Homepage and page content. Replace the sample reviews and text with your own.
import { SITE, formatPrice } from '../config/site';

export const HERO_SLIDES = [
  {
    eyebrow: 'New Arrival',
    title: 'Judgment Day Is Here',
    text: 'The T-800 Endoskeleton has landed in Sri Lanka. Limited stock available.',
    cta: 'Shop Sci-Fi',
    to: '/collections/sci-fi',
    image: '1624371960524-ade99abadb34',
    colors: ['#06b6d4', '#020617'],
  },
  {
    eyebrow: 'Pre-Order Now',
    title: 'Museum-Grade Statues',
    text: `Reserve premium statues with just ${Math.round(SITE.depositRate * 100)}% down — pay the rest on arrival.`,
    cta: 'View Pre-Orders',
    to: '/collections/pre-orders',
    image: '1702138129392-364adea0ad00',
    colors: ['#b90a1c', '#1a0204'],
  },
  {
    eyebrow: 'Up To 20% Off',
    title: 'The Big Collector Sale',
    text: 'Hand-picked figures and replicas at their lowest prices.',
    cta: 'Shop The Sale',
    to: '/collections/sale',
    image: '1604882846805-a6813013c2b5',
    colors: ['#ef4444', '#1a0303'],
  },
];

// Logos live in public/brands/. Leave `logo` out to show an initials badge instead.
export const MARQUEE_BRANDS = [
  { name: 'Hot Toys' },
  { name: 'Iron Studios', logo: '/brands/iron-studios.png' },
  { name: 'Funko', logo: '/brands/funko.png' },
  { name: 'McFarlane Toys', logo: '/brands/mcfarlane-toys.png' },
  { name: 'NECA', logo: '/brands/neca.png' },
  { name: 'Bandai', logo: '/brands/bandai.png' },
  { name: 'Hasbro', logo: '/brands/hasbro.png' },
  { name: 'Prime 1 Studio', logo: '/brands/prime-1-studio.png' },
  { name: 'threezero', logo: '/brands/threezero.png' },
  { name: 'Jada Toys', logo: '/brands/jada-toys.png' },
  { name: 'Banpresto' },
  { name: 'Hiya Toys', logo: '/brands/hiya-toys.png' },
  { name: 'Sideshow', logo: '/brands/sideshow.png' },
  { name: 'Mezco', logo: '/brands/mezco.png' },
];

// "Shop by character" tiles — each one searches the catalogue for `query`.
export const CHARACTERS = [
  { name: 'Spider-Man', query: 'spider-man', image: '1557985594-29f3ad9f5134' },
  { name: 'Batman', query: 'batman', image: '1561994495-7be2d2a3fa14' },
  { name: 'Iron Man', query: 'iron man', image: '1592435468595-ab8dd76cd754' },
  { name: 'Naruto', query: 'naruto', image: '1714537076751-f3955b5578a7' },
  { name: 'Darth Vader', query: 'darth vader', image: '1521985179118-6008b8cef2c2' },
  { name: 'Deadpool', query: 'deadpool', image: '1674448417387-345997fcd888' },
  { name: 'Luffy', query: 'luffy', image: '1621478374422-35206faeddfb' },
  { name: 'Superman', query: 'superman', image: '1558679908-541bcf1249ff' },
];

// Sample testimonials — replace with real customer reviews before launch.
export const TESTIMONIALS = [
  { name: 'Kasun P.', city: 'Colombo', text: 'Packaging was insane — double boxed with foam all around. My Hot Toys figure arrived in perfect condition.' },
  { name: 'Dilini R.', city: 'Kandy', text: 'Pre-order process was smooth and they kept me updated the whole way. Will definitely order again.' },
  { name: 'Ashan W.', city: 'Galle', text: 'Genuine products at fair prices. Customer support replied on WhatsApp within minutes.' },
  { name: 'Nethmi S.', city: 'Negombo', text: 'Visited the store and the display is amazing. Staff really know their collectibles.' },
  { name: 'Ravindu D.', city: 'Kurunegala', text: 'The 0% installment plan made it easy to finally get the statue I wanted for years.' },
];

export const FAQS = [
  { q: 'Do you deliver island-wide?', a: 'Yes. We deliver to all 25 districts in Sri Lanka, and delivery is free on every order. Colombo orders usually arrive in 1–2 days, other areas in 2–4 days.' },
  { q: 'How do pre-orders work?', a: `Pay ${Math.round(SITE.depositRate * 100)}% now to reserve the item and the balance when it arrives in Sri Lanka. We keep you updated on the release date.` },
  { q: 'Are your products authentic?', a: 'Every product is 100% officially licensed and sourced from authorised distributors.' },
  { q: 'Can I pay in installments?', a: `0% installment plans are available on orders above ${formatPrice(SITE.installmentThreshold)} with participating bank credit cards.` },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes, for in-stock items. Pre-orders need the deposit paid online or by bank transfer.' },
  { q: 'What if my item arrives damaged?', a: 'Record an unboxing video and contact us within 48 hours. We will arrange a replacement or refund.' },
  { q: 'How do Realm Coins work?', a: `You earn 1 coin for every Rs. 100 spent. Each coin is worth Rs. ${SITE.coinValue} on your next order.` },
];

// Information pages at /pages/:slug. Edit the text to match your real policies.
export const INFO_PAGES = {
  about: {
    title: 'About Us',
    body: [
      `${SITE.name} is Sri Lanka's home for premium action figures, statues and pop-culture collectibles.`,
      'We are collectors ourselves. Every figure we sell is officially licensed, carefully inspected and packed to survive the journey to your shelf.',
      'From Hot Toys and Iron Studios to Funko and Bandai, we bring the world’s best collectible brands to Sri Lanka — with local warranty support, installment plans and island-wide delivery.',
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    body: [
      'Delivery is free island-wide on all orders.',
      'In-stock orders are dispatched within 1–2 business days. Colombo and suburbs: 1–2 days. Other districts: 2–4 days.',
      'Every parcel is double-boxed and insured. You will receive a tracking update by SMS/WhatsApp when your order ships.',
      'Pre-orders ship as soon as stock arrives in Sri Lanka. We will contact you to collect the balance payment before dispatch.',
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    body: [
      'If your item arrives damaged or incorrect, contact us within 48 hours with an unboxing video.',
      'We will arrange a replacement, or a full refund if a replacement is not available.',
      'Unopened items can be returned within 7 days for store credit. Opened collectibles cannot be returned unless faulty.',
      'Pre-order deposits are refundable if the manufacturer cancels or delays the product by more than 6 months.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'We collect only the details needed to process your order: name, contact details and delivery address.',
      'Card payments are processed securely by PayHere. We never see or store your card number.',
      'We do not sell your personal data. You can ask us to delete your account and data at any time.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'Prices are in Sri Lankan Rupees (LKR) and include all taxes.',
      'Product images are for illustration. Final products may vary slightly from prototypes shown by manufacturers.',
      'Pre-order release dates are set by manufacturers and may change.',
      `${SITE.coinsName} have no cash value and expire 12 months after they are earned.`,
    ],
  },
};
