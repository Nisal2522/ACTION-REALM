import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { INFO_PAGES } from '../data/content';
import { sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, WhatsAppIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';
import NotFound from './NotFound';

export function InfoPage() {
  const { slug } = useParams();
  const page = INFO_PAGES[slug];
  useTitle(page?.title);
  if (!page) return <NotFound />;
  return (
    <div className="container narrow page prose">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{page.title}</span></nav>
      <h1>{page.title}</h1>
      {page.body.map((para) => <p key={para}>{para}</p>)}
      <p className="muted small">Questions? <Link to="/contact" className="link">Contact us</Link>.</p>
    </div>
  );
}

export function Contact() {
  useTitle('Contact Us');
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    sendMessage(form);
    setSent(true);
  };

  return (
    <div className="container page">
      <h1>Contact Us</h1>
      <div className="contact-grid">
        <div>
          {sent ? (
            <div className="center-msg">
              <span className="success-icon"><CheckIcon /></span>
              <h3>Message sent!</h3>
              <p className="muted">We usually reply within a few hours.</p>
            </div>
          ) : (
            <form className="stack" onSubmit={submit}>
              <div className="field-row">
                <input className="input" required placeholder="Name" value={form.name} onChange={set('name')} />
                <input className="input" required type="email" placeholder="Email" value={form.email} onChange={set('email')} />
              </div>
              <input className="input" placeholder="Mobile (optional)" value={form.phone} onChange={set('phone')} />
              <textarea className="input" required rows="5" placeholder="How can we help?" value={form.message} onChange={set('message')} />
              <button className="btn">Send Message</button>
            </form>
          )}
        </div>
        <div className="contact-info">
          <a className="btn whatsapp-btn" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer"><WhatsAppIcon width={20} height={20} /> Chat on WhatsApp</a>
          <p><strong>Phone:</strong> {SITE.phone}<br /><strong>Email:</strong> {SITE.email}</p>
          <h3>Our Stores</h3>
          {SITE.stores.map((s) => (
            <div key={s.city} className="store-card">
              <strong>{s.city}</strong>
              <p className="muted small">{s.address}<br />Open {s.hours}</p>
              <a href={s.map} target="_blank" rel="noreferrer" className="link small">Get directions →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Rewards() {
  useTitle(SITE.coinsName);
  const { user } = useAuth();
  const perRs = Math.round(1 / SITE.coinsRate);
  return (
    <div className="container narrow page prose">
      <h1>{SITE.coinsName}</h1>
      <p className="lead">Our loyalty programme: every purchase earns coins you can spend on your next order.</p>
      <div className="steps-grid">
        <div className="stat"><strong>1</strong><span>Create a free account</span></div>
        <div className="stat"><strong>2</strong><span>Earn 1 coin for every Rs. {perRs} you spend</span></div>
        <div className="stat"><strong>3</strong><span>Each coin = {formatPrice(SITE.coinValue)} off at checkout</span></div>
      </div>
      <h3>Example</h3>
      <p>Buy a Rs. 120,000 Hot Toys figure and earn {Math.floor(120000 * SITE.coinsRate)} coins — that's {formatPrice(Math.floor(120000 * SITE.coinsRate) * SITE.coinValue)} off your next order.</p>
      <h3>Good to know</h3>
      <ul>
        <li>Coins are added as soon as your order is placed.</li>
        <li>Tick "Use {SITE.coinsName}" at checkout to apply your balance.</li>
        <li>Coins expire 12 months after they are earned and have no cash value.</li>
      </ul>
      {user ? (
        <p className="notice notice-ok">Your balance: <strong>{user.coins || 0} coins</strong> ({formatPrice((user.coins || 0) * SITE.coinValue)})</p>
      ) : (
        <Link to="/login" className="btn">Join & Start Earning</Link>
      )}
    </div>
  );
}
