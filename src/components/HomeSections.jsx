import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { getBrands, isAvailableNow, isOnSale, isPreorder, unsplash, useProducts } from '../data/products';
import { collectionUrl } from '../data/collections';
import { CHARACTERS, FAQS, HERO_SLIDES, MARQUEE_BRANDS, TESTIMONIALS } from '../data/content';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import ProductImage from './ProductImage';
import { SaleCountdown } from './ui';
import { CardIcon, ChevronIcon, ShieldIcon, StoreIcon, TruckIcon } from './Icons';

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const n = HERO_SLIDES.length;
  const go = (d) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [i, n, paused]);

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
      {HERO_SLIDES.map((s, idx) => {
        const fade = `linear-gradient(90deg, ${s.colors[1]}ee 0%, ${s.colors[1]}99 45%, transparent 80%)`;
        const fadeMobile = `linear-gradient(0deg, ${s.colors[1]}f2 0%, ${s.colors[1]}aa 45%, ${s.colors[1]}33 100%)`;
        return (
          <div
            key={s.title}
            className={`hero-slide ${idx === i ? 'active' : ''}`}
            style={{
              '--hero-desktop': s.image ? `${fade}, url(${unsplash(s.image, 1920)}) center / cover` : 'none',
              '--hero-mobile': s.image ? `${fadeMobile}, url(${unsplash(s.image, 900)}) center / cover` : 'none',
              '--hero-color': s.colors[1],
              '--hero-glow': s.colors[0],
            }}
            aria-hidden={idx !== i}
          >
            <div className="container hero-content">
              <span className="eyebrow">{s.eyebrow}</span>
              <h1>{s.title}</h1>
              <p>{s.text}</p>
              <Link to={s.to} className="btn btn-lg" tabIndex={idx === i ? 0 : -1}>{s.cta}</Link>
            </div>
          </div>
        );
      })}
      <button className="hero-arrow left" onClick={() => go(-1)} aria-label="Previous slide"><ChevronIcon dir="left" /></button>
      <button className="hero-arrow right" onClick={() => go(1)} aria-label="Next slide"><ChevronIcon dir="right" /></button>
      <div className="hero-dots">
        {HERO_SLIDES.map((s, idx) => (
          <button key={s.title} className={idx === i ? 'active' : ''} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} />
        ))}
      </div>
    </section>
  );
}

export function BrandMarquee() {
  const brands = getBrands(useProducts());
  const list = [...MARQUEE_BRANDS, ...MARQUEE_BRANDS];
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
          const duplicate = idx >= MARQUEE_BRANDS.length; // second copy exists only for the seamless loop
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
  { label: 'In Stock Now', slug: 'in-stock', filter: isAvailableNow },
  { label: 'Pre-Orders', slug: 'pre-orders', filter: isPreorder },
  { label: 'New Arrivals', slug: 'new-arrivals', filter: (p) => p.isNew },
  { label: 'On Sale', slug: 'sale', filter: isOnSale },
];

export function ProductTabs() {
  const products = useProducts();
  const [tab, setTab] = useState(0);
  const items = products.filter(TABS[tab].filter).slice(0, 14);
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

export function ProductRail({ title, products, to }) {
  if (!products.length) return null;
  return (
    <section className="section container">
      <div className="section-head">
        <h2>{title}</h2>
        {to && <Link to={to} className="link">View all →</Link>}
      </div>
      <div className="rail">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
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
  return <ProductRail title="Recently Viewed" products={list} />;
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
  return (
    <section className="section container">
      <div className="section-head"><h2>Shop By Character</h2></div>
      <div className="character-grid">
        {CHARACTERS.map((c) => (
          <Link key={c.name} to={`/collections/all?q=${encodeURIComponent(c.query)}`} className="character">
            <span className="character-img"><img src={unsplash(c.image, 300)} alt="" loading="lazy" /></span>
            <span>{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Perks() {
  const perks = [
    { Icon: TruckIcon, title: 'Free Island-wide Delivery', text: 'Insured delivery to all 25 districts' },
    { Icon: ShieldIcon, title: '100% Authentic', text: 'Officially licensed products' },
    { Icon: CardIcon, title: '0% Installments', text: `On orders above ${formatPrice(SITE.installmentThreshold)}` },
    { Icon: StoreIcon, title: 'Visit Our Stores', text: SITE.stores.map((s) => s.city).join(' & ') },
  ];
  return (
    <section className="perks container">
      {perks.map(({ Icon, title, text }) => (
        <div className="perk" key={title}>
          <Icon width={30} height={30} />
          <div><strong>{title}</strong><p className="muted small">{text}</p></div>
        </div>
      ))}
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="section-head"><h2>What Collectors Say</h2></div>
        <div className="rail">
          {TESTIMONIALS.map((t) => (
            <figure className="quote" key={t.name}>
              <div className="stars" aria-label="5 stars">★★★★★</div>
              <blockquote>“{t.text}”</blockquote>
              <figcaption><strong>{t.name}</strong> · {t.city}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="section container faq">
      <div className="section-head"><h2>Frequently Asked Questions</h2></div>
      {FAQS.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
