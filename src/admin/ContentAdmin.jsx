import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HOME_SECTION_LABELS, SITE, slugify } from '../config/site';
import { getFranchises } from '../data/products';
import { saveSettings } from '../services/settings';
import { PERK_ICONS } from '../components/HomeSections';
import ListEditor from './ListEditor';

const SUBTABS = ['Layout', 'Hero slides', 'Brand strip', 'Shop by franchise', 'Perks', 'Testimonials', 'FAQ'];

export function HomepageAdmin() {
  const [tab, setTab] = useState('Layout');
  return (
    <>
      <div className="tabs left sub-tabs">
        {SUBTABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Layout' && <HomeLayout />}
      {tab === 'Hero slides' && <HeroSlides />}
      {tab === 'Brand strip' && <BrandStrip />}
      {tab === 'Shop by franchise' && <Characters />}
      {tab === 'Perks' && <Perks />}
      {tab === 'Testimonials' && <Testimonials />}
      {tab === 'FAQ' && <Faqs />}
    </>
  );
}

// ── Layout: section order, visibility and options ──────────────────────────
function HomeLayout() {
  const sections = SITE.homeSections.filter((s) => HOME_SECTION_LABELS[s.id]);
  const update = (next) => saveSettings({ homeSections: next });
  const move = (i, d) => {
    const next = [...sections];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    update(next);
  };

  return (
    <div className="admin-cols two">
      <div className="panel">
        <h3>Sections & order</h3>
        <p className="muted small">Turn sections on or off and change their order. Changes appear on the homepage straight away.</p>
        <ul className="section-list">
          {sections.map((s, i) => (
            <li key={s.id} className={s.enabled ? '' : 'off'}>
              <label className="check">
                <input type="checkbox" checked={s.enabled} onChange={(e) => update(sections.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))} />
                {HOME_SECTION_LABELS[s.id] || s.id}
              </label>
              <span className="order-btns">
                <button className="icon-btn sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button className="icon-btn sm" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              </span>
            </li>
          ))}
        </ul>
        <Link to="/" className="link small" target="_blank">Open homepage in a new tab →</Link>
      </div>
      <div className="panel stack">
        <h3>Section options</h3>
        <label className="field">
          <span className="field-label">Trending row shows franchise</span>
          <select className="input" value={SITE.trendingFranchise} onChange={(e) => saveSettings({ trendingFranchise: e.target.value })}>
            {getFranchises().map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Products per homepage tab</span>
          <input className="input" type="number" min="4" max="40" value={SITE.homeTabCount} onChange={(e) => saveSettings({ homeTabCount: Number(e.target.value) || 14 })} />
          <span className="muted small">Tip: 14 fills two rows of 7 on wide screens.</span>
        </label>
        <p className="muted small">Featured products ("Collector's Picks") are chosen with the <strong>Featured</strong> tick box on each product.</p>
      </div>
    </div>
  );
}

const thumb = (src, round) => (src ? <img src={src} alt="" className={`list-thumb ${round ? 'round' : ''}`} /> : <span className="muted small">No image</span>);

function HeroSlides() {
  return (
    <ListEditor
      collection="heroSlides"
      itemName="slide"
      intro="The big banner at the top of the homepage. Slides rotate every 6 seconds."
      newItem={{ eyebrow: '', title: '', text: '', cta: 'Shop Now', link: '/collections/all', image: '', baseColor: '#111111', glowColor: SITE.accentColor, enabled: true }}
      fields={[
        { key: 'title', label: 'Headline', required: true, span: 2 },
        { key: 'eyebrow', label: 'Small label above headline', placeholder: 'e.g. New Arrival' },
        { key: 'cta', label: 'Button text', placeholder: 'e.g. Shop Now' },
        { key: 'text', label: 'Text', type: 'textarea', rows: 2 },
        { key: 'link', label: 'Button link', placeholder: '/collections/sale', help: 'A page on this site, e.g. /collections/pre-orders or /products/…' },
        { key: 'enabled', label: 'Show this slide', type: 'checkbox' },
        { key: 'image', label: 'Background photo (wide, at least 1600px)', type: 'image', max: 1920, shape: 'wide' },
        { key: 'baseColor', label: 'Shade colour (behind text)', type: 'color' },
        { key: 'glowColor', label: 'Glow colour (used when there is no photo)', type: 'color' },
      ]}
      columns={[
        { label: 'Image', render: (s) => thumb(s.image) },
        { label: 'Slide', render: (s) => <><strong>{s.title}</strong><div className="muted small">{s.eyebrow} · {s.link}</div></> },
        { label: 'Visible', render: (s) => (s.enabled === false ? 'Hidden' : 'Yes') },
      ]}
    />
  );
}

function BrandStrip() {
  return (
    <ListEditor
      collection="brandStrip"
      itemName="brand"
      intro="The scrolling logo strip. Brands that have products link to their collection page."
      newItem={{ name: '', logo: '' }}
      fields={[
        { key: 'name', label: 'Brand name', required: true, span: 2 },
        { key: 'logo', label: 'Logo (square works best; leave empty for an initials badge)', type: 'image', max: 256, shape: 'square' },
      ]}
      columns={[
        { label: 'Logo', render: (b) => thumb(b.logo) },
        { label: 'Brand', render: (b) => <strong>{b.name}</strong> },
      ]}
    />
  );
}

function Characters() {
  return (
    <ListEditor
      collection="characters"
      itemName="tile"
      intro={`The photo cards under “${SITE.homeTitles.characters}” on the homepage. Add, edit, reorder or delete tiles here. Clicking a tile searches the shop for its search words, or opens the link if you set one.`}
      newItem={{ name: '', query: '', link: '', image: '' }}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'query', label: 'Search words', placeholder: 'e.g. spider-man', help: 'Products whose name/brand contains these words are shown.' },
        { key: 'link', label: 'Link (optional)', placeholder: '/collections/marvel', help: 'Leave empty to use the search words.' },
        { key: 'image', label: 'Photo (portrait, about 800 × 1000px)', type: 'image', max: 1000, shape: 'tall' },
      ]}
      columns={[
        { label: 'Photo', render: (c) => thumb(c.image) },
        { label: 'Tile', render: (c) => <><strong>{c.name}</strong><div className="muted small">{c.link ? `opens ${c.link}` : `searches “${c.query || c.name}”`}</div></> },
      ]}
    />
  );
}

function Perks() {
  return (
    <ListEditor
      collection="perks"
      itemName="perk"
      intro="The row of benefits under the brand strip (delivery, authenticity, installments…)."
      newItem={{ icon: 'truck', title: '', text: '' }}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'icon', label: 'Icon', type: 'select', options: Object.keys(PERK_ICONS) },
        { key: 'text', label: 'Short text', span: 2 },
      ]}
      columns={[
        { label: 'Perk', render: (p) => <><strong>{p.title}</strong><div className="muted small">{p.text}</div></> },
        { label: 'Icon', render: (p) => p.icon },
      ]}
    />
  );
}

function Testimonials() {
  return (
    <ListEditor
      collection="testimonials"
      itemName="testimonial"
      intro="“What Collectors Say” on the homepage. Use real customer quotes."
      newItem={{ name: '', city: '', rating: 5, text: '' }}
      fields={[
        { key: 'name', label: 'Customer name', required: true },
        { key: 'city', label: 'City' },
        { key: 'rating', label: 'Stars', type: 'select', options: ['5', '4', '3', '2', '1'] },
        { key: 'text', label: 'Quote', type: 'textarea', required: true, rows: 3 },
      ]}
      columns={[
        { label: 'Quote', render: (t) => <><span className="stars small-stars">{'★'.repeat(Number(t.rating) || 5)}</span><div className="small clamp-2">{t.text}</div></> },
        { label: 'Customer', render: (t) => `${t.name}${t.city ? ` · ${t.city}` : ''}` },
      ]}
    />
  );
}

function Faqs() {
  return (
    <ListEditor
      collection="faqs"
      itemName="question"
      intro="Frequently asked questions at the bottom of the homepage."
      newItem={{ q: '', a: '' }}
      fields={[
        { key: 'q', label: 'Question', required: true, span: 2 },
        { key: 'a', label: 'Answer', type: 'textarea', required: true },
      ]}
      columns={[{ label: 'Question', render: (f) => <><strong>{f.q}</strong><div className="muted small clamp-2">{f.a}</div></> }]}
    />
  );
}

export function PagesAdmin() {
  return (
    <ListEditor
      collection="pages"
      itemName="page"
      intro="Information pages such as About, Shipping, Returns and Privacy. Separate paragraphs with a blank line."
      newItem={{ title: '', slug: '', body: '', showInFooter: true }}
      validate={(page, all) => {
        const slug = page.slug || slugify(page.title || '');
        if (!slug) return 'Enter a title.';
        if (all.some((p) => p.slug === slug && p.id !== page.id)) return 'Another page already uses this address.';
        page.slug = slug; // eslint-disable-line no-param-reassign
        return null;
      }}
      fields={[
        { key: 'title', label: 'Page title', required: true },
        { key: 'slug', label: 'Page address', placeholder: 'auto from title', help: 'The page opens at /pages/<address>' },
        { key: 'showInFooter', label: 'Show link in the footer', type: 'checkbox', span: 2 },
        { key: 'body', label: 'Content', type: 'textarea', rows: 12, required: true },
      ]}
      columns={[
        { label: 'Page', render: (p) => <><strong>{p.title}</strong><div className="muted small"><Link to={`/pages/${p.slug}`} className="link" target="_blank">/pages/{p.slug}</Link></div></> },
        { label: 'Footer', render: (p) => (p.showInFooter ? 'Shown' : 'Hidden') },
      ]}
    />
  );
}
