import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { getBrands, isAvailableNow, isOnSale, isPreorder, useProducts } from '../data/products';
import { collectionUrl } from '../data/collections';
import { useContent } from '../data/content';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import ShowcaseCard from './ShowcaseCard';
import ProductImage from './ProductImage';
import { SaleCountdown } from './ui';
import { CardIcon, ChevronIcon, ClockIcon, HeartIcon, ShieldIcon, StoreIcon, TagIcon, TruckIcon } from './Icons';

// Unsplash images can be resized by changing their `w` parameter.
const sized = (url, w) => (url && url.includes('images.unsplash.com') ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : url);

export function HeroCarousel() {
  const slides = useContent('heroSlides').filter((s) => s.enabled !== false);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const n = slides.length;
  const go = (d) => setI((x) => (x + d + n) % n);
  const current = n ? i % n : 0;

  useEffect(() => {
    if (paused || n < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [i, n, paused]);

  if (!n) return null;

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
    setPaused(false);
  };

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {slides.map((s, idx) => {
        const base = s.baseColor || '#111111';
        const fade = `linear-gradient(90deg, ${base}ee 0%, ${base}99 45%, transparent 80%)`;
        const fadeMobile = `linear-gradient(0deg, ${base}f2 0%, ${base}aa 45%, ${base}33 100%)`;
        return (
          <div
            key={s.id}
            className={`hero-slide ${idx === current ? 'active' : ''}`}
            style={{
              '--hero-desktop': s.image ? `${fade}, url("${sized(s.image, 1920)}") center / cover` : 'none',
              '--hero-mobile': s.image ? `${fadeMobile}, url("${sized(s.image, 900)}") center / cover` : 'none',
              '--hero-color': base,
              '--hero-glow': s.glowColor || SITE.accentColor,
            }}
            aria-hidden={idx !== current}
          >
            <div className="container hero-content">
              {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
              <h1>{s.title}</h1>
              {s.text && <p>{s.text}</p>}
              {s.cta && <Link to={s.link || '/'} className="btn btn-lg" tabIndex={idx === current ? 0 : -1}>{s.cta}</Link>}
            </div>
          </div>
        );
      })}
      {n > 1 && (
        <>
          <button className="hero-arrow left" onClick={() => go(-1)} aria-label="Previous slide"><ChevronIcon dir="left" /></button>
          <button className="hero-arrow right" onClick={() => go(1)} aria-label="Next slide"><ChevronIcon dir="right" /></button>
          <div className="hero-dots">
            {slides.map((s, idx) => (
              <button key={s.id} className={idx === current ? 'active' : ''} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function BrandMarquee() {
  const strip = useContent('brandStrip');
  const brands = getBrands(useProducts());
  if (!strip.length) return null;
  const list = [...strip, ...strip];
  return (
    <section className="marquee" aria-label="Brands we carry">
      <div className="marquee-track">
        {list.map((b, idx) => {
          const content = (
            <>
              {b.logo ? (
                <img src={b.logo} alt="" className="brand-logo" loading="lazy" />
              ) : (
                <span className="brand-logo brand-initials">{b.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
              )}
              {b.name}
            </>
          );
          const duplicate = idx >= strip.length; // second copy exists only for the seamless loop
          return brands.includes(b.name) ? (
            <Link key={idx} to={collectionUrl(b.name)} className="marquee-item" aria-hidden={duplicate} tabIndex={duplicate ? -1 : 0}>{content}</Link>
          ) : (
            <span key={idx} className="marquee-item" aria-hidden={duplicate}>{content}</span>
          );
        })}
      </div>
    </section>
  );
}

const TABS = [
  { label: 'In Stock', slug: 'in-stock', filter: isAvailableNow },
  { label: 'Pre-Orders', slug: 'pre-orders', filter: isPreorder },
  { label: 'New Arrivals', slug: 'new-arrivals', filter: (p) => p.isNew },
  { label: 'On Sale', slug: 'sale', filter: isOnSale },
];

export function ProductTabs() {
  const products = useProducts();
  const [tab, setTab] = useState(0);
  const items = products.filter(TABS[tab].filter).slice(0, SITE.homeTabCount || 14);
  return (
    <section className="section container">
      <div className="tabs" role="tablist">
        {TABS.map((t, idx) => (
          <button key={t.slug} role="tab" aria-selected={idx === tab} className={idx === tab ? 'active' : ''} onClick={() => setTab(idx)}>
            {t.label}
          </button>
        ))}
      </div>
      {TABS[tab].slug === 'sale' && <div className="center-row"><SaleCountdown /></div>}
      <div className="grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      <div className="center"><Link to={`/collections/${TABS[tab].slug}`} className="btn btn-outline">View All</Link></div>
    </section>
  );
}

// variant: 'default' (standard cards), 'showcase' (image-first) or 'ranked' (numbered chart).
export function ProductRail({ title, products, to, variant = 'default' }) {
  if (!products.length) return null;
  return (
    <section className="section container">
      <div className="section-head">
        <h2>{title}</h2>
        {to && <Link to={to} className="link">View all →</Link>}
      </div>
      <div className={`rail rail-${variant}`}>
        {products.map((p, i) => (variant === 'default'
          ? <ProductCard key={p.id} product={p} />
          : <ShowcaseCard key={p.id} product={p} variant={variant} rank={i + 1} />))}
      </div>
    </section>
  );
}

export function RecentlyViewed({ excludeId }) {
  const { recent } = useStore();
  const products = useProducts();
  const list = recent
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 8);
  if (!list.length) return null;
  if (list.length < 4) {
    const extra = products.filter((p) => p.id !== excludeId && !list.includes(p)).sort((a, b) => Number(b.featured) - Number(a.featured));
    list.push(...extra.slice(0, 4 - list.length));
  }
  return <ProductRail title={SITE.homeTitles.recent} products={list} />;
}

export function CollectionGrid({ title, names }) {
  const products = useProducts();
  return (
    <section className="section container">
      <div className="section-head"><h2>{title}</h2></div>
      <div className="collection-grid">
        {names.map((name) => {
          const inGroup = products.filter((p) => p.category === name || p.franchise === name);
          return (
            <Link key={name} to={collectionUrl(name)} className="collection-card">
              {inGroup[0] && <ProductImage product={inGroup[0]} variant={2} />}
              <div className="collection-label"><strong>{name}</strong><span>{inGroup.length} items</span></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function CharacterGrid() {
  const characters = useContent('characters');
  if (!characters.length) return null;
  return (
    <section className="section container">
      <div className="section-head"><h2>{SITE.homeTitles.characters}</h2></div>
      <div className="character-grid">
        {characters.map((c) => (
          <Link key={c.id} to={`/collections/all?q=${encodeURIComponent(c.query || c.name)}`} className="character">
            <span className="character-img">{c.image && <img src={c.image} alt="" loading="lazy" />}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const PERK_ICONS = { truck: TruckIcon, shield: ShieldIcon, card: CardIcon, store: StoreIcon, tag: TagIcon, clock: ClockIcon, heart: HeartIcon };

export function Perks() {
  const perks = useContent('perks');
  if (!perks.length) return null;
  return (
    <section className="perks container">
      {perks.map((p) => {
        const Icon = PERK_ICONS[p.icon] || TruckIcon;
        return (
          <div className="perk" key={p.id}>
            <Icon width={30} height={30} />
            <div><strong>{p.title}</strong><p className="muted small">{p.text}</p></div>
          </div>
        );
      })}
    </section>
  );
}

export function Testimonials() {
  const list = useContent('testimonials');
  if (!list.length) return null;
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-head"><h2>{SITE.homeTitles.testimonials}</h2></div>
        <div className="rail">
          {list.map((t) => {
            const rating = Number(t.rating) || 5;
            return (
              <figure className="quote" key={t.id}>
                <div className="stars" aria-label={`${rating} stars`}>{'★'.repeat(rating)}<span className="stars-off">{'★'.repeat(5 - rating)}</span></div>
                <blockquote>“{t.text}”</blockquote>
                <figcaption><strong>{t.name}</strong>{t.city && ` · ${t.city}`}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const faqs = useContent('faqs');
  if (!faqs.length) return null;
  return (
    <section className="section container faq">
      <div className="section-head"><h2>{SITE.homeTitles.faq}</h2></div>
      {faqs.map((f) => (
        <details key={f.id}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
