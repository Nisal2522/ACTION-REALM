import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../config/site';
import { isAvailableNow, useProducts } from '../data/products';
import { addReview, ratingFor, useReviews } from '../services/api';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from './ProductImage';
import { Modal, Stars } from './ui';
import { CheckIcon, PlusIcon, ZoomIcon } from './Icons';

// Main product photo: hover to zoom (desktop), tap/click for full-screen view.
export function ZoomImage({ product }) {
  const [origin, setOrigin] = useState(null);
  const [lightbox, setLightbox] = useState(false);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <>
      <button
        type="button"
        className={`gallery-main zoomable ${origin ? 'zooming' : ''}`}
        style={origin ? { '--zoom-origin': origin } : undefined}
        onMouseMove={onMove}
        onMouseLeave={() => setOrigin(null)}
        onClick={() => setLightbox(true)}
        aria-label="Open full-size image"
      >
        <ProductImage product={product} eager />
        <span className="zoom-hint"><ZoomIcon width={16} height={16} /> Click to enlarge</span>
      </button>
      <Modal open={lightbox} onClose={() => setLightbox(false)} title={product.name} className="lightbox">
        <div className="lightbox-img"><ProductImage product={product} eager /></div>
      </Modal>
    </>
  );
}

// Two related, in-stock items bundled with this product.
export function BoughtTogether({ product }) {
  const products = useProducts();
  const { addToCart } = useStore();
  const partners = products
    .filter((p) => p.id !== product.id && isAvailableNow(p) && (p.franchise === product.franchise || p.brand === product.brand))
    .sort((a, b) => a.price - b.price)
    .slice(0, 2);
  const [selected, setSelected] = useState(() => new Set(partners.map((p) => p.id)));
  if (!partners.length) return null;

  const all = [product, ...partners];
  const bundle = all.filter((p, i) => i === 0 || selected.has(p.id));
  const total = bundle.reduce((s, p) => s + p.price, 0);
  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <section className="section container">
      <div className="section-head"><h2>Frequently Bought Together</h2></div>
      <div className="fbt2">
        <div className="fbt2-items">
          {all.map((p, i) => {
            const on = i === 0 || selected.has(p.id);
            return (
              <div key={p.id} className="fbt2-step">
                {i > 0 && <span className="fbt2-plus" aria-hidden="true"><PlusIcon width={16} height={16} /></span>}
                <button
                  type="button"
                  className={`fbt2-tile ${on ? 'on' : ''} ${i === 0 ? 'main' : ''}`}
                  onClick={() => i > 0 && toggle(p.id)}
                  aria-pressed={on}
                  aria-label={i === 0 ? `${p.name} (this item)` : `${on ? 'Remove' : 'Add'} ${p.name}`}
                  disabled={i === 0}
                >
                  <span className="fbt2-img">
                    <ProductImage product={p} />
                    {i === 0 && <span className="fbt2-this">This item</span>}
                    <span className="fbt2-check">{on && <CheckIcon width={13} height={13} />}</span>
                  </span>
                  <span className="fbt2-info">
                    <span className="fbt2-brand">{p.brand}</span>
                    <span className="fbt2-name">{p.name}</span>
                    <span className="fbt2-price">{formatPrice(p.price)}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <aside className="fbt2-summary">
          <span className="fbt2-sum-label">Your bundle</span>
          <ul className="fbt2-lines">
            {bundle.map((p) => (
              <li key={p.id}><span>{p.name}</span><strong>{formatPrice(p.price)}</strong></li>
            ))}
          </ul>
          <div className="fbt2-total">
            <span>Total for {bundle.length} {bundle.length === 1 ? 'item' : 'items'}</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button
            className="fbt2-btn"
            onClick={() => bundle.forEach((p, i) => addToCart(p.id, 1, { open: i === bundle.length - 1 }))}
          >
            <PlusIcon width={16} height={16} /> Add {bundle.length} to cart
          </button>
          <span className="fbt2-note">Tap an item to add or remove it</span>
        </aside>
      </div>
    </section>
  );
}

export function Reviews({ product }) {
  const reviews = useReviews();
  const { user } = useAuth();
  const { average, count, list } = ratingFor(reviews, product.id);
  const [form, setForm] = useState({ name: user?.name || '', rating: 0, title: '', text: '' });
  const [writing, setWriting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('newest');
  const [stars, setStars] = useState(0); // 0 = all

  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((r) => r.rating === n).length }));
  const shown = list
    .filter((r) => !stars || r.rating === stars)
    .sort((a, b) => (sort === 'high' ? b.rating - a.rating : sort === 'low' ? a.rating - b.rating : 0) || b.createdAt.localeCompare(a.createdAt));
  const recommend = count ? Math.round((list.filter((r) => r.rating >= 4).length / count) * 100) : 0;

  const open = () => { setWriting(true); setSent(false); setError(''); };
  const submit = (e) => {
    e.preventDefault();
    if (!form.rating) return setError('Please choose a star rating.');
    addReview({ productId: product.id, ...form, name: form.name.trim(), userId: user?.id || null });
    setSent(true);
    setWriting(false);
    setForm({ name: user?.name || '', rating: 0, title: '', text: '' });
  };
  const initials = (name = '') => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <section className="section container" id="reviews">
      <div className="section-head"><h2>Customer Reviews</h2></div>
      <div className="rv">
        <aside className="rv-summary">
          <div className="rv-score">
            <strong>{count ? average.toFixed(1) : '0.0'}</strong>
            <div>
              <Stars value={average} size={18} />
              <span className="muted small">{count ? `${count} review${count > 1 ? 's' : ''}` : 'No reviews yet'}</span>
            </div>
          </div>
          {count > 0 && <p className="rv-recommend"><CheckIcon width={14} height={14} /> {recommend}% of buyers rate it 4 stars or more</p>}
          <div className="rv-bars">
            {breakdown.map(({ n, c }) => (
              <button key={n} type="button" className={`rv-bar-row ${stars === n ? 'active' : ''}`} onClick={() => setStars(stars === n ? 0 : n)} disabled={!c} aria-label={`Show ${n} star reviews`}>
                <span>{n} ★</span>
                <span className="rv-bar"><span style={{ width: count ? `${(c / count) * 100}%` : 0 }} /></span>
                <span className="muted small">{count ? `${Math.round((c / count) * 100)}%` : '0%'}</span>
              </button>
            ))}
          </div>
          <button className="rv-write" onClick={open}><EditPenIcon /> Write a review</button>
          {sent && <p className="notice notice-ok no-margin"><CheckIcon width={14} height={14} /> Thanks! Your review is posted.</p>}
        </aside>

        <div className="rv-main">
          {count > 0 && (
            <div className="rv-toolbar">
              <div className="rv-chips">
                <button className={!stars ? 'active' : ''} onClick={() => setStars(0)}>All ({count})</button>
                {breakdown.filter((b) => b.c).map(({ n, c }) => (
                  <button key={n} className={stars === n ? 'active' : ''} onClick={() => setStars(n)}>{n} ★ ({c})</button>
                ))}
              </div>
              <select className="input rv-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort reviews">
                <option value="newest">Newest first</option>
                <option value="high">Highest rated</option>
                <option value="low">Lowest rated</option>
              </select>
            </div>
          )}

          {writing && (
            <form className="rv-form" onSubmit={submit}>
              <div className="rv-form-head">
                <h3>Share your experience</h3>
                <span className="muted small">How would you rate {product.name}?</span>
              </div>
              <Stars value={form.rating} size={30} onChange={(rating) => { setForm({ ...form, rating }); setError(''); }} />
              {error && <p className="error">{error}</p>}
              <div className="field-row">
                <input className="input" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input" required placeholder="Review title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <textarea className="input" required rows="4" placeholder="What did you like or dislike? How was the paint, packaging and delivery?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <div className="row-gap">
                <button className="rv-write inline">Submit review</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setWriting(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="rv-grid">
            {shown.map((r) => (
              <article key={r.id} className="rv-card">
                <header className="rv-card-head">
                  <span className="rv-avatar">{initials(r.name)}</span>
                  <span className="rv-who">
                    <strong>{r.name}</strong>
                    <span className="muted small">{new Date(r.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>
                  {r.verified && <span className="rv-verified"><CheckIcon width={12} height={12} /> Verified buyer</span>}
                </header>
                <Stars value={r.rating} size={15} />
                <h4>{r.title}</h4>
                <p>{r.text}</p>
              </article>
            ))}

            {!writing && shown.length < 4 && (
              <button type="button" className="rv-card rv-invite" onClick={open}>
                <span className="rv-invite-icon"><EditPenIcon /></span>
                <strong>{count ? 'Own this figure?' : 'Be the first to review'}</strong>
                <span className="muted small">Tell other collectors about the detail, paint and packaging.</span>
                <span className="rv-invite-link">Write a review →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const EditPenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" />
  </svg>
);

// Mobile-only bar that appears once the main Add To Cart button scrolls out of view.
export function StickyBuyBar({ product, visible, onAdd, label }) {
  return (
    <div className={`sticky-buy ${visible ? 'show' : ''}`} aria-hidden={!visible}>
      <span className="sticky-img"><ProductImage product={product} /></span>
      <span className="sticky-info">
        <span className="line-title">{product.name}</span>
        <span className="price small">{formatPrice(product.price)}</span>
      </span>
      <button className="btn btn-sm" onClick={onAdd} tabIndex={visible ? 0 : -1}><PlusIcon width={14} height={14} /> {label}</button>
    </div>
  );
}

export const reviewsLink = (count) => (count ? <Link to="#reviews" className="link small" onClick={(e) => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }); }}>{count} review{count > 1 ? 's' : ''}</Link> : null);
