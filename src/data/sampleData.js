// Realistic sample orders, customers and inbox items so every admin page and the dashboard
// have something to show. Loaded once automatically; Admin → Settings → Data can load it again.
import { SITE } from '../config/site';
import { ORDER_STATUSES } from '../services/api';
import { db } from '../services/db';
import { getProducts } from './products';

const FLAG = 'ar_sample_loaded_v1';
const DAY = 864e5;
const CUSTOMER_PASSWORD_HASH = '22bb2fb1d07f439ec9525e1b75231346afd8a7f9e0903d972e4b69e7e87e20b4'; // "customer123"

const CUSTOMERS = [
  { name: 'Kasun Perera', email: 'kasun.perera@gmail.com', phone: '0771234501', line: '42 Galle Road', city: 'Colombo 03', district: 'Colombo' },
  { name: 'Dilini Rathnayake', email: 'dilini.r@yahoo.com', phone: '0712345602', line: '15 Peradeniya Road', city: 'Kandy', district: 'Kandy' },
  { name: 'Ashan Wickramasinghe', email: 'ashanw@gmail.com', phone: '0759876503', line: '8 Lighthouse Street', city: 'Galle', district: 'Galle' },
  { name: 'Nethmi Silva', email: 'nethmi.silva@outlook.com', phone: '0764455604', line: '21 Lewis Place', city: 'Negombo', district: 'Gampaha' },
  { name: 'Ravindu Dissanayake', email: 'ravindu.d@gmail.com', phone: '0703322105', line: '3 Dambulla Road', city: 'Kurunegala', district: 'Kurunegala' },
  { name: 'Sahan Kumara', email: 'sahan.k@gmail.com', phone: '0778899006', line: '110 High Level Road', city: 'Maharagama', district: 'Colombo' },
  { name: 'Tharushi Fernando', email: 'tharushi.f@gmail.com', phone: '0726677807', line: '56 Station Road', city: 'Matara', district: 'Matara' },
  { name: 'Chamara Jayasinghe', email: 'chamaraj@gmail.com', phone: '0745566708', line: '9 Temple Road', city: 'Jaffna', district: 'Jaffna' },
];
const GUESTS = [
  { name: 'Isuru Bandara', email: 'isuru.b@gmail.com', phone: '0761112209', line: '77 Main Street', city: 'Ratnapura', district: 'Ratnapura' },
  { name: 'Malsha Herath', email: 'malsha.h@gmail.com', phone: '0719988710', line: '12 Lake Road', city: 'Anuradhapura', district: 'Anuradhapura' },
];

// Small seeded random generator so the sample data is the same every time.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildOrders(products, users) {
  const rand = rng(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const now = Date.now();
  const inStock = products.filter((p) => p.status === 'instock');
  const preorders = products.filter((p) => p.status === 'preorder');
  const orders = [];

  for (let n = 0; n < 42; n += 1) {
    // More orders recently: ages skewed towards 0 days, spread over 90 days.
    const ageDays = Math.floor(rand() ** 1.6 * 90);
    const created = new Date(now - ageDays * DAY - Math.floor(rand() * 10) * 36e5);
    const isGuest = rand() < 0.2;
    const user = isGuest ? null : pick(users);
    const person = user ? CUSTOMERS.find((c) => c.email === user.email) : pick(GUESTS);

    // Status by age.
    let status;
    if (ageDays <= 1) status = 'Placed';
    else if (ageDays <= 3) status = pick(['Placed', 'Confirmed']);
    else if (ageDays <= 6) status = pick(['Dispatched', 'In Transit']);
    else if (ageDays <= 10) status = pick(['Arrived', 'Customs', 'Received', 'Out for Delivery']);
    else status = rand() < 0.08 ? 'Cancelled' : 'Delivered';

    const items = [];
    const itemCount = rand() < 0.7 ? 1 : 2;
    for (let k = 0; k < itemCount; k += 1) {
      const pool = ['Placed', 'Confirmed'].includes(status) && rand() < 0.25 ? preorders : inStock;
      const p = pick(pool);
      if (items.some((i) => i.id === p.id)) continue;
      items.push({ id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, qty: rand() < 0.85 ? 1 : 2, preorder: p.status === 'preorder', eta: p.eta });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const couponCode = rand() < 0.15 ? 'WELCOME10' : null;
    const discount = couponCode ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    const preValue = items.filter((i) => i.preorder).reduce((s, i) => s + i.price * i.qty, 0);
    const payLater = Math.min(Math.round(preValue * (1 - SITE.depositRate)), total);
    const hasPreorder = preValue > 0;

    const method = hasPreorder ? pick(['card', 'bank']) : pick(['card', 'card', 'bank', 'cod']);
    const settled = ORDER_STATUSES.indexOf(status) >= ORDER_STATUSES.indexOf('Dispatched') && status !== 'Cancelled';
    const paymentStatus = status === 'Cancelled' ? 'Refunded'
      : method === 'card' ? 'Paid'
        : method === 'bank' ? (settled || rand() < 0.5 ? 'Paid' : 'Awaiting transfer')
          : status === 'Delivered' ? 'Paid' : 'Pay on delivery';

    const steps = status === 'Cancelled' ? ['Placed', 'Cancelled'] : ORDER_STATUSES.slice(0, ORDER_STATUSES.indexOf(status) + 1);
    const gap = Math.min(1.1 * DAY, (now - created.getTime()) / steps.length);
    const history = steps.map((s, i) => ({ status: s, at: new Date(created.getTime() + i * gap).toISOString() }));

    orders.push({
      createdAt: created.toISOString(),
      userId: user?.id || null,
      items,
      subtotal,
      discount,
      couponError: null,
      couponCode,
      coinsUsed: 0,
      coinsDiscount: 0,
      shipping: 0,
      total,
      payNow: total - payLater,
      payLater,
      hasPreorder,
      coinsEarned: Math.floor(total * SITE.coinsRate),
      customer: { name: person.name, email: person.email, phone: person.phone },
      address: { line: person.line, city: person.city, district: person.district, postal: '' },
      payment: { method, status: paymentStatus },
      status,
      history,
      trackingNumber: settled ? `PRO${String(1000000 + Math.floor(rand() * 8999999))}` : '',
    });
  }

  // Oldest first, numbered AR10001…
  return orders
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((o, i) => ({ id: `AR${10001 + i}`, ...o }));
}

export function loadSampleData() {
  const now = Date.now();
  const products = getProducts();

  // Customer accounts (keep any real ones).
  const existing = db.all('users');
  const users = CUSTOMERS.map((c, i) => existing.find((u) => u.email === c.email) || {
    id: `cust${i + 1}`,
    name: c.name,
    email: c.email,
    phone: c.phone,
    role: 'customer',
    coins: 0,
    addresses: [{ line: c.line, city: c.city, district: c.district, postal: '' }],
    passwordHash: CUSTOMER_PASSWORD_HASH,
    createdAt: new Date(now - (100 - i * 11) * DAY).toISOString(),
  });
  const orders = buildOrders(products, users);
  // Coins = 1% of each customer's non-cancelled orders.
  users.forEach((u) => {
    u.coins = orders.filter((o) => o.userId === u.id && o.status !== 'Cancelled').reduce((s, o) => s + o.coinsEarned, 0); // eslint-disable-line no-param-reassign
  });
  db.replaceAll('users', [...existing.filter((u) => !users.some((x) => x.id === u.id)), ...users]);
  db.replaceAll('orders', orders);

  const ago = (d) => new Date(now - d * DAY).toISOString();
  db.replaceAll('messages', [
    { id: 'm1', name: 'Sahan Kumara', email: 'sahan.k@gmail.com', phone: '0778899006', message: 'Hi, when will the Darth Vader 1/6 figure arrive? I paid the deposit last month.', read: false, createdAt: ago(0.3) },
    { id: 'm2', name: 'Dilini Rathnayake', email: 'dilini.r@yahoo.com', phone: '', message: 'Do you have more Demon Slayer figures coming? Looking for Zenitsu and Nezuko.', read: false, createdAt: ago(1.2) },
    { id: 'm3', name: 'Isuru Bandara', email: 'isuru.b@gmail.com', phone: '0761112209', message: 'Can I pick up my order from the Kandy store instead of delivery?', read: true, createdAt: ago(4) },
  ]);
  db.replaceAll('subscribers', [
    'kasun.perera@gmail.com', 'nethmi.silva@outlook.com', 'tharushi.f@gmail.com', 'collector.lk@gmail.com', 'funko.fan94@gmail.com', 'malsha.h@gmail.com',
  ].map((email, i) => ({ id: `s${i + 1}`, email, createdAt: ago(60 - i * 9) })));
  const name = (id) => products.find((p) => p.id === id)?.name || 'Product';
  db.replaceAll('notifyRequests', [
    { id: 'n1', productId: 12, productName: name(12), contact: '0771234501', createdAt: ago(2) },
    { id: 'n2', productId: 21, productName: name(21), contact: 'chamaraj@gmail.com', createdAt: ago(5) },
    { id: 'n3', productId: 21, productName: name(21), contact: '0726677807', createdAt: ago(9) },
  ]);

  try {
    localStorage.setItem(FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}

// Load the sample data the first time the site runs (only if there are no orders yet).
export function ensureSampleData() {
  try {
    if (localStorage.getItem(FLAG)) return;
  } catch {
    return;
  }
  if (db.all('orders').length === 0) loadSampleData();
  else localStorage.setItem(FLAG, '1');
}
