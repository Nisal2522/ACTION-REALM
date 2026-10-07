// Google Analytics 4 + Meta Pixel. Does nothing until IDs are set in SITE.analytics.
import { SITE } from '../config/site';

const { gaId, metaPixelId } = SITE.analytics;
let started = false;

function addScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function initAnalytics() {
  if (started || typeof window === 'undefined') return;
  started = true;

  if (gaId) {
    addScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId, { send_page_view: false });
  }

  if (metaPixelId) {
    /* Standard Meta Pixel bootstrap */
    const fbq = function fbq() {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); // eslint-disable-line prefer-rest-params
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = window._fbq = fbq;
    addScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', metaPixelId);
  }
}

export function trackPageView(path) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href });
  window.fbq?.('track', 'PageView');
}

// Ecommerce events: add_to_cart, begin_checkout, purchase…
const PIXEL_EVENTS = { add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', view_item: 'ViewContent' };

export function track(event, { value, items = [] } = {}) {
  window.gtag?.('event', event, {
    currency: 'LKR',
    value,
    items: items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.qty || 1 })),
  });
  if (PIXEL_EVENTS[event]) {
    window.fbq?.('track', PIXEL_EVENTS[event], { currency: 'LKR', value, content_ids: items.map((i) => String(i.id)), content_type: 'product' });
  }
}
