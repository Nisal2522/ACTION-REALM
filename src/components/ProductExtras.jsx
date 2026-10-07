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

  const bundle = [product, ...partners.filter((p) => selected.has(p.id))];
  const total = bundle.reduce((s, p) => s + p.price, 0);
  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <section className="section container">
      <div className="section-head"><h2>Frequently Bought Together</h2></div>
      <div className="fbt">
        <div className="fbt-items">
          {[product, ...partners].map((p, i) => (
            <div key={p.id} className="fbt-item-wrap">
              {i > 0 && <span className="fbt-plus">+</span>}
              <label className={`fbt-item ${i === 0 || selected.has(p.id) ? 'on' : ''}`}>
                <span className="fbt-img"><ProductImage product={p} /></span>
                <span className="fbt-name">
                  <input type="checkbox" checked={i === 0 || selected.has(p.id)} disabled={i === 0} onChange={() => toggle(p.id)} />
                  {i === 0 ? 'This item: ' : ''}{p.name}
                </span>
                <span className="price small">{formatPrice(p.price)}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="fbt-total">
          <span className="muted">Total for {bundle.length} items</span>
          <strong>{formatPrice(total)}</strong>
          <button
            className="btn"
            onClick={() => bundle.forEach((p, i) => addToCart(p.id, 1, { open: i === bundle.length - 1 }))}
          >
            <PlusIcon width={16} height={16} /> Add {bundle.length} to Cart
          </button>
        </div>
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

  const breakdown = [5, 4, 3, 2, 1].map((n) => ({ n, c: list.filter((r) => r.rating === n).length }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.rating) return setError('Please choose a star rating.');
    addReview({ productId: product.id, ...form, name: form.name.trim(), userId: user?.id || null });
    setSent(true);
    setWriting(false);
    setForm({ name: user?.name || '', rating: 0, title: '', text: '' });
  };

  return (
    <section className="section container reviews" id="reviews">
      <div className="section-head"><h2>Customer Reviews</h2></div>
      <div className="reviews-layout">
        <div className="reviews-summary">
          <div className="big-rating">{count ? average.toFixed(1) : '–'}</div>
          <Stars value={average} size={20} />
          <p className="muted small">{count ? `Based on ${count} review${count > 1 ? 's' : ''}` : 'No reviews yet'}</p>
          {count > 0 && (
            <div className="bars">
              {breakdown.map(({ n, c }) => (
                <div key={n} className="bar-row">
                  <span>{n}★</span>
                  <span className="bar"><span style={{ width: `${(c / count) * 100}%` }} /></span>
                  <span className="muted small">{c}</span>
                </div>
              ))}
            </div>
          )}
          {sent && <p className="notice notice-ok"><CheckIcon width={14} height={14} /> Thanks! Your review is posted.</p>}
          {!writing && <button className="btn btn-outline btn-block" onClick={() => { setWriting(true); setSent(false); }}>Write a Review</button>}
        </div>

        <div>
          {writing && (
            <form className="review-form stack" onSubmit={submit}>
              <h3>Your review</h3>
              <Stars value={form.rating} size={28} onChange={(rating) => { setForm({ ...form, rating }); setError(''); }} />
              {error && <p className="error">{error}</p>}
              <input className="input" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" required placeholder="Review title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className="input" required rows="4" placeholder="What did you like or dislike?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <div className="row-gap">
                <button className="btn">Submit Review</button>
                <button type="button" className="btn btn-outline" onClick={() => setWriting(false)}>Cancel</button>
              </div>
            </form>
          )}
          {list.map((r) => (
            <article key={r.id} className="review">
              <div className="review-head">
                <Stars value={r.rating} size={14} />
                <strong>{r.title}</strong>
              </div>
              <p>{r.text}</p>
              <p className="muted small">
                {r.name}{r.verified && <span className="verified"> · ✓ Verified buyer</span>} · {new Date(r.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </article>
          ))}
          {!count && !writing && <p className="muted">Be the first to review this product.</p>}
        </div>
      </div>
    </section>
  );
}

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
