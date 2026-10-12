import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { getBrands, useProducts } from '../data/products';
import { CardIcon, HeartHandIcon, PinIcon, ShieldIcon, StoreIcon, TruckIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';

// Everything on this page is edited in Admin → Pages → About Us.
export const VALUE_ICONS = { shield: ShieldIcon, store: StoreIcon, truck: TruckIcon, heart: HeartHandIcon, card: CardIcon };
const lines = (text = '') => text.split('\n').map((l, i, all) => <Fragment key={i}>{l}{i < all.length - 1 && <br />}</Fragment>);

export default function About() {
  useTitle('About Us');
  const products = useProducts();
  const a = SITE.about;
  const story = (a.storyText || '').split(/\n\s*\n/).filter(Boolean);

  const stats = [
    { value: `${products.length}+`, label: 'Collectibles' },
    { value: `${getBrands(products).length}+`, label: 'Brands' },
    { value: '25', label: 'Districts delivered' },
    { value: SITE.stores.length, label: SITE.stores.length === 1 ? 'Store' : 'Stores' },
  ];

  return (
    <div className="about">
      <section className="about-hero" style={{ '--about-img': a.heroImage ? `url(${a.heroImage})` : 'none' }}>
        <div className="container about-hero-inner">
          {a.heroLabel && <span className="eyebrow">{a.heroLabel}</span>}
          <h1>{lines(a.heroTitle)}</h1>
          {a.heroText && <p>{a.heroText}</p>}
        </div>
      </section>

      <section className="container about-story">
        <div className="about-story-text">
          {a.storyLabel && <span className="about-kicker">{a.storyLabel}</span>}
          <h2>{a.storyTitle}</h2>
          {story.map((para, i) => <p key={i}>{para}</p>)}
          {a.storyButton && <Link to="/collections/all" className="btn">{a.storyButton}</Link>}
        </div>
        {(a.storyImage1 || a.storyImage2) && (
          <div className="about-collage" aria-hidden="true">
            {a.storyImage1 && <img src={a.storyImage1} alt="" loading="lazy" />}
            {a.storyImage2 && <img src={a.storyImage2} alt="" loading="lazy" />}
          </div>
        )}
      </section>

      {a.showStats && (
        <section className="about-stats">
          <div className="container about-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="about-stat"><strong>{s.value}</strong><span>{s.label}</span></div>
            ))}
          </div>
        </section>
      )}

      {a.values?.length > 0 && (
        <section className="container section">
          <div className="about-center-head"><h2>{a.valuesTitle}</h2></div>
          <div className="about-values">
            {a.values.map((v, i) => {
              const Icon = VALUE_ICONS[v.icon] || ShieldIcon;
              return (
                <div key={i} className="about-value">
                  <span className="about-value-icon"><Icon width={24} height={24} /></span>
                  <h3>{v.title}</h3>
                  <p className="muted">{v.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {a.showStores && SITE.stores.length > 0 && (
        <section className="container section">
          <div className="about-center-head"><h2>{a.storesTitle}</h2></div>
          <div className="about-stores">
            {SITE.stores.map((s) => (
              <div key={s.city} className="about-store">
                <span className="about-value-icon"><PinIcon width={22} height={22} /></span>
                <div>
                  <h3>{s.city}</h3>
                  <p className="muted">{s.address}<br />Open {s.hours}</p>
                  <a href={s.map} target="_blank" rel="noreferrer" className="link">Get directions →</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {a.ctaTitle && (
        <section className="container">
          <div className="about-cta">
            <div>
              <h2>{a.ctaTitle}</h2>
              {a.ctaText && <p>{a.ctaText}</p>}
            </div>
            <div className="about-cta-actions">
              <Link to="/collections/all" className="btn btn-lg about-cta-primary">Shop now</Link>
              <Link to="/contact" className="btn btn-lg btn-outline about-cta-secondary">Contact us</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
