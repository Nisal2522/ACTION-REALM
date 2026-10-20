# Prompt: Collectibles e-commerce website (requirements)

Copy everything below the line into your AI coding assistant. Replace the values in [square brackets] with your own.

---

Build a complete e-commerce website for **[ACTION REALM]**, a Sri Lankan store that sells premium action figures, statues, 1/6 scale figures, replicas, Funko Pops and diecast collectibles. Slogan: **"[The World of Legends]"**. Prices are in Sri Lankan Rupees, shown as "Rs. 12,500".

The website has two parts:
1. A **customer website** where people browse, order and track collectibles.
2. An **admin panel** at `/admin` where the owner manages everything. Everything shown on the customer website (products, banners, menus, page text, colours, delivery fees, settings) must be editable from the admin panel without touching code.

## Technology and hosting

- **MERN stack**: MongoDB, Express, React, Node.js.
- Frontend hosted on **Vercel**, backend hosted on **Render**, database on **MongoDB Atlas**. Product and banner images must be stored somewhere that survives server restarts (for example Cloudinary).
- Take the project all the way to a working live site, and give me step-by-step deployment instructions.
- **No online payment gateway.** Customers pay only by **bank transfer** or **cash on delivery**.

## Look and feel

- Dark, premium, cinematic "collector" style. Dark mode by default, with a light mode switch in the header.
- Brand colour: deep red **[#b90a1c]**, changeable from admin.
- Headings in **Bebas Neue**, body text in **Inter**.
- Logo with the slogan under it, in white for dark mode and red for light mode.
- Modern, attractive and professional: glass (frosted blur) effects on the header and menus, smooth hover animations, clean cards.
- Works well on desktop, tablet and phone. On phones, a bottom navigation bar with Home, Shop, Wishlist, Cart and Account.
- Accessible: readable contrast in both modes, keyboard friendly, labels on icon buttons.
- Do not use the em dash character anywhere in the site text.

## Header and menu

- Two clearly separate rows:
  - **Top row**: logo on the left, a large search box in the middle (shows matching products while typing), and icons on the right: light/dark switch, account, wishlist (with count) and cart (with count).
  - **Menu row**: a full-width glass strip under the top row with the menu items centred. The current page and hovered items get a glowing red underline. The **Sale** item looks like a red badge with a small pulsing dot.
- Menu items: Home, About Us, **Stocks** (dropdown: In Stock, Pre-Order, Sold Out, New Arrivals), **Franchises** (dropdown listing all franchises), Sale, Contact Us. The owner can add, rename, reorder, hide and delete menu items.
- On phones the menu opens as a side drawer, with extra links for My Account and Track Order.

## Customer website

### Home page
The owner can turn each section on or off, reorder them and rename their titles:
1. Hero banner slider (image, small label, title, text, button, auto-play).
2. Scrolling strip of brand logos.
3. Perks row (delivery, authenticity, pre-orders, stores).
4. Product tabs: In Stock, Pre-Orders, New Arrivals, Sale.
5. Shop by Franchise (round tiles).
6. Shop by Character (photo tiles that open a search for that character).
7. Collector's Picks (featured products).
8. Trending franchise row (franchise picked by the owner).
9. Recently viewed products.
10. Customer testimonials.
11. FAQ.

### Product listing
- Pages for All Products, In Stock, Pre-Orders, New Arrivals, Sold Out, Sale, and for every category, franchise and brand.
- Filters: availability, category, franchise, brand, price range. Sort by featured, newest, price low to high, price high to low, name A to Z. Search results page. Product count and a "clear filters" option.

### Product card
Photo, badges (New, Sale with % off, Pre-Order, Sold Out, "Only 2 left"), brand, name, price with the old price crossed out when on sale, star rating, wishlist heart, Quick View popup and Add to Cart. Sold-out items show "Notify me". Pre-order items show "Pre-order".

### Product page
- Photo gallery with zoom.
- Name, brand, franchise, category, price, sale price with a countdown to the end of the sale, stock status.
- Pre-orders show the expected arrival and a countdown to the release date, and explain that the customer pays a **[30]% deposit now and the rest when it arrives**.
- Quantity, Add to Cart, Buy Now, wishlist, share (WhatsApp, Facebook, copy link).
- Delivery estimate by district, and how many loyalty coins the order earns.
- Description, customer reviews (rating summary, customers can write reviews, owner approves them), "frequently bought together", related products, recently viewed.
- A buy bar that sticks to the bottom of the screen after scrolling past the main Add to Cart button.
- "Notify me when back in stock" form for sold-out items.

### Cart
Slide-in cart with quantity controls, remove, subtotal, coupon code box, a progress bar towards free delivery (when that rule is on), and a checkout button. The cart and wishlist are kept when the visitor comes back.

### Checkout
- Guest checkout allowed. Logged-in customers get their details filled in.
- Name, mobile number (Sri Lankan format, 07XXXXXXXX or +947XXXXXXXX), email, address, city, **district (all 25 districts)**, order notes.
- Delivery fee follows the owner's rules: always free, a flat fee, or free over a set amount. Delivery time shown by district.
- Payment: **Bank transfer** (shows the bank details) or **Cash on delivery**. The owner can turn each one on or off.
- Coupon codes, using loyalty coins as a discount, and the pre-order deposit split ("pay now" and "pay on arrival").
- All prices and totals must be checked on the server, so customers cannot change prices.
- After ordering, the customer gets an order number such as **AR10042**.

### After ordering
- **Order confirmation page**: order details, bank details for transfer, a way to **upload the bank payment slip**, and a WhatsApp button.
- **Track order page**: enter order number and phone number, see the status (Placed, Confirmed, Shipped, Delivered or Cancelled), the payment status and any note from the store.

### Customer account
- Register and log in (nice split screen with a big image).
- My Account: edit profile, order history with status, loyalty coin balance, saved addresses, log out.

### Other pages
- Wishlist.
- About Us: story, photos, stats, values, store locations.
- Contact Us: phone, email, WhatsApp, contact form with a topic dropdown, store locations with opening hours and maps.
- Loyalty rewards page explaining the coin programme.
- Policy pages: Terms, Privacy, Shipping, Returns.
- A friendly 404 page.

### On every page
- Footer with logo, description, link columns, store locations, newsletter signup, social links, "Bank transfer / Cash on delivery" badges and copyright text.
- Newsletter popup after a few seconds offering a discount code (shown once).
- Floating WhatsApp chat button.
- Good SEO: page titles, descriptions and social share previews.

## Admin panel

Only admin users can open it. Sidebar menu that can be collapsed, light/dark switch, and it works on phones.

- **Dashboard**: sales, number of orders, average order value and number of customers for a chosen period (this month, 30 days, 90 days, all time, custom), with charts for sales over time and orders by status, recent orders, top products, low stock warnings, and a to-do list (orders to confirm, orders to ship, bank slips to check).
- **Orders**: search and filter orders, change the order status, mark payment as received, view the uploaded bank slip, add a note the customer sees when tracking, add a shipment reference, print an invoice, message the customer on WhatsApp.
- **Discounts**: create coupon codes (% off or Rs. off, minimum order, on/off), and see how many times each was used.
- **Customers**: list of customers with number of orders and total spent.
- **Inbox**: contact form messages, back-in-stock requests and newsletter subscribers.
- **Products**: add, edit and delete products with several photos, name, brand, category, franchise, in stock or pre-order, price, old price (for sales), stock quantity, expected release, release date, New and Featured flags, and description. Search, filter and sort the list.
- **Reviews**: approve, hide or delete customer reviews.
- **Finance**: record income and expenses (date, amount, method, description, shipment reference, order number), a bank and profit page showing money in, money out and profit or loss by date or by shipment, and export to Excel/CSV.
- **Website content**: edit the home page sections, banners, brand strip, franchise and character tiles, perks, testimonials, FAQs, About, Contact, Login page text and policy pages.
- **Navigation**: edit the header menu and the footer links.
- **Theme**: brand colour, corner roundness, default light or dark mode, logo.
- **Settings**: store name, slogan, contact details, WhatsApp number, social links, store locations, bank details, delivery rules and delivery days, payment methods on/off, loyalty coin rules, pre-order deposit %, sale end date, category and franchise lists, popup text and code.

## Business rules

- A product is **on sale** when it has an old price higher than the current price.
- A product is **sold out** when it is in stock type and its stock is 0. Stock goes down when an order is placed and comes back if the order is cancelled.
- **Pre-orders**: the customer pays [30]% now and the rest on arrival.
- **Loyalty coins ([Realm Coins])**: earn 1 coin for every Rs. 100 spent; each coin is worth Rs. 1 off a later order.
- **Delivery**: free island-wide by default. Colombo and Gampaha [1-2] days, other districts [2-4] days.
- Cash on delivery is for in-stock items. Pre-order deposits are paid by bank transfer.

## Sample data

Load this sample data so the site looks complete from day one. Use free Unsplash photos for products and banners. Also create a few sample orders in different statuses, a few reviews and some income and expense entries so the admin dashboard has data.

**Store details**
- Name: ACTION REALM. Slogan: The World of Legends.
- Email: support@actionrealm.lk. Phone: +94 77 123 4567. WhatsApp: 94771234567.
- Stores: Colombo (10 AM to 8 PM), Kandy (10 AM to 7 PM).
- Bank: Commercial Bank, Colombo 03 branch, account name Action Realm (Pvt) Ltd, account number 0000000000.

**Categories:** Action Figures, Statues, 1/6 Scale Figures, Replicas, Funko Pop, Diecast.

**Franchises:** Marvel, DC, Anime, Gaming, Horror, Sci-Fi.

**Brands (logo strip):** Hot Toys, Iron Studios, Funko, McFarlane Toys, NECA, Bandai, Hasbro, Prime 1 Studio, threezero, Jada Toys, Banpresto, Hiya Toys, Sideshow, Mezco.

**Products (price in Rs.)**

| # | Name | Brand | Category | Franchise | Price | Notes |
|---|------|-------|----------|-----------|-------|-------|
| 1 | Iron Man Mark LXXXV 1/6 Scale Figure | Hot Toys | 1/6 Scale Figures | Marvel | 121,999 | Featured, stock 2 |
| 2 | Batman Arkham Knight Art Scale Statue | Iron Studios | Statues | DC | 100,999 | Featured |
| 3 | Spider-Man Advanced Suit Action Figure | Hasbro | Action Figures | Marvel | 10,499 | Sale, was 11,999 |
| 4 | Naruto Uzumaki Sage Mode Figure | Bandai | Action Figures | Anime | 17,499 | New, featured |
| 5 | Tanjiro Kamado Pop! Vinyl | Funko | Funko Pop | Anime | 4,499 | |
| 6 | T-800 Endoskeleton Ultimate Figure | NECA | Action Figures | Sci-Fi | 15,499 | New |
| 7 | Darth Vader 1/6 Scale Figure | Hot Toys | 1/6 Scale Figures | Sci-Fi | 114,999 | Pre-order, Q2 2027 |
| 8 | The Joker Deluxe Art Scale Statue | Iron Studios | Statues | DC | 86,999 | Pre-order, Q1 2027 |
| 9 | Spawn Deluxe Action Figure | McFarlane Toys | Action Figures | Horror | 8,499 | |
| 10 | Kratos Ultimate Action Figure | NECA | Action Figures | Gaming | 13,999 | Featured |
| 11 | Pennywise Ultimate Figure | NECA | Action Figures | Horror | 13,499 | Sale, was 14,999 |
| 12 | Michael Myers Ultimate Figure | NECA | Action Figures | Horror | 11,999 | Sold out |
| 13 | Goku Ultra Instinct Figure | Bandai | Action Figures | Anime | 18,999 | Pre-order, Dec 2026 |
| 14 | Luffy Gear 5 Statue | Banpresto | Statues | Anime | 10,499 | New |
| 15 | Superman Museum Masterline Statue | Prime 1 Studio | Statues | DC | 314,999 | Pre-order, Q3 2027 |
| 16 | Thor Love and Thunder 1/6 Scale Figure | Hot Toys | 1/6 Scale Figures | Marvel | 111,999 | Sale, was 125,999 |
| 17 | Batmobile 1:24 Diecast Vehicle | Jada Toys | Diecast | DC | 11,499 | |
| 18 | Optimus Prime DLX Figure | threezero | Action Figures | Sci-Fi | 76,999 | New, featured |
| 19 | Mjolnir Electronic Replica | Hasbro | Replicas | Marvel | 44,999 | |
| 20 | Infinity Gauntlet Electronic Replica | Hasbro | Replicas | Marvel | 34,999 | Sale, was 41,999 |
| 21 | Batman Classic Pop! Vinyl | Funko | Funko Pop | DC | 3,999 | Sold out |
| 22 | Deadpool Pop! Vinyl | Funko | Funko Pop | Marvel | 3,999 | New |
| 23 | Geralt of Rivia Action Figure | McFarlane Toys | Action Figures | Gaming | 9,999 | |
| 24 | Venom Art Scale Statue | Iron Studios | Statues | Marvel | 69,999 | Featured |
| 25 | The Mandalorian 1/6 Scale Figure | Hot Toys | 1/6 Scale Figures | Sci-Fi | 118,999 | Stock 1 |
| 26 | Ghostface Pop! Vinyl | Funko | Funko Pop | Horror | 3,999 | Sale, was 4,499 |
| 27 | Gojo Satoru Figure | Bandai | Action Figures | Anime | 18,499 | New |
| 28 | Doom Slayer 1/12 Figure | Hiya Toys | Action Figures | Gaming | 13,999 | Pre-order, Jan 2027 |
| 29 | Lightsaber Force FX Replica | Hasbro | Replicas | Sci-Fi | 65,999 | Pre-order, Nov 2026 |
| 30 | Ecto-1 1:24 Diecast Vehicle | Jada Toys | Diecast | Sci-Fi | 10,499 | Sale, was 11,999 |

Products without a note have stock 5. Description for every product: "[Name] from [Brand]. A highly detailed, officially licensed collectible from the [Franchise] universe, sculpted and painted for display, packed with care and delivered insured island-wide."

**Hero banners**
1. "New Arrival" / **Judgment Day Is Here** / The T-800 Endoskeleton has landed in Sri Lanka. Limited stock available. / Button: Shop Sci-Fi.
2. "Pre-Order Now" / **Museum-Grade Statues** / Reserve premium statues with just 30% down and pay the rest on arrival. / Button: View Pre-Orders.
3. "Up To 20% Off" / **The Big Collector Sale** / Hand-picked figures and replicas at their lowest prices. / Button: Shop The Sale.

**Shop by Character tiles:** Spider-Man, Batman, Iron Man, Naruto, Darth Vader, Deadpool, Luffy, Superman.

**Perks**
- Free Island-wide Delivery: insured delivery to all 25 districts.
- 100% Authentic: officially licensed products.
- Easy Pre-Orders: reserve with 30% down.
- Visit Our Stores: Colombo and Kandy.

**Coupons**
- WELCOME10: 10% off, no minimum (newsletter welcome offer).
- REALM2000: Rs. 2,000 off orders over Rs. 30,000.

**Testimonials (5 stars each)**
- Kasun P., Colombo: "Packaging was insane, double boxed with foam all around. My Hot Toys figure arrived in perfect condition."
- Dilini R., Kandy: "Pre-order process was smooth and they kept me updated the whole way. Will definitely order again."
- Ashan W., Galle: "Genuine products at fair prices. Customer support replied on WhatsApp within minutes."
- Nethmi S., Negombo: "Visited the store and the display is amazing. Staff really know their collectibles."
- Ravindu D., Kurunegala: "Ordering was so easy, and the bank transfer was confirmed the same day."

**FAQs**
- Do you deliver island-wide? Yes, to all 25 districts, free on every order. Colombo 1 to 2 days, other areas 2 to 4 days.
- How do pre-orders work? Pay 30% now to reserve the item and the balance when it arrives in Sri Lanka. We keep you updated on the release date.
- Are your products authentic? Every product is 100% officially licensed and sourced from authorised distributors.
- How can I pay? By bank transfer or cash on delivery. For bank transfer, upload your payment slip after placing the order.
- Do you offer cash on delivery? Yes, for in-stock items. Pre-order deposits are paid by bank transfer.
- What if my item arrives damaged? Record an unboxing video and contact us within 48 hours. We will arrange a replacement or refund.
- How do Realm Coins work? You earn 1 coin for every Rs. 100 spent. Each coin is worth Rs. 1 on your next order.

**Policy pages**
- **Shipping:** Free island-wide delivery. In-stock orders dispatched within 1 to 2 business days. Colombo and suburbs 1 to 2 days, other districts 2 to 4 days. Every parcel is double-boxed and insured, with a WhatsApp update when it ships. Pre-orders ship when stock arrives; we collect the balance before dispatch.
- **Returns:** Damaged or wrong items must be reported within 48 hours with an unboxing video, for a replacement or full refund. Unopened items can be returned within 7 days for store credit. Opened collectibles cannot be returned unless faulty. Pre-order deposits are refunded if the manufacturer cancels or delays the product by more than 6 months.
- **Privacy:** We collect only the details needed to process orders (name, contact details, delivery address). We never sell personal data, and customers can ask us to delete their account at any time.
- **Terms:** Prices are in LKR and include all taxes. Product images are for illustration and final products may vary slightly from prototypes. Pre-order release dates are set by manufacturers and may change. Realm Coins have no cash value and expire 12 months after they are earned.

**Newsletter popup:** "Get 10% Off Your First Order" / "Join for new drops, pre-order alerts and members-only deals." / code WELCOME10, shown after 12 seconds.

**Admin login:** create one admin account using an email and password that I set in the environment settings.

## What I want at the end

- The live website on Vercel and the backend on Render, both working together.
- Simple instructions for: running it on my computer, deploying it, logging in as admin, adding products and processing orders.
