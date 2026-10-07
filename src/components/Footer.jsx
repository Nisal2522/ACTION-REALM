import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { CATEGORIES } from '../data/products';
import { collectionUrl } from '../data/collections';
import { subscribeNewsletter } from '../services/api';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, InstagramIcon, YouTubeIcon } from './Icons';

const SOCIALS = {
  instagram: { label: 'Instagram', Icon: InstagramIcon },
  youtube: { label: 'YouTube', Icon: YouTubeIcon },
  facebook: { label: 'Facebook', Icon: FacebookIcon },
};

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');

  const subscribe = (e) => {
    e.preventDefault();
    const isNew = subscribeNewsletter(email.trim());
    showToast(isNew ? 'Subscribed! Use WELCOME10 for 10% off' : "You're already subscribed");
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo">
            <img src="/logo-256.png" alt="" className="logo-mark" />
            <span className="logo-text">{SITE.name}<span>{SITE.tagline}</span></span>
          </Link>
          <p className="muted">{SITE.description}</p>
          <div className="socials">
            {Object.entries(SITE.socials).map(([k, href]) => {
              const s = SOCIALS[k];
              if (!s) return null;
              return (
                <a key={k} href={href} className={`social social-${k}`} aria-label={s.label} title={s.label} target="_blank" rel="noreferrer">
                  <s.Icon />
                </a>
              );
            })}
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/collections/in-stock">In Stock Now</Link>
          <Link to="/collections/pre-orders">Pre-Orders</Link>
          <Link to="/collections/new-arrivals">New Arrivals</Link>
          <Link to="/collections/sale">Sale</Link>
          {CATEGORIES.slice(0, 3).map((c) => <Link key={c} to={collectionUrl(c)}>{c}</Link>)}
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/track-order">Track Order</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/pages/shipping">Shipping Policy</Link>
          <Link to="/pages/returns">Returns & Refunds</Link>
          <Link to="/rewards">{SITE.coinsName}</Link>
          <Link to="/account">My Account</Link>
        </div>
        <div>
          <h4>Visit Us</h4>
          {SITE.stores.map((s) => (
            <p key={s.city} className="muted small">
              <strong>{s.city}</strong><br />{s.address}<br />{s.hours}<br />
              <a href={s.map} target="_blank" rel="noreferrer" className="link">Get directions</a>
            </p>
          ))}
          <p className="muted small">{SITE.phone}<br />{SITE.email}</p>
        </div>
        <div>
          <h4>Newsletter</h4>
          <p className="muted small">Get drops, pre-order alerts and 10% off your first order.</p>
          <form className="newsletter" onSubmit={subscribe}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Email" />
            <button className="btn btn-sm">Join</button>
          </form>
          <div className="pay-badges" aria-label="Payment methods">
            <span>VISA</span><span>Mastercard</span><span>AMEX</span><span>PayHere</span><span>COD</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name} {SITE.tagline}. All rights reserved.</span>
        <span className="footer-links">
          <Link to="/pages/about">About</Link>
          <Link to="/pages/privacy">Privacy</Link>
          <Link to="/pages/terms">Terms</Link>
        </span>
      </div>
    </footer>
  );
}
