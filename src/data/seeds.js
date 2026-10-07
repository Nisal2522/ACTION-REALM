// Starting data for the demo backend. Loaded once; after that, changes are kept in the browser.
// Admin → Settings → "Reset demo data" restores these.
import { registerSeed } from '../services/db';

const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString();

// Demo admin login: admin@actionrealm.lk / admin123 — change it after logging in.
registerSeed('users', () => [
  {
    id: 'admin',
    name: 'Store Admin',
    email: 'admin@actionrealm.lk',
    phone: '0771234567',
    role: 'admin',
    coins: 0,
    addresses: [],
    passwordHash: '7391ee33d295b41bfcd27b4427f94c3f69f06f6d6320aee0fa9bcc4c361f4637',
    createdAt: daysAgo(120),
  },
]);

registerSeed('coupons', () => [
  { id: 'c1', code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, active: true, note: 'Newsletter welcome offer' },
  { id: 'c2', code: 'REALM2000', type: 'fixed', value: 2000, minSubtotal: 30000, active: true, note: 'Rs. 2,000 off orders over Rs. 30,000' },
]);

const r = (id, productId, name, rating, title, text, days) => ({
  id, productId, name, rating, title, text, verified: true, createdAt: daysAgo(days),
});

// Sample reviews — delete them from Admin → Reviews before launch.
registerSeed('reviews', () => [
  r('r1', 1, 'Kasun P.', 5, 'Absolute masterpiece', 'The paint work and light-up features are unreal. Packaging was perfect.', 12),
  r('r2', 1, 'Tharindu M.', 4, 'Worth the wait', 'Amazing figure, just wish the stand was a bit bigger.', 30),
  r('r3', 3, 'Dilini R.', 5, 'Great for the price', 'Super articulated and comes with lots of hands.', 8),
  r('r4', 4, 'Ashan W.', 5, 'Best Naruto figure', 'Sage mode details are perfect. Fast delivery to Galle.', 5),
  r('r5', 10, 'Ravindu D.', 5, 'Boy!', 'The Leviathan Axe accessory alone is worth it.', 20),
  r('r6', 2, 'Nethmi S.', 5, 'Stunning statue', 'Heavy, solid and the cape sculpt is incredible.', 40),
  r('r7', 6, 'Chamara J.', 4, 'Classic', 'Great metallic paint. Hips are a little loose.', 15),
  r('r8', 22, 'Sahan K.', 5, 'Cute and funny', 'Box arrived mint, perfect for my Pop shelf.', 3),
]);

['orders', 'subscribers', 'notifyRequests', 'messages'].forEach((c) => registerSeed(c, () => []));
