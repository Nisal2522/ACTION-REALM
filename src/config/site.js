// Change these values to rebrand the whole store.
export const SITE = {
  name: 'ACTION REALM',
  tagline: 'Collectibles',
  url: 'https://actionrealm.lk', // your live domain, used for share links
  description: "Sri Lanka's home for premium action figures, statues and pop-culture collectibles. Island-wide delivery.",
  email: 'support@actionrealm.lk',
  phone: '+94 77 123 4567',
  whatsapp: '94771234567', // country code + number, digits only
  installmentThreshold: 25000, // 0% installment plans on orders above this (Rs.)
  coinsRate: 0.01, // 1 coin per Rs. 100 spent
  coinValue: 1, // each coin is worth Rs. 1 at checkout
  coinsName: 'Realm Coins',
  depositRate: 0.3, // pre-orders: pay 30% now, rest on arrival
  saleEndsAt: '2026-10-31T23:59:59+05:30', // countdown on sale items; set to null to hide
  stores: [
    { city: 'Colombo', address: 'Add your store address here', hours: '10 AM – 8 PM', map: 'https://maps.google.com/?q=Colombo' },
    { city: 'Kandy', address: 'Add your store address here', hours: '10 AM – 7 PM', map: 'https://maps.google.com/?q=Kandy' },
  ],
  bank: {
    name: 'Commercial Bank',
    branch: 'Colombo 03',
    accountName: 'Action Realm (Pvt) Ltd',
    accountNumber: '0000000000',
  },
  socials: {
    instagram: '#',
    youtube: '#',
    facebook: '#',
  },
  instagramHandle: '@actionrealm.lk',

  // PayHere (payhere.lk). Real card payments need a merchant ID AND a small server
  // that generates the payment hash with your merchant secret — never put the secret here.
  // While merchantId is empty, checkout shows a simulated payment screen.
  payhere: { merchantId: '', sandbox: true, hashEndpoint: '' },

  // Analytics: paste your IDs to turn tracking on.
  analytics: { gaId: '', metaPixelId: '' },
};

export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota',
  'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara',
  'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export const formatPrice = (n) => `Rs. ${Math.round(n).toLocaleString('en-LK')}`;

// Sri Lankan mobile numbers: 07XXXXXXXX or +947XXXXXXXX
export const isValidPhone = (s) => /^(?:\+94|0)7\d{8}$/.test(s.replace(/[\s-]/g, ''));

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
