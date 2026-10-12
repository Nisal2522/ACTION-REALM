import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';
import { subscribeNewsletter } from '../services/api';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, InstagramIcon, YouTubeIcon } from './Icons';
import BrandLogo from './BrandLogo';

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
    showToast(isNew ? (SITE.popup.code ? `Subscribed! Use ${SITE.popup.code} at checkout` : 'Thanks for subscribing!') : "You're already subscribed");
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="logo" aria-label={`${SITE.name} home`}>
            <BrandLogo />
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
        {SITE.footer.columns.map((col) => (
          <div key={col.id}>
            <h4>{col.title}</h4>
            {(col.links || []).map((l) => (/^https?:/.test(l.url)
              ? <a key={l.label + l.url} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
              : <Link key={l.label + l.url} to={l.url || '/'}>{l.label}</Link>))}
          </div>
        ))}
        {SITE.footer.showStores && (
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
        )}
        {SITE.footer.showNewsletter && (
        <div>
          <h4>{SITE.footer.newsletterTitle}</h4>
          <p className="muted small">{SITE.footer.newsletterText}</p>
          <form className="newsletter" onSubmit={subscribe}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Email" />
            <button className="btn btn-sm">Join</button>
          </form>
          {SITE.footer.showPaymentBadges && <div className="pay-badges" aria-label="Payment methods">
            {SITE.payments.card && <><span>VISA</span><span>Mastercard</span><span>AMEX</span><span>PayHere</span></>}
            {SITE.payments.bank && <span>Bank Transfer</span>}
            {SITE.payments.cod && <span>COD</span>}
          </div>}
        </div>
        )}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        {SITE.footer.bottomText && <span>{SITE.footer.bottomText}</span>}
      </div>
    </footer>
  );
}
