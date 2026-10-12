import { useEffect } from 'react';
import { SITE } from '../config/site';

const siteTitle = () => `${SITE.name.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase())}${SITE.slogan ? ` — ${SITE.slogan}` : ''}`;

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Sets the tab title plus description / Open Graph tags for search engines and share previews.
// Note: WhatsApp/Facebook previews read the HTML before JavaScript runs, so for per-product
// previews in production, pre-render pages (e.g. vite-plugin-ssr / a host with prerendering).
export default function useTitle(title, { description, image } = {}) {
  useEffect(() => {
    const base = siteTitle();
    const full = title ? `${title} | ${base}` : base;
    document.title = full;
    setMeta('name', 'description', description || SITE.description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description || SITE.description);
    setMeta('property', 'og:image', image || `${SITE.url}/logo-512.png`);
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  }, [title, description, image]);
}
