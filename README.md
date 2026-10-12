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

Almost everything is managed in the **Admin panel** (`/admin`):

| Admin section | What it controls on the website |
| --- | --- |
| Dashboard | Sales overview, best sellers, low stock, latest orders |
| Orders | Order status, payment status, courier tracking number, private notes, WhatsApp updates, Excel export |
| Discounts | Discount codes (% or Rs.), minimum order, on/off, times used |
| Products | Add / edit / delete, multiple photos, prices, sale prices, stock, pre-orders, Featured & New tags |
| Reviews | Delete reviews, mark as verified |
| Income | Record income: method (list or custom), description, date, amount, shipment no, order no — search, filter, Excel export |
| Expenses | Same fields for money going out (stock, shipping, customs, rent…) |
| Bank & Profit | Debit (expenses) and credit (income + pre-order payments) by date or shipment, running balance, profit/loss dashboard, monthly chart, filters, Excel statement |
| **Pages** | Every page: Home (banner, sections, headings, brands, characters, perks, testimonials, FAQ), About Us, Contact Us, Login, and information pages (shipping, returns, privacy, terms, new pages) |

Code files (only needed for developers):

| What | File |
| --- | --- |
| Default settings (used before anything is saved in admin) | `src/config/site.js` |
| Sample products | `src/data/products.js` |
| Sample homepage content and pages | `src/data/content.js` |
| Admin account, sample coupons and reviews | `src/data/seeds.js` |
| Colours for light and dark mode | top of `src/index.css` |

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
