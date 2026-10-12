import { useCollection } from '../services/db';
import { PlusIcon, TrashIcon } from '../components/Icons';
import { SaveBar, Section, useDraft } from './draft';

const newId = () => Math.random().toString(36).slice(2, 8);

// Suggested links shown while typing a menu / footer link.
function useSiteLinks() {
  const pages = useCollection('pages').filter((p) => p.slug !== 'about');
  return [
    ['/', 'Home'], ['/about', 'About Us'], ['/contact', 'Contact Us'], ['/collections/all', 'All products (Stocks)'],
    ['/collections/in-stock', 'In stock'], ['/collections/pre-orders', 'Pre-orders'], ['/collections/new-arrivals', 'New arrivals'],
    ['/collections/sale', 'Sale'], ['/track-order', 'Track order'], ['/rewards', 'Realm Coins'], ['/account', 'My account'], ['/wishlist', 'Wishlist'],
    ...pages.map((p) => [`/pages/${p.slug}`, p.title]),
  ];
}

function move(list, i, d) {
  const next = [...list];
  [next[i], next[i + d]] = [next[i + d], next[i]];
  return next;
}

function OrderButtons({ list, i, onChange }) {
  return (
    <span className="order-btns">
      <button type="button" className="icon-btn sm" disabled={i === 0} onClick={() => onChange(move(list, i, -1))} aria-label="Move up">↑</button>
      <button type="button" className="icon-btn sm" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, 1))} aria-label="Move down">↓</button>
    </span>
  );
}

export default function NavigationAdmin() {
  const d = useDraft();
  const links = useSiteLinks();
  const menu = d.get('headerMenu');
  const setMenu = (v) => d.set('headerMenu', v);
  const columns = d.get('footer.columns');
  const setColumns = (v) => d.set('footer.columns', v);
  const updateItem = (i, patch) => setMenu(menu.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const updateCol = (ci, patch) => setColumns(columns.map((c, j) => (j === ci ? { ...c, ...patch } : c)));

  return (
    <>
      <datalist id="site-links">{links.map(([url, label]) => <option key={url} value={url}>{label}</option>)}</datalist>

      <Section
        title="Header menu"
        desc="The links in the main menu bar. Reorder with the arrows; untick to hide an item."
        aside={<button type="button" className="btn btn-sm" onClick={() => setMenu([...menu, { id: newId(), label: 'New link', url: '/', type: 'link', enabled: true }])}><PlusIcon width={14} height={14} /> Add link</button>}
      >
        <div className="nav-rows">
          <div className="nav-row nav-row-head"><span>Order</span><span>Show</span><span>Label</span><span>Type</span><span>Link</span><span /></div>
          {menu.map((m, i) => (
            <div key={m.id} className={`nav-row ${m.enabled === false ? 'off' : ''}`}>
              <OrderButtons list={menu} i={i} onChange={setMenu} />
              <input type="checkbox" checked={m.enabled !== false} onChange={(e) => updateItem(i, { enabled: e.target.checked })} aria-label={`Show ${m.label}`} />
              <input className="input" value={m.label} onChange={(e) => updateItem(i, { label: e.target.value })} aria-label="Label" />
              <select className="input" value={m.type} onChange={(e) => updateItem(i, { type: e.target.value })} aria-label="Type">
                <option value="link">Link</option>
                <option value="franchises">Franchises dropdown</option>
              </select>
              {m.type === 'link'
                ? <input className="input" list="site-links" value={m.url} onChange={(e) => updateItem(i, { url: e.target.value })} placeholder="/page or https://…" aria-label="Link" />
                : <span className="muted small">Lists your franchises automatically</span>}
              <button type="button" className="icon-btn sm danger" onClick={() => setMenu(menu.filter((_, j) => j !== i))} aria-label="Remove"><TrashIcon width={15} height={15} /></button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Footer columns"
        desc="Link columns in the footer. Your logo and description always appear first."
        aside={<button type="button" className="btn btn-sm" onClick={() => setColumns([...columns, { id: newId(), title: 'New column', links: [] }])}><PlusIcon width={14} height={14} /> Add column</button>}
      >
        <div className="footer-cols">
          {columns.map((col, ci) => (
            <div key={col.id} className="footer-col-card">
              <div className="footer-col-head">
                <input className="input" value={col.title} onChange={(e) => updateCol(ci, { title: e.target.value })} aria-label="Column title" />
                <OrderButtons list={columns} i={ci} onChange={setColumns} />
                <button type="button" className="icon-btn sm danger" onClick={() => setColumns(columns.filter((_, j) => j !== ci))} aria-label="Remove column"><TrashIcon width={15} height={15} /></button>
              </div>
              {(col.links || []).map((l, li) => (
                <div key={li} className="footer-link-row">
                  <input className="input" value={l.label} placeholder="Label" onChange={(e) => updateCol(ci, { links: col.links.map((x, j) => (j === li ? { ...x, label: e.target.value } : x)) })} aria-label="Link label" />
                  <input className="input" list="site-links" value={l.url} placeholder="/page" onChange={(e) => updateCol(ci, { links: col.links.map((x, j) => (j === li ? { ...x, url: e.target.value } : x)) })} aria-label="Link address" />
                  <OrderButtons list={col.links} i={li} onChange={(v) => updateCol(ci, { links: v })} />
                  <button type="button" className="icon-btn sm danger" onClick={() => updateCol(ci, { links: col.links.filter((_, j) => j !== li) })} aria-label="Remove link"><TrashIcon width={14} height={14} /></button>
                </div>
              ))}
              <button type="button" className="link-btn left-align" onClick={() => updateCol(ci, { links: [...(col.links || []), { label: '', url: '/' }] })}>+ Add link</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Footer extras">
        <div className="form-grid">
          {d.F({ key: 'footer.showStores', label: 'Show the “Visit Us” column (stores, phone, email)', type: 'checkbox', span: 2 })}
          {d.F({ key: 'footer.showNewsletter', label: 'Show the newsletter column', type: 'checkbox', span: 2 })}
          {d.F({ key: 'footer.newsletterTitle', label: 'Newsletter heading' })}
          {d.F({ key: 'footer.newsletterText', label: 'Newsletter text' })}
          {d.F({ key: 'footer.showPaymentBadges', label: 'Show payment method badges', type: 'checkbox', span: 2 })}
          {d.F({ key: 'footer.bottomText', label: 'Bottom line text (next to the copyright)', span: 2 })}
        </div>
      </Section>
      <SaveBar d={d} validate={(dr) => (dr.headerMenu.some((m) => !m.label.trim()) ? 'Every menu item needs a label.' : null)} />
    </>
  );
}
