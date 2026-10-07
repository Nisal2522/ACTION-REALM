import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { getProduct, isOnSale, isPreorder, isSoldOut, useProducts } from '../data/products';
import { ratingFor, requestRestockAlert, subscribeNewsletter, useReviews } from '../services/api';
import { useStore } from '../context/StoreContext';
import ProductImage from './ProductImage';
import { Modal, Stars } from './ui';
import { BellIcon, CheckIcon, PlusIcon } from './Icons';

export function QuickView() {
  const { quickViewId, openQuickView, addToCart, openNotify } = useStore();
  useProducts();
  const reviews = useReviews();
  const [qty, setQty] = useState(1);
  const product = quickViewId ? getProduct(quickViewId) : null;

  useEffect(() => {
    setQty(1);
  }, [quickViewId]);

  if (!product) return null;
  const close = () => openQuickView(null);
  const soldOut = isSoldOut(product);
  const { average, count } = ratingFor(reviews, product.id);

  return (
    <Modal open onClose={close} title={product.name} className="quickview">
      <div className="qv-grid">
        <div className="qv-media"><ProductImage product={product} eager /></div>
        <div className="qv-info">
          <p className="card-brand">{product.brand}</p>
          <h2>{product.name}</h2>
          {count > 0 && <Stars value={average} count={count} />}
          <div className="price-row big">
            <span className="price">{formatPrice(product.price)}</span>
            {isOnSale(product) && <span className="compare">{formatPrice(product.compareAt)}</span>}
          </div>
          {isPreorder(product) && (
            <p className="notice notice-pre">Pre-order · Release {product.eta} · Pay {Math.round(SITE.depositRate * 100)}% now</p>
          )}
          <p className="muted qv-desc">{product.description}</p>
          {soldOut ? (
            <button className="btn btn-outline btn-block" onClick={() => { close(); openNotify(product.id); }}>
              <BellIcon width={18} height={18} /> Notify Me
            </button>
          ) : (
            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(5, qty + 1))} aria-label="Increase">+</button>
              </div>
              <button className="btn grow" onClick={() => { addToCart(product.id, qty); close(); }}>
                <PlusIcon width={18} height={18} /> {isPreorder(product) ? 'Pre-Order Now' : 'Add To Cart'}
              </button>
            </div>
          )}
          <Link to={`/products/${product.slug}`} className="link" onClick={close}>View full details →</Link>
        </div>
      </div>
    </Modal>
  );
}

export function NotifyModal() {
  const { notifyId, openNotify } = useStore();
  const [contact, setContact] = useState('');
  const [done, setDone] = useState(false);
  const product = notifyId ? getProduct(notifyId) : null;

  useEffect(() => {
    setContact('');
    setDone(false);
  }, [notifyId]);

  if (!product) return null;
  const submit = (e) => {
    e.preventDefault();
    requestRestockAlert(product.id, contact.trim());
    setDone(true);
  };

  return (
    <Modal open onClose={() => openNotify(null)} title="Back in stock alert" className="small-modal">
      {done ? (
        <div className="center-msg">
          <span className="success-icon"><CheckIcon /></span>
          <h3>You're on the list!</h3>
          <p className="muted">We'll message you at <strong>{contact}</strong> as soon as {product.name} is back.</p>
          <button className="btn" onClick={() => openNotify(null)}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} className="stack">
          <h3>Notify me when it's back</h3>
          <p className="muted">{product.name}</p>
          <input required className="input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or WhatsApp number" />
          <button className="btn btn-block"><BellIcon width={18} height={18} /> Notify Me</button>
        </form>
      )}
    </Modal>
  );
}

const POPUP_KEY = 'ar_newsletter_popup';

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(localStorage.getItem(POPUP_KEY));
    } catch {
      seen = true;
    }
    if (seen) return undefined;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(POPUP_KEY, '1');
    } catch {
      /* storage unavailable */
    }
  };

  const submit = (e) => {
    e.preventDefault();
    subscribeNewsletter(email.trim());
    setDone(true);
  };

  return (
    <Modal open={open} onClose={close} title="Newsletter" className="newsletter-modal">
      <div className="nl-art"><img src="/logo-256.png" alt="" /></div>
      <div className="nl-body">
        {done ? (
          <>
            <h2>Welcome to the Realm!</h2>
            <p>Use this code at checkout for 10% off your first order:</p>
            <div className="code-box">WELCOME10</div>
            <button className="btn btn-block" onClick={close}>Start Shopping</button>
          </>
        ) : (
          <>
            <span className="eyebrow dark">Exclusive offer</span>
            <h2>Get 10% Off Your First Order</h2>
            <p className="muted">Join for new drops, pre-order alerts and members-only deals.</p>
            <form onSubmit={submit} className="stack">
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" />
              <button className="btn btn-block">Get My Code</button>
            </form>
            <button className="link-btn" onClick={close}>No thanks</button>
          </>
        )}
      </div>
    </Modal>
  );
}
