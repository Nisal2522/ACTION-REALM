import { useState } from 'react';
import { SITE } from '../config/site';
import { getProducts } from '../data/products';
import { CONTENT_COLLECTIONS } from '../data/content';
import { saveSettings } from '../services/settings';
import { db } from '../services/db';
import { loadSampleData } from '../data/sampleData';
import { Field, ObjectList, StringList } from './fields';

const SECTIONS = ['General', 'Contact & social', 'Stores & bank', 'Delivery & payments', 'Loyalty & pre-orders', 'Sale & popup', 'Catalogue', 'Integrations', 'Data'];

// Read / write nested keys like "payments.card".
const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const setPath = (obj, path, value) => {
  const next = structuredClone(obj);
  const keys = path.split('.');
  let o = next;
  keys.slice(0, -1).forEach((k) => { o = o[k]; });
  o[keys.at(-1)] = value;
  return next;
};

export default function SettingsAdmin() {
  const [section, setSection] = useState('General');
  const [draft, setDraft] = useState(() => structuredClone(SITE));
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const dirty = JSON.stringify(draft) !== JSON.stringify(SITE);
  const F = (field) => (
    <Field key={field.key} field={field} value={getPath(draft, field.key)} onChange={(v) => { setDraft(setPath(draft, field.key, v)); setStatus(''); }} />
  );

  const save = () => {
    if (!draft.payments.card && !draft.payments.bank && !draft.payments.cod) return setError('Turn on at least one payment method.');
    if (!draft.name.trim()) return setError('Store name cannot be empty.');
    if (!draft.categories.length || !draft.franchises.length) return setError('Keep at least one category and one franchise.');
    setError('');
    try {
      saveSettings(draft);
      setStatus('Saved. Changes are live on the website.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="settings-admin">
      <div className="tabs left sub-tabs">
        {SECTIONS.map((s) => <button key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>{s}</button>)}
      </div>

      <div className="panel">
        {section === 'General' && (
          <div className="form-grid">
            {F({ key: 'name', label: 'Store name', required: true })}
            {F({ key: 'tagline', label: 'Tagline (under the name)' })}
            {F({ key: 'description', label: 'Short description (footer & search engines)', type: 'textarea', rows: 2 })}
            {F({ key: 'url', label: 'Website address', placeholder: 'https://actionrealm.lk', help: 'Used for share links.' })}
          </div>
        )}

        {section === 'Contact & social' && (
          <div className="form-grid">
            {F({ key: 'phone', label: 'Phone (shown on site)' })}
            {F({ key: 'email', label: 'Email', type: 'email' })}
            {F({ key: 'whatsapp', label: 'WhatsApp number', help: 'Country code + number, digits only — e.g. 94771234567' })}
            {F({ key: 'socials.instagram', label: 'Instagram link' })}
            {F({ key: 'socials.facebook', label: 'Facebook link' })}
            {F({ key: 'socials.youtube', label: 'YouTube link' })}
          </div>
        )}

        {section === 'Stores & bank' && (
          <div className="stack">
            <h3>Store locations</h3>
            <ObjectList
              value={draft.stores}
              onChange={(v) => setDraft({ ...draft, stores: v })}
              itemLabel="store"
              newItem={{ city: '', address: '', hours: '', map: '' }}
              fields={[
                { key: 'city', label: 'City' },
                { key: 'hours', label: 'Opening hours' },
                { key: 'address', label: 'Address', span: 2 },
                { key: 'map', label: 'Google Maps link', span: 2 },
              ]}
            />
            <h3>Bank transfer details</h3>
            <div className="form-grid">
              {F({ key: 'bank.name', label: 'Bank' })}
              {F({ key: 'bank.branch', label: 'Branch' })}
              {F({ key: 'bank.accountName', label: 'Account name' })}
              {F({ key: 'bank.accountNumber', label: 'Account number' })}
            </div>
          </div>
        )}

        {section === 'Delivery & payments' && (
          <div className="stack">
            <div className="form-grid">
              {F({ key: 'deliveryFee', label: 'Delivery fee per order (Rs.)', type: 'number', min: 0, help: '0 = free delivery' })}
              {F({ key: 'freeDeliveryOver', label: 'Free delivery on orders over (Rs.)', type: 'number', min: 0, help: '0 = never free (when a fee is set)' })}
              {F({ key: 'deliveryDays.colombo', label: 'Delivery time — Colombo & Gampaha (days)', placeholder: '1–2' })}
              {F({ key: 'deliveryDays.other', label: 'Delivery time — other districts (days)', placeholder: '2–4' })}
              {F({ key: 'installmentThreshold', label: '0% installments on orders over (Rs.)', type: 'number', min: 0 })}
            </div>
            <h3>Payment methods</h3>
            <div className="form-grid">
              {F({ key: 'payments.card', label: 'Card payments (PayHere)', type: 'checkbox', span: 2 })}
              {F({ key: 'payments.bank', label: 'Bank transfer', type: 'checkbox', span: 2 })}
              {F({ key: 'payments.cod', label: 'Cash on delivery (in-stock orders only)', type: 'checkbox', span: 2 })}
            </div>
          </div>
        )}

        {section === 'Loyalty & pre-orders' && (
          <div className="form-grid">
            {F({ key: 'coinsName', label: 'Loyalty coins name' })}
            {F({ key: 'coinsRate', label: 'Coins earned per Rs. 1 spent', type: 'number', step: 0.001, min: 0, help: `0.01 = 1 coin per Rs. 100. Now: ${Math.round((draft.coinsRate || 0) * 10000)} coins on a Rs. 10,000 order.` })}
            {F({ key: 'coinValue', label: 'Value of 1 coin at checkout (Rs.)', type: 'number', min: 0 })}
            {F({ key: 'depositRate', label: 'Pre-order deposit (0–1)', type: 'number', step: 0.05, min: 0, help: `0.3 = customers pay ${Math.round((draft.depositRate || 0) * 100)}% now and the rest on arrival.` })}
          </div>
        )}

        {section === 'Sale & popup' && (
          <div className="stack">
            <div className="form-grid">
              {F({ key: 'saleEndsAt', label: 'Sale countdown ends', type: 'datetime-local', help: 'Clear it to hide the countdown. Sale prices are set per product ("Was price").' })}
            </div>
            <h3>Newsletter popup</h3>
            <div className="form-grid">
              {F({ key: 'popup.enabled', label: 'Show the popup to new visitors', type: 'checkbox', span: 2 })}
              {F({ key: 'popup.title', label: 'Popup headline' })}
              {F({ key: 'popup.delaySeconds', label: 'Show after (seconds)', type: 'number', min: 0 })}
              {F({ key: 'popup.text', label: 'Popup text', type: 'textarea', rows: 2 })}
              {F({ key: 'popup.code', label: 'Coupon code given after sign-up', help: 'Must exist under Coupons. Leave empty to give no code.' })}
            </div>
          </div>
        )}

        {section === 'Catalogue' && (
          <div className="stack">
            <h3>Categories</h3>
            <p className="muted small">Shown in the menu, footer, filters and the product form. Products keep their category if you rename one here, so update them too.</p>
            <StringList value={draft.categories} onChange={(v) => setDraft({ ...draft, categories: v })} placeholder="New category" />
            <h3>Franchises</h3>
            <StringList value={draft.franchises} onChange={(v) => setDraft({ ...draft, franchises: v })} placeholder="New franchise" />
            <UsageNote categories={draft.categories} franchises={draft.franchises} />
          </div>
        )}

        {section === 'Integrations' && (
          <div className="stack">
            <h3>PayHere card payments</h3>
            <div className="form-grid">
              {F({ key: 'payhere.merchantId', label: 'Merchant ID' })}
              {F({ key: 'payhere.sandbox', label: 'Sandbox (test) mode', type: 'checkbox' })}
              {F({ key: 'payhere.hashEndpoint', label: 'Hash server URL', span: 2, help: 'A server that returns the payment hash. Never enter your merchant secret here.' })}
            </div>
            <p className="muted small">Status: {SITE.payhere.merchantId && SITE.payhere.hashEndpoint ? 'connected' : 'not connected — card payments are simulated'}.</p>
            <h3>Analytics</h3>
            <div className="form-grid">
              {F({ key: 'analytics.gaId', label: 'Google Analytics 4 ID', placeholder: 'G-XXXXXXX' })}
              {F({ key: 'analytics.metaPixelId', label: 'Meta (Facebook) Pixel ID' })}
            </div>
            <p className="muted small">Analytics changes take effect after the page is reloaded.</p>
          </div>
        )}

        {section === 'Data' && <DataTools />}
      </div>

      {section !== 'Data' && (
        <div className="save-bar">
          {error && <p className="error">{error}</p>}
          {status && <p className="notice notice-ok no-margin">{status}</p>}
          <button className="btn btn-outline" disabled={!dirty} onClick={() => { setDraft(structuredClone(SITE)); setError(''); }}>Discard changes</button>
          <button className="btn" disabled={!dirty} onClick={save}>Save settings</button>
        </div>
      )}
    </div>
  );
}

function UsageNote({ categories, franchises }) {
  const products = getProducts();
  const orphanCats = [...new Set(products.map((p) => p.category))].filter((c) => !categories.includes(c));
  const orphanFr = [...new Set(products.map((p) => p.franchise))].filter((f) => !franchises.includes(f));
  if (!orphanCats.length && !orphanFr.length) return null;
  return (
    <p className="notice notice-low small">
      Some products still use {[...orphanCats, ...orphanFr].join(', ')}. Edit those products so they appear in the right menus.
    </p>
  );
}

function DataTools() {
  const [done, setDone] = useState('');
  const reset = (collections, label) => {
    if (!window.confirm(`Reset ${label}? This cannot be undone.`)) return;
    collections.forEach((c) => db.reset(c));
    setDone(`${label} reset.`);
  };

  const backup = () => {
    const all = ['settings', 'products', 'orders', 'users', 'coupons', 'reviews', 'subscribers', 'notifyRequests', 'messages', ...CONTENT_COLLECTIONS];
    const data = Object.fromEntries(all.map((c) => [c, db.all(c)]));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `action-realm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const restore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!window.confirm('Replace all store data with this backup?')) return;
      Object.entries(data).forEach(([c, docs]) => Array.isArray(docs) && db.replaceAll(c, docs));
      setDone('Backup restored.');
    } catch {
      setDone('That file is not a valid backup.');
    }
  };

  let used = 0;
  try {
    used = Object.keys(localStorage).reduce((s, k) => s + (localStorage.getItem(k)?.length || 0), 0);
  } catch {
    /* storage unavailable */
  }

  return (
    <div className="stack">
      <h3>Backup</h3>
      <p className="muted small">Download everything (products, orders, customers, content, settings) as one file, or restore a backup. Storage used: about {(used / 1024 / 1024).toFixed(1)} MB of ~5 MB.</p>
      <div className="row-gap">
        <button className="btn btn-outline" onClick={backup}>Download backup</button>
        <label className="btn btn-outline">Restore backup<input type="file" accept="application/json" hidden onChange={restore} /></label>
      </div>
      <h3>Sample data</h3>
      <p className="muted small">Fill the store with 42 sample orders, 8 customers, messages, subscribers and restock requests — useful for demos. This replaces current orders and inbox items.</p>
      <div className="row-gap">
        <button className="btn" onClick={() => { if (window.confirm('Replace current orders and inbox with sample data?')) { loadSampleData(); setDone('Sample data loaded.'); } }}>Load sample data</button>
      </div>
      <h3>Reset to starting data</h3>
      <div className="row-gap">
        <button className="btn btn-outline" onClick={() => reset(['products'], 'Products')}>Reset products</button>
        <button className="btn btn-outline" onClick={() => reset(CONTENT_COLLECTIONS, 'Homepage & pages content')}>Reset content</button>
        <button className="btn btn-outline" onClick={() => reset(['settings'], 'Settings')}>Reset settings</button>
        <button className="btn btn-outline" onClick={() => reset(['orders'], 'Orders')}>Clear orders</button>
        <button className="btn btn-outline danger-btn" onClick={() => reset(['settings', 'products', 'orders', 'coupons', 'reviews', 'subscribers', 'notifyRequests', 'messages', ...CONTENT_COLLECTIONS], 'Everything (except accounts)')}>Reset everything</button>
      </div>
      {done && <p className="notice notice-ok">{done}</p>}
    </div>
  );
}
