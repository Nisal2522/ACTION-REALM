// PayHere (Sri Lanka) card payments — https://support.payhere.lk/api-&-mobile-sdk/javascript-sdk
//
// Going live needs two things in SITE.payhere:
//   1. merchantId   — from your PayHere account
//   2. hashEndpoint — a small server URL that returns { hash } for { order_id, amount, currency }.
//      The hash = UPPER(MD5(merchant_id + order_id + amount + currency + UPPER(MD5(merchant_secret)))).
//      It MUST be computed on a server, because the merchant secret can never be in website code.
//
// Until both are set, isPayHereLive() is false and checkout shows a simulated payment screen.
import { SITE } from '../config/site';

export const isPayHereLive = () => Boolean(SITE.payhere.merchantId && SITE.payhere.hashEndpoint);

function loadSdk() {
  if (window.payhere) return Promise.resolve(window.payhere);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.payhere.lk/lib/payhere.js';
    s.onload = () => resolve(window.payhere);
    s.onerror = () => reject(new Error('Could not load PayHere. Check your internet connection.'));
    document.head.appendChild(s);
  });
}

// Resolves 'paid' | 'dismissed', rejects on error.
export async function payWithPayHere({ orderId, amount, customer, address, items }) {
  const payhere = await loadSdk();
  const amountStr = amount.toFixed(2);
  const res = await fetch(SITE.payhere.hashEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId, amount: amountStr, currency: 'LKR' }),
  });
  if (!res.ok) throw new Error('Payment server error. Please try again.');
  const { hash } = await res.json();
  const [firstName, ...rest] = customer.name.split(' ');

  return new Promise((resolve, reject) => {
    payhere.onCompleted = () => resolve('paid');
    payhere.onDismissed = () => resolve('dismissed');
    payhere.onError = (err) => reject(new Error(err));
    payhere.startPayment({
      sandbox: SITE.payhere.sandbox,
      merchant_id: SITE.payhere.merchantId,
      return_url: undefined,
      cancel_url: undefined,
      notify_url: `${SITE.url}/api/payhere-notify`,
      order_id: orderId,
      items,
      amount: amountStr,
      currency: 'LKR',
      hash,
      first_name: firstName,
      last_name: rest.join(' ') || '-',
      email: customer.email,
      phone: customer.phone,
      address: address.line,
      city: address.city,
      country: 'Sri Lanka',
    });
  });
}
