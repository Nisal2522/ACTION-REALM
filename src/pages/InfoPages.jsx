import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SITE, formatPrice, slugify } from '../config/site';
import { pageSections, useContent } from '../data/content';
import { sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, FileIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/Icons';
import PageHero from '../components/PageHero';
import useTitle from '../hooks/useTitle';
import NotFound from './NotFound';

// Turns plain text into paragraphs and bullet lists. Lines starting with "- "
// become bullets, and [label](/link) becomes a link.
function RichText({ text }) {
  const inline = (line) => line.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!m) return part;
    return /^https?:/.test(m[2])
      ? <a key={i} href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a>
      : <Link key={i} to={m[2]}>{m[1]}</Link>;
  });
  return text.split(/\n\s*\n/).map((block, i) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-•*]\s+/.test(l));
    if (!bullets.length) return <p key={i}>{inline(lines.join(' '))}</p>;
    const lead = lines.filter((l) => !/^[-•*]\s+/.test(l));
    return (
      <div key={i}>
        {lead.length > 0 && <p>{inline(lead.join(' '))}</p>}
        <ul>{bullets.map((l, j) => <li key={j}>{inline(l.replace(/^[-•*]\s+/, ''))}</li>)}</ul>
      </div>
    );
  });
}

const topicId = (s, i) => `topic-${slugify(s.title) || i + 1}`;

export function InfoPage() {
  const { slug } = useParams();
  const location = useLocation();
  const page = useContent('pages').find((p) => p.slug === slug);
  const { intro, sections } = pageSections(page);
  const topics = sections.filter((s) => s.title?.trim());
  const [open, setOpen] = useState(() => new Set());
  useTitle(page?.title);

  // Open the first topic, or the one named in the address (#topic-delivery).
  const pageKey = page?.id;
  useEffect(() => {
    const fromHash = sections.findIndex((s, i) => `#${topicId(s, i)}` === location.hash);
    const first = sections.findIndex((s) => s.title?.trim());
    const pick = fromHash >= 0 ? fromHash : first;
    setOpen(new Set(pick >= 0 ? [sections[pick].id] : []));
    if (fromHash >= 0) setTimeout(() => document.getElementById(topicId(sections[fromHash], fromHash))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [pageKey, location.hash]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page) return <NotFound />;
  const words = (page.body || '').split(/\s+/).length;
  const updated = page.updatedAt || page.createdAt;
  const allOpen = topics.length > 0 && topics.every((t) => open.has(t.id));

  const toggle = (id) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  return (
    <div className="info-page">
      <PageHero label="Policies" title={page.title} icon={FileIcon} image={page.image} compact>
        <div className="page-hero-meta">
          {updated && <span>Last updated {new Date(updated).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          {topics.length > 0 && <span>{topics.length} topics</span>}
          <span>{Math.max(1, Math.round(words / 200))} min read</span>
        </div>
      </PageHero>

      <div className="container policy-layout single">
        <article className="policy-body">
          {intro.trim() && <div className="policy-intro"><RichText text={intro} /></div>}

          {topics.length > 1 && (
            <div className="terms-toolbar">
              <span className="muted small">{topics.length} topics</span>
              <button type="button" className="link-btn" onClick={() => setOpen(allOpen ? new Set() : new Set(topics.map((t) => t.id)))}>
                {allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
          )}

          {sections.map((s, i) => {
            const num = <span className="policy-num">{String(i + 1).padStart(2, '0')}</span>;
            if (!s.title?.trim()) {
              return (
                <section key={s.id} id={topicId(s, i)} className="policy-section">
                  {num}
                  <div className="rich-text"><RichText text={s.body} /></div>
                </section>
              );
            }
            const isOpen = open.has(s.id);
            return (
              <section key={s.id} id={topicId(s, i)} className={`terms-item ${isOpen ? 'open' : ''}`}>
                <button type="button" className="terms-head" onClick={() => toggle(s.id)} aria-expanded={isOpen} aria-controls={`${topicId(s, i)}-body`}>
                  {num}
                  <span className="terms-title">{s.title}</span>
                  <span className="terms-icon" aria-hidden="true" />
                </button>
                <div className="terms-panel" id={`${topicId(s, i)}-body`} role="region" aria-label={s.title}>
                  <div className="terms-panel-inner">
                    <div className="rich-text"><RichText text={s.body} /></div>
                  </div>
                </div>
              </section>
            );
          })}

          <div className="policy-help">
            <div>
              <h3>Have a question about this?</h3>
              <p className="muted">Our team is happy to help. Reach us on WhatsApp or send a message.</p>
            </div>
            <div className="policy-help-actions">
              <a className="btn whatsapp-btn" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer"><WhatsAppIcon width={18} height={18} /> WhatsApp</a>
              <Link to="/contact" className="btn btn-outline">Contact us</Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export function Contact() {
  useTitle('Contact Us');
  const { user } = useAuth();
  const c = SITE.contact;
  const topics = c.topics?.length ? c.topics : ['General'];
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: topics[0], message: '' });
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const mainStore = SITE.stores[0];

  const submit = (e) => {
    e.preventDefault();
    sendMessage(form);
    setSent(true);
  };

  const quick = [
    { Icon: WhatsAppIcon, title: 'WhatsApp', text: 'Fastest reply', href: `https://wa.me/${SITE.whatsapp}`, tone: 'wa', external: true },
    { Icon: PhoneIcon, title: 'Call us', text: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, '')}` },
    { Icon: MailIcon, title: 'Email', text: SITE.email, href: `mailto:${SITE.email}` },
    { Icon: PinIcon, title: 'Visit', text: SITE.stores.map((s) => s.city).join(' & '), href: mainStore?.map, external: true },
  ];

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          {c.label && <span className="about-kicker">{c.label}</span>}
          <h1>{c.title}</h1>
          {c.text && <p className="muted">{c.text}</p>}
        </div>
      </section>

      <div className="container contact-quick">
        {quick.map(({ Icon, title, text, href, tone, external }) => (
          <a key={title} href={href} className={`contact-quick-card ${tone || ''}`} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <span className="contact-quick-icon"><Icon width={22} height={22} /></span>
            <span><strong>{title}</strong><span className="muted small">{text}</span></span>
          </a>
        ))}
      </div>

      <div className="container contact-main">
        <div className="contact-card">
          {sent ? (
            <div className="center-msg contact-sent">
              <span className="success-icon big"><CheckIcon width={30} height={30} /></span>
              <h2>Message sent!</h2>
              <p className="muted">Thanks, {form.name.split(' ')[0] || 'there'}. We'll get back to you at {form.email} soon.</p>
              <button className="btn btn-outline" onClick={() => { setSent(false); setForm({ ...form, message: '' }); }}>Send another message</button>
            </div>
          ) : (
            <form className="stack" onSubmit={submit}>
              <h2>{c.formTitle}</h2>
              <div className="field-row">
                <label className="field"><span className="field-label">Name</span><input className="input" required value={form.name} onChange={set('name')} autoComplete="name" /></label>
                <label className="field"><span className="field-label">Email</span><input className="input" required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
              </div>
              <div className="field-row">
                <label className="field"><span className="field-label">Mobile (optional)</span><input className="input" inputMode="tel" placeholder="07X XXX XXXX" value={form.phone} onChange={set('phone')} autoComplete="tel" /></label>
                <label className="field"><span className="field-label">Topic</span>
                  <select className="input" value={form.subject} onChange={set('subject')}>{topics.map((s) => <option key={s}>{s}</option>)}</select>
                </label>
              </div>
              <label className="field"><span className="field-label">Message</span><textarea className="input" required rows="6" placeholder="How can we help?" value={form.message} onChange={set('message')} /></label>
              <button className="btn btn-lg">Send message</button>
            </form>
          )}
        </div>

        {c.showMap && mainStore && (
          <div className="contact-map">
            <iframe
              title={`Map of our ${mainStore.city} store`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${mainStore.address === 'Add your store address here' ? '' : mainStore.address} ${mainStore.city} Sri Lanka`)}&z=13&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function Rewards() {
  useTitle(SITE.coinsName);
  const { user } = useAuth();
  const [spend, setSpend] = useState(50000);
  const perRs = Math.round(1 / SITE.coinsRate);
  const earned = Math.floor(spend * SITE.coinsRate);
  const balance = user?.coins || 0;

  return (
    <div className="info-page">
      <section className="coins-hero">
        <div className="container coins-hero-inner">
          <div className="coins-hero-text">
            <span className="page-hero-label">Loyalty programme</span>
            <h1>{SITE.coinsName}</h1>
            <p>Every order earns coins you can spend on your next figure. No cards, no codes. It all happens automatically.</p>
            {user ? (
              <div className="coins-balance">
                <span className="muted small">Your balance</span>
                <strong>{balance.toLocaleString('en-LK')} coins</strong>
                <span className="small">worth {formatPrice(balance * SITE.coinValue)} off</span>
              </div>
            ) : (
              <div className="coins-cta">
                <Link to="/login" className="btn btn-lg">Join &amp; start earning</Link>
                <Link to="/collections/all" className="btn btn-lg btn-outline coins-ghost">Browse figures</Link>
              </div>
            )}
          </div>
          <div className="coin-art" aria-hidden="true">
            <span className="coin back" />
            <span className="coin mid" />
            <span className="coin front"><img src="/brand/mark-white.png" alt="" /></span>
          </div>
        </div>
      </section>

      <div className="container section">
        <div className="about-center-head"><span className="about-kicker">How it works</span><h2>Three simple steps</h2></div>
        <div className="coin-steps">
          <div className="coin-step"><span className="coin-step-num">1</span><h3>Create an account</h3><p className="muted">Sign up free. It takes less than a minute.</p></div>
          <div className="coin-step"><span className="coin-step-num">2</span><h3>Shop &amp; earn</h3><p className="muted">Get 1 coin for every {formatPrice(perRs)} you spend, added as soon as you order.</p></div>
          <div className="coin-step"><span className="coin-step-num">3</span><h3>Spend at checkout</h3><p className="muted">Each coin is worth {formatPrice(SITE.coinValue)}. Tick “Use {SITE.coinsName}” to apply them.</p></div>
        </div>
      </div>

      <div className="container">
        <div className="coin-calc">
          <div>
            <span className="about-kicker">Calculator</span>
            <h2>See what you'd earn</h2>
            <label className="coin-calc-input">
              <span>If you spend</span>
              <strong>{formatPrice(spend)}</strong>
              <input type="range" min="5000" max="500000" step="5000" value={spend} onChange={(e) => setSpend(Number(e.target.value))} aria-label="Amount you spend" />
            </label>
          </div>
          <div className="coin-calc-result">
            <span className="muted small">You earn</span>
            <strong>{earned.toLocaleString('en-LK')} coins</strong>
            <span>= {formatPrice(earned * SITE.coinValue)} off your next order</span>
          </div>
        </div>
      </div>

      <div className="container section">
        <div className="about-center-head"><span className="about-kicker">Good to know</span><h2>The details</h2></div>
        <div className="coin-rules">
          {[
            'Coins are added the moment your order is placed.',
            `Use them on any order. Just tick “Use ${SITE.coinsName}” at checkout.`,
            'Coins expire 12 months after they are earned.',
            'Coins have no cash value and cannot be transferred.',
          ].map((t) => <div key={t} className="coin-rule"><span className="coin-rule-check"><CheckIcon width={14} height={14} /></span>{t}</div>)}
        </div>
      </div>
    </div>
  );
}
