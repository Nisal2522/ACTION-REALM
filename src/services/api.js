// Store operations built on top of the demo backend (services/db.js).
import { SITE } from '../config/site';
import { db, useCollection } from './db';
import { getProduct, isPreorder } from '../data/products';

export const ORDER_STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

// ── Coupons ─────────────────────────────────────────────────────────────────
export function checkCoupon(code, subtotal) {
  const coupon = db.all('coupons').find((c) => c.active && c.code.toUpperCase() === code.trim().toUpperCase());
  if (!coupon) return { error: 'This code is not valid.' };
  if (subtotal < (coupon.minSubtotal || 0)) {
    return { error: `Add Rs. ${(coupon.minSubtotal - subtotal).toLocaleString('en-LK')} more to use this code.` };
  }
  const discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
  return { coupon, discount };
}

// ── Order maths (shared by cart drawer and checkout) ────────────────────────
export function priceOrder(cartItems, { couponCode = '', coinsToUse = 0 } = {}) {
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const couponResult = couponCode ? checkCoupon(couponCode, subtotal) : null;
  const discount = couponResult?.discount || 0;
  const coinsDiscount = Math.min(coinsToUse * SITE.coinValue, Math.max(0, subtotal - discount));
  const total = Math.max(0, subtotal - discount - coinsDiscount);

  // Pre-order items: only the deposit is due now. Discounts come off the amount due now first.
  const preorderValue = cartItems.filter((i) => isPreorder(i.product)).reduce((s, i) => s + i.product.price * i.qty, 0);
  const payLaterRaw = Math.round(preorderValue * (1 - SITE.depositRate));
  const payLater = Math.min(payLaterRaw, total);
  const payNow = total - payLater;

  return {
    subtotal,
    discount,
    couponError: couponResult?.error || null,
    coupon: couponResult?.coupon || null,
    coinsUsed: Math.ceil(coinsDiscount / SITE.coinValue),
    coinsDiscount,
    total,
    payNow,
    payLater,
    hasPreorder: preorderValue > 0,
    coinsEarned: Math.floor(total * SITE.coinsRate),
  };
}

// ── Orders ──────────────────────────────────────────────────────────────────
export function nextOrderId() {
  const highest = Math.max(10000, ...db.all('orders').map((o) => Number(String(o.id).replace(/\D/g, '')) || 0));
  return `AR${highest + 1}`;
}

export function createOrder({ cartItems, pricing, customer, address, payment, userId, orderId }) {
  const number = orderId || nextOrderId();
  const now = new Date().toISOString();
  const order = db.insert('orders', {
    id: number,
    userId: userId || null,
    items: cartItems.map(({ product, qty }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      qty,
      preorder: isPreorder(product),
      eta: product.eta,
    })),
    ...pricing,
    couponCode: pricing.coupon?.code || null,
    coupon: undefined,
    customer,
    address,
    payment,
    status: 'Placed',
    history: [{ status: 'Placed', at: now }],
  });

  // Reduce stock for in-stock items.
  cartItems.forEach(({ product, qty }) => {
    if (!isPreorder(product)) db.update('products', product.id, (p) => ({ stock: Math.max(0, p.stock - qty) }));
  });

  // Loyalty coins.
  if (userId) {
    db.update('users', userId, (u) => ({
      coins: Math.max(0, (u.coins || 0) - pricing.coinsUsed + pricing.coinsEarned),
      addresses: saveAddress(u.addresses || [], address),
    }));
  }
  return order;
}

function saveAddress(list, address) {
  const key = (a) => `${a.line}|${a.city}|${a.district}`.toLowerCase();
  return [address, ...list.filter((a) => key(a) !== key(address))].slice(0, 3);
}

export function setOrderStatus(orderId, status) {
  return db.update('orders', orderId, (o) => ({ status, history: [...o.history, { status, at: new Date().toISOString() }] }));
}

export function findOrder(number, phone) {
  const clean = (s) => s.replace(/[\s-]/g, '').replace(/^\+94/, '0');
  const order = db.get('orders', number.trim().toUpperCase());
  return order && clean(order.customer.phone) === clean(phone) ? order : null;
}

// ── Reviews ─────────────────────────────────────────────────────────────────
export const useReviews = () => useCollection('reviews');

export function ratingFor(reviews, productId) {
  const list = reviews.filter((r) => r.productId === productId);
  if (!list.length) return { average: 0, count: 0, list };
  const average = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average, count: list.length, list: [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

export function addReview(review) {
  return db.insert('reviews', { ...review, verified: false });
}

// ── Sign-ups & messages ─────────────────────────────────────────────────────
export function subscribeNewsletter(email) {
  const exists = db.all('subscribers').some((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!exists) db.insert('subscribers', { email });
  return !exists;
}

export function requestRestockAlert(productId, contact) {
  const product = getProduct(productId);
  return db.insert('notifyRequests', { productId, productName: product?.name, contact });
}

export function sendMessage(message) {
  return db.insert('messages', { ...message, read: false });
}
