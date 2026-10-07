# Action Realm Collectibles

A collectibles e-commerce site for Sri Lanka, built with React + Vite.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

**Demo admin login:** `admin@actionrealm.lk` / `admin123` → open `/admin`. Change this password after logging in (Account → Profile).

## How data works (demo backend)

All data (products, orders, customers, reviews, coupons, messages) is stored in the **browser's localStorage** through one file: `src/services/db.js`.

- It works with no server, so everything is clickable now.
- Each browser has its own copy of the data. Orders placed on one phone are not visible on another computer.
- **Admin → Settings → Reset** restores the sample data.
- **To go live**, re-implement the functions in `src/services/db.js` (and `hashPassword`) against Firebase, Supabase or your own API. The rest of the app does not need to change.

## Where to change things

| What | File |
| --- | --- |
| Store name, phone, WhatsApp, stores, bank details, deposit %, sale end date, coins | `src/config/site.js` |
| Products | Admin panel (`/admin` → Products), or the sample list in `src/data/products.js` |
| Coupons, reviews, orders, customers | Admin panel |
| Hero slides, brand strip, characters, Instagram photos, FAQ, testimonials, policy pages | `src/data/content.js` |
| Starting data (admin user, sample coupons and reviews) | `src/data/seeds.js` |
| Colours (light and dark mode) | top of `src/index.css` |

## Features

**Shopping:** live search suggestions, quick view, filters saved in the URL, Load More, shop by character, sale and release countdowns, product photo zoom with full-screen view, reviews with star ratings, "Frequently bought together", recently viewed, a sticky mobile Add To Cart bar, back-in-stock alerts, wishlist and dark mode.

**Checkout (Sri Lanka):** three steps (Contact → Delivery → Payment), district list, 07X phone validation, coupon codes, Realm Coins, a 30% deposit for pre-orders, and three payment methods: card (PayHere), bank transfer and cash on delivery.

**Accounts:** register and log in, order history with a status timeline, saved addresses, coin balance, and order tracking by order number and phone.

**Admin:**
- dashboard
- products: add, edit, delete, photo upload, inline stock editing
- orders and status updates
- coupons
- reviews
- customers
- inbox: contact messages, restock requests, newsletter subscribers with CSV export

**Marketing:** newsletter popup (WELCOME10), Instagram feed, share-preview meta tags, Google Analytics / Meta Pixel hooks, and an installable app (PWA).

## Before going live

1. **Backend:** replace `src/services/db.js` with a real database (see above). Without it, orders stay in the customer's browser and you won't see them.
2. **PayHere:** create a merchant account and set `payhere.merchantId` in `src/config/site.js`. Then build a small server endpoint that returns the payment hash and set `payhere.hashEndpoint`. The merchant secret must never be in website code. Until then, card payments are simulated.
3. **Analytics:** set `analytics.gaId` and/or `analytics.metaPixelId` in `src/config/site.js`.
4. **Content:** replace the stock photos, sample reviews and testimonials, contact details, store addresses, bank account and policy text.
5. **Share previews per product:** WhatsApp and Facebook read the HTML before JavaScript runs, so use a host with pre-rendering if you need product-specific previews.
6. **Hosting:** configure an SPA fallback so every route serves `index.html`.
