import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HOME_SECTION_LABELS, slugify } from '../config/site';
import { db, useCollection } from '../services/db';
import { ChevronIcon, ExternalIcon, FileIcon, GridIcon, HomeIcon, LockIcon, MailIcon, PlusIcon, TrashIcon, UsersIcon } from '../components/Icons';
import { collectionOptions } from '../data/collections';
import ListEditor from './ListEditor';
import { pageBody, pageSections } from '../data/content';
import { HomepageAdmin } from './ContentAdmin';
import { ImageInput, ObjectList, StringList } from './fields';
import { SaveBar, Section, useDraft } from './draft';

const BUILT_IN = [
  { id: 'home', title: 'Home', url: '/', Icon: HomeIcon, desc: 'Banner, sections, headings and homepage content' },
  { id: 'about', title: 'About Us', url: '/about', Icon: UsersIcon, desc: 'Hero, story, photos, values and closing banner' },
  { id: 'contact', title: 'Contact Us', url: '/contact', Icon: MailIcon, desc: 'Heading, text, message topics and map' },
  { id: 'login', title: 'Login', url: '/login', Icon: LockIcon, desc: 'Titles, side photo and demo note' },
  { id: 'collections', title: 'Collection banners', url: '/collections/all', Icon: GridIcon, desc: 'Banner photo and text on brand, category and franchise pages' },
];

export default function PagesCMS() {
  const policies = useCollection('pages').filter((p) => p.slug !== 'about');
  const [open, setOpen] = useState(null); // { kind: 'home'|'about'|'contact'|'login'|'policy', id }

  if (open) {
    const builtIn = BUILT_IN.find((b) => b.id === open.kind);
    const policy = open.kind === 'policy' ? policies.find((p) => p.id === open.id) : null;
    const title = builtIn?.title || policy?.title || 'New page';
    const url = builtIn?.url || (policy ? `/pages/${policy.slug}` : null);
    return (
      <div className="cms-editor">
        <div className="cms-editor-head">
          <button className="adm-btn ghost" onClick={() => setOpen(null)}><ChevronIcon dir="left" width={16} height={16} /> All pages</button>
          <h2>{title}</h2>
          {url && <Link to={url} target="_blank" className="adm-btn"><ExternalIcon width={15} height={15} /> View page</Link>}
        </div>
        {open.kind === 'home' && <HomeEditor />}
        {open.kind === 'about' && <AboutEditor />}
        {open.kind === 'contact' && <ContactEditor />}
        {open.kind === 'login' && <LoginEditor />}
        {open.kind === 'collections' && <CollectionBanners />}
        {open.kind === 'policy' && <PolicyEditor page={policy} onDone={() => setOpen(null)} />}
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="cms-group-title">Main pages</div>
      <div className="cms-page-grid">
        {BUILT_IN.map(({ id, title, url, Icon, desc }) => (
          <button key={id} className="cms-page-card" onClick={() => setOpen({ kind: id })}>
            <span className="cms-page-icon"><Icon width={20} height={20} /></span>
            <span className="cms-page-text"><strong>{title}</strong><span className="muted small">{desc}</span></span>
            <ChevronIcon dir="right" width={16} height={16} />
          </button>
        ))}
      </div>

      <div className="cms-group-title">Information pages</div>
      <div className="cms-page-grid">
        {policies.map((p) => (
          <button key={p.id} className="cms-page-card" onClick={() => setOpen({ kind: 'policy', id: p.id })}>
            <span className="cms-page-icon"><FileIcon width={20} height={20} /></span>
            <span className="cms-page-text"><strong>{p.title}</strong><span className="muted small">{p.sections?.some((t) => t.title) ? `${p.sections.length} topics · ${p.sections.filter((t) => t.title).slice(0, 3).map((t) => t.title).join(', ')}` : `${(p.body || '').slice(0, 70)}…`}</span></span>
            <ChevronIcon dir="right" width={16} height={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Home ────────────────────────────────────────────────────────────────────
function HomeEditor() {
  const d = useDraft();
  return (
    <>
      <HomepageAdmin />
      <Section title="Section headings" desc="The titles shown above each homepage section.">
        <div className="form-grid">
          {Object.keys(d.draft.homeTitles).filter((k) => HOME_SECTION_LABELS[k]).map((k) => d.F({ key: `homeTitles.${k}`, label: HOME_SECTION_LABELS[k] }))}
        </div>
      </Section>
      <SaveBar d={d} />
    </>
  );
}

// ── About Us ────────────────────────────────────────────────────────────────
function AboutEditor() {
  const d = useDraft();
  const { F } = d;
  return (
    <>
      <Section title="Hero banner" desc="The big banner at the top of the page.">
        <div className="form-grid">
          {F({ key: 'about.heroLabel', label: 'Small label' })}
          {F({ key: 'about.heroTitle', label: 'Headline', type: 'textarea', rows: 2, help: 'Press Enter for a new line.' })}
          {F({ key: 'about.heroText', label: 'Text', type: 'textarea', rows: 2 })}
          {F({ key: 'about.heroImage', label: 'Background photo (wide)', type: 'image', max: 1920, shape: 'wide' })}
        </div>
      </Section>
      <Section title="Our story" desc="Text next to the photo collage. Separate paragraphs with a blank line.">
        <div className="form-grid">
          {F({ key: 'about.storyLabel', label: 'Small label' })}
          {F({ key: 'about.storyButton', label: 'Button text', help: 'Leave empty to hide the button.' })}
          {F({ key: 'about.storyTitle', label: 'Heading', span: 2 })}
          {F({ key: 'about.storyText', label: 'Story', type: 'textarea', rows: 8 })}
          {F({ key: 'about.storyImage1', label: 'Large photo', type: 'image', max: 900, shape: 'wide' })}
          {F({ key: 'about.storyImage2', label: 'Small photo', type: 'image', max: 700, shape: 'wide' })}
        </div>
      </Section>
      <Section title="Numbers strip" desc="Red strip with your product, brand, district and store counts (updates automatically).">
        <div className="form-grid">{F({ key: 'about.showStats', label: 'Show the numbers strip', type: 'checkbox', span: 2 })}</div>
      </Section>
      <Section title="Values" desc="Cards explaining what your store stands for.">
        <div className="stack">
          <div className="form-grid">{F({ key: 'about.valuesTitle', label: 'Section heading', span: 2 })}</div>
          <ObjectList
            value={d.get('about.values')}
            onChange={(v) => d.set('about.values', v)}
            itemLabel="value"
            newItem={{ icon: 'shield', title: '', text: '' }}
            fields={[
              { key: 'title', label: 'Title' },
              { key: 'icon', label: 'Icon', type: 'select', options: [
                { value: 'shield', label: 'Shield (trust)' }, { value: 'store', label: 'Store / box' },
                { value: 'truck', label: 'Delivery truck' }, { value: 'heart', label: 'Heart' }, { value: 'card', label: 'Card / payment' },
              ] },
              { key: 'text', label: 'Text', type: 'textarea', rows: 2 },
            ]}
          />
        </div>
      </Section>
      <Section title="Stores" desc="Shows a card for each of your store locations.">
        <div className="form-grid">
          {F({ key: 'about.showStores', label: 'Show the stores section', type: 'checkbox', span: 2 })}
          {F({ key: 'about.storesTitle', label: 'Section heading', span: 2 })}
        </div>
      </Section>
      <Section title="Closing banner" desc="Dark banner at the bottom with Shop now / Contact us buttons.">
        <div className="form-grid">
          {F({ key: 'about.ctaTitle', label: 'Heading', help: 'Leave empty to hide the banner.', span: 2 })}
          {F({ key: 'about.ctaText', label: 'Text', type: 'textarea', rows: 2 })}
        </div>
      </Section>
      <SaveBar d={d} />
    </>
  );
}

// ── Contact Us ──────────────────────────────────────────────────────────────
function ContactEditor() {
  const d = useDraft();
  const { F } = d;
  return (
    <>
      <Section title="Header" desc="The dark banner at the top of the page.">
        <div className="form-grid">
          {F({ key: 'contact.label', label: 'Small label' })}
          {F({ key: 'contact.title', label: 'Headline' })}
          {F({ key: 'contact.text', label: 'Text', type: 'textarea', rows: 2 })}
        </div>
      </Section>
      <Section title="Message form">
        <div className="stack">
          <div className="form-grid">{F({ key: 'contact.formTitle', label: 'Form heading', span: 2 })}</div>
          <span className="field-label">Topics customers can choose</span>
          <StringList value={d.get('contact.topics')} onChange={(v) => d.set('contact.topics', v)} placeholder="New topic" />
        </div>
      </Section>
      <Section title="Map">
        <div className="form-grid">{F({ key: 'contact.showMap', label: 'Show a Google Map of your first store', type: 'checkbox', span: 2 })}</div>
      </Section>
      <SaveBar d={d} />
    </>
  );
}

// ── Login ───────────────────────────────────────────────────────────────────
function LoginEditor() {
  const d = useDraft();
  const { F } = d;
  return (
    <>
      <Section title="Login page">
        <div className="form-grid">
          {F({ key: 'login.loginTitle', label: 'Log in heading' })}
          {F({ key: 'login.registerTitle', label: 'Register heading' })}
          {F({ key: 'login.image', label: 'Side photo (fades into the page)', type: 'image', max: 1600, shape: 'wide' })}
          {F({ key: 'login.showDemo', label: 'Show the demo admin login under the form', type: 'checkbox', span: 2, help: 'Turn this off before going live.' })}
        </div>
      </Section>
      <SaveBar d={d} />
    </>
  );
}

// ── Collection banners (brand / category / franchise pages) ─────────────────
function CollectionBanners() {
  const options = collectionOptions();
  const label = (slug) => options.find((o) => o.value === slug)?.label || slug;
  return (
    <ListEditor
      collection="collectionBanners"
      itemName="banner"
      sortable={false}
      intro="Every collection page already has a starter banner photo. Add a banner here to use your own photo or text for a brand, category, franchise or collection."
      newItem={{ collection: options[0]?.value || 'all', image: '', text: '' }}
      validate={(b, all) => {
        if (all.some((x) => x.collection === b.collection && x.id !== b.id)) return 'This page already has a banner. Edit that one instead.';
        if (!b.image && !b.text?.trim()) return 'Add a photo or some text.';
        return null;
      }}
      fields={[
        { key: 'collection', label: 'Page', type: 'select', options, span: 2 },
        { key: 'image', label: 'Banner photo (wide, at least 1600px)', type: 'image', max: 1920, shape: 'wide' },
        { key: 'text', label: 'Text under the title (optional)', type: 'textarea', rows: 3, placeholder: 'Leave empty for the automatic line.' },
      ]}
      columns={[
        { label: 'Photo', render: (b) => (b.image ? <img src={b.image} alt="" className="list-thumb wide" /> : <span className="muted small">Automatic</span>) },
        { label: 'Page', render: (b) => <><strong>{label(b.collection)}</strong><div className="muted small"><Link to={`/collections/${b.collection}`} target="_blank" className="link">/collections/{b.collection}</Link></div></> },
        { label: 'Text', render: (b) => <span className="small clamp-2">{b.text || 'Automatic'}</span> },
      ]}
    />
  );
}

// ── Information pages (shipping, returns, privacy, terms, custom) ───────────
const topicKey = () => Math.random().toString(36).slice(2, 8);

function PolicyEditor({ page, onDone }) {
  const start = pageSections(page);
  const [f, setF] = useState({ title: page?.title || '', slug: page?.slug || '', intro: start.intro, image: page?.image || '' });
  const [topics, setTopics] = useState(() => (start.sections.length ? start.sections : [{ id: topicKey(), title: '', body: '' }]));
  const [focus, setFocus] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const all = useCollection('pages');
  const touch = () => setSaved(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); touch(); };
  const setTopic = (i, patch) => { setTopics(topics.map((t, j) => (j === i ? { ...t, ...patch } : t))); touch(); };
  const moveTopic = (i, d) => {
    const next = [...topics];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setTopics(next);
    touch();
  };
  const addTopic = (at = topics.length) => {
    const t = { id: topicKey(), title: '', body: '' };
    setTopics([...topics.slice(0, at), t, ...topics.slice(at)]);
    setFocus(t.id);
    touch();
  };
  const removeTopic = (i) => {
    const t = topics[i];
    if ((t.title || t.body) && !window.confirm(`Delete the topic "${t.title || 'Untitled'}"?`)) return;
    setTopics(topics.filter((_, j) => j !== i));
    touch();
  };

  const save = () => {
    const slug = slugify(f.slug || f.title);
    const clean = topics.map((t) => ({ id: t.id, title: t.title.trim(), body: t.body.trim() })).filter((t) => t.title || t.body);
    if (!f.title.trim()) return setError('Enter a page title.');
    if (!slug || slug === 'about') return setError('Choose a different page address.');
    if (all.some((p) => p.slug === slug && p.id !== page?.id)) return setError('Another page already uses this address.');
    const empty = clean.findIndex((t) => !t.body);
    if (empty >= 0) return setError(`Topic ${empty + 1} (${clean[empty].title}) needs some content.`);
    if (!clean.length && !f.intro.trim()) return setError('Add at least one topic.');
    setError('');
    const data = { title: f.title.trim(), slug, image: f.image || '', intro: f.intro.trim(), sections: clean, body: pageBody(f.intro.trim(), clean) };
    if (page) db.update('pages', page.id, data);
    else db.insert('pages', { ...data, showInFooter: false });
    setTopics(clean.length ? clean : topics);
    setSaved(true);
    if (!page) onDone();
  };
  const remove = () => {
    if (!window.confirm(`Delete the page "${page.title}"?`)) return;
    db.remove('pages', page.id);
    onDone();
  };

  return (
    <>
      <Section title="Page details">
        <div className="form-grid">
          <label className="field"><span className="field-label">Title</span><input className="input" value={f.title} onChange={set('title')} /></label>
          <label className="field"><span className="field-label">Page address</span><input className="input" value={f.slug} onChange={set('slug')} placeholder="auto from title" /><span className="muted small">Opens at /pages/{slugify(f.slug || f.title) || '…'}</span></label>
          <div className="field span-2">
            <span className="field-label">Banner photo (optional, wide, at least 1600px)</span>
            <ImageInput value={f.image} onChange={(image) => { setF({ ...f, image }); touch(); }} max={1920} shape="wide" />
            <span className="muted small">Shown behind the page title, darkened so the text stays readable. Leave empty for the plain red banner.</span>
          </div>
          <label className="field span-2">
            <span className="field-label">Introduction (optional)</span>
            <textarea className="input" rows={3} value={f.intro} onChange={set('intro')} placeholder="A short note shown above the topics." />
          </label>
        </div>
      </Section>

      <Section
        title={`Topics (${topics.length})`}
        desc="Each topic opens and closes on the page, like the FAQ. Leave the heading empty to show a topic as a plain paragraph."
        aside={<button type="button" className="btn btn-sm" onClick={() => addTopic()}><PlusIcon width={14} height={14} /> Add topic</button>}
      >
        <div className="topic-list">
          {topics.map((t, i) => (
            <div key={t.id} className="topic-card">
              <div className="topic-card-head">
                <span className="topic-num">{String(i + 1).padStart(2, '0')}</span>
                <input
                  className="input"
                  value={t.title}
                  onChange={(e) => setTopic(i, { title: e.target.value })}
                  placeholder="Topic heading, e.g. Prices and payment"
                  aria-label={`Topic ${i + 1} heading`}
                  autoFocus={focus === t.id}
                />
                <span className="order-btns">
                  <button type="button" className="icon-btn sm" disabled={i === 0} onClick={() => moveTopic(i, -1)} aria-label="Move up">↑</button>
                  <button type="button" className="icon-btn sm" disabled={i === topics.length - 1} onClick={() => moveTopic(i, 1)} aria-label="Move down">↓</button>
                </span>
                <button type="button" className="icon-btn sm danger" onClick={() => removeTopic(i)} aria-label={`Delete topic ${i + 1}`}><TrashIcon width={15} height={15} /></button>
              </div>
              <textarea
                className="input"
                rows={Math.min(12, Math.max(4, t.body.split('\n').length + 1))}
                value={t.body}
                onChange={(e) => setTopic(i, { body: e.target.value })}
                placeholder="What customers should know about this topic."
                aria-label={`Topic ${i + 1} content`}
              />
              <button type="button" className="link-btn topic-insert" onClick={() => addTopic(i + 1)}>+ Add topic below</button>
            </div>
          ))}
          {!topics.length && <p className="muted small">No topics yet. Click “Add topic” to start.</p>}
        </div>
        <p className="muted small topic-tips">
          Tips: leave a blank line between paragraphs. Start a line with <code>- </code> for a bullet point.
          Write <code>[Shipping Policy](/pages/shipping)</code> to add a link.
        </p>
      </Section>

      <div className="save-bar">
        {error && <p className="error">{error}</p>}
        {saved && <p className="notice notice-ok no-margin">Saved.</p>}
        {page && <button type="button" className="btn btn-outline danger-btn sp-left" onClick={remove}><TrashIcon width={16} height={16} /> Delete page</button>}
        {page && <Link to={`/pages/${slugify(f.slug || f.title)}`} target="_blank" className="btn btn-outline"><ExternalIcon width={15} height={15} /> View page</Link>}
        <button type="button" className="btn" onClick={save}>{page ? 'Save changes' : 'Create page'}</button>
      </div>
    </>
  );
}
