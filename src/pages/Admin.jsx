import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { CATEGORIES, FRANCHISES, describe, getBrands, isPreorder, isSoldOut, saveProduct, useProducts } from '../data/products';
import { ORDER_STATUSES, setOrderStatus } from '../services/api';
import { db, useCollection } from '../services/db';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import OrderView from '../components/OrderView';
import { Modal, Stars } from '../components/ui';
import { EditIcon, PlusIcon, TrashIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';

const TABS = ['Dashboard', 'Products', 'Orders', 'Coupons', 'Reviews', 'Customers', 'Inbox', 'Settings'];
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('Dashboard');
  useTitle('Admin');

  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (!isAdmin) {
    return (
      <div className="container narrow center-page">
        <h1>Admins only</h1>
        <p className="muted">Log in with an admin account to manage the store.</p>
        <Link to="/" className="btn">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container admin page">
      <div className="admin-head">
        <h1>Admin Panel</h1>
        <span className="muted small">Demo backend · data is saved in this browser</span>
      </div>
      <div className="tabs left admin-tabs">
        {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Dashboard' && <Dashboard go={setTab} />}
      {tab === 'Products' && <Products />}
      {tab === 'Orders' && <Orders />}
      {tab === 'Coupons' && <Coupons />}
      {tab === 'Reviews' && <ReviewsAdmin />}
      {tab === 'Customers' && <Customers />}
      {tab === 'Inbox' && <Inbox />}
      {tab === 'Settings' && <Settings />}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ go }) {
  const products = useProducts();
  const orders = useCollection('orders');
  const messages = useCollection('messages');
  const active = orders.filter((o) => o.status !== 'Cancelled');
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed');
  const lowStock = products.filter((p) => !isPreorder(p) && p.stock <= 2);

  const counts = {};
  active.forEach((o) => o.items.forEach((i) => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <>
      <div className="stat-cards">
        <div className="stat"><span className="muted small">Revenue</span><strong>{formatPrice(revenue)}</strong></div>
        <button className="stat" onClick={() => go('Orders')}><span className="muted small">Orders</span><strong>{orders.length}</strong><span className="muted small">{pending.length} to process</span></button>
        <button className="stat" onClick={() => go('Products')}><span className="muted small">Products</span><strong>{products.length}</strong><span className="muted small">{lowStock.length} low / sold out</span></button>
        <button className="stat" onClick={() => go('Inbox')}><span className="muted small">Unread messages</span><strong>{messages.filter((m) => !m.read).length}</strong></button>
      </div>
      <div className="admin-cols">
        <div className="panel">
          <h3>Low stock</h3>
          {lowStock.length ? lowStock.map((p) => (
            <div key={p.id} className="row-between small"><span>{p.name}</span><span className={p.stock === 0 ? 'error-text' : ''}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span></div>
          )) : <p className="muted">All good.</p>}
        </div>
        <div className="panel">
          <h3>Best sellers</h3>
          {top.length ? top.map(([name, qty]) => <div key={name} className="row-between small"><span>{name}</span><strong>{qty} sold</strong></div>) : <p className="muted">No sales yet. Place a test order from the shop.</p>}
        </div>
        <div className="panel">
          <h3>Latest orders</h3>
          {orders.slice(-5).reverse().map((o) => (
            <div key={o.id} className="row-between small"><span>#{o.id} · {o.customer.name}</span><span>{formatPrice(o.total)}</span></div>
          ))}
          {!orders.length && <p className="muted">No orders yet.</p>}
        </div>
      </div>
    </>
  );
}

// ── Products ────────────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: '', brand: '', category: CATEGORIES[0], franchise: FRANCHISES[0], price: '', compareAt: '', status: 'instock',
  stock: 5, eta: '', releaseDate: '', isNew: false, featured: false, image: '', description: '',
};

function Products() {
  const products = useProducts();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const list = products.filter((p) => [p.name, p.brand, p.category].join(' ').toLowerCase().includes(q.toLowerCase()));

  const remove = (p) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) db.remove('products', p.id);
  };

  return (
    <>
      <div className="admin-toolbar">
        <input className="input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn" onClick={() => setEditing(EMPTY_PRODUCT)}><PlusIcon width={16} height={16} /> Add Product</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th></th><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><span className="thumb"><ProductImage product={p} /></span></td>
                <td><Link to={`/products/${p.slug}`} className="strong-link">{p.name}</Link><div className="muted small">{p.brand} · {p.category}</div></td>
                <td>{formatPrice(p.price)}{p.compareAt ? <div className="muted small strike">{formatPrice(p.compareAt)}</div> : null}</td>
                <td>
                  {isPreorder(p) ? '—' : (
                    <input
                      className="input stock-input"
                      type="number"
                      min="0"
                      value={p.stock}
                      onChange={(e) => db.update('products', p.id, { stock: Math.max(0, Number(e.target.value)) })}
                      aria-label={`Stock for ${p.name}`}
                    />
                  )}
                </td>
                <td><span className={`status-pill ${isPreorder(p) ? 's-confirmed' : isSoldOut(p) ? 's-cancelled' : 's-delivered'}`}>{isPreorder(p) ? 'Pre-order' : isSoldOut(p) ? 'Sold out' : 'In stock'}</span></td>
                <td className="actions">
                  <button className="icon-btn sm" onClick={() => setEditing(p)} aria-label="Edit"><EditIcon width={16} height={16} /></button>
                  <button className="icon-btn sm danger" onClick={() => remove(p)} aria-label="Delete"><TrashIcon width={16} height={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} brands={getBrands(products)} />}
    </>
  );
}

// Resize an uploaded photo so it fits comfortably in browser storage.
function resizeImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = URL.createObjectURL(file);
  });
}

function ProductForm({ initial, onClose, brands }) {
  const [f, setF] = useState({ ...initial, compareAt: initial.compareAt || '', eta: initial.eta || '', releaseDate: initial.releaseDate || '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setF({ ...f, image: await resizeImage(file) });
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const price = Number(f.price);
    const compareAt = f.compareAt ? Number(f.compareAt) : null;
    if (!price || price < 0) return setError('Enter a valid price.');
    if (compareAt && compareAt <= price) return setError('"Was" price must be higher than the price (or leave it empty).');
    try {
      saveProduct({
        ...f,
        name: f.name.trim(),
        brand: f.brand.trim(),
        price,
        compareAt,
        stock: Number(f.stock) || 0,
        eta: f.status === 'preorder' ? f.eta : null,
        releaseDate: f.status === 'preorder' ? f.releaseDate || null : null,
        description: f.description.trim() || describe(f.name.trim(), f.brand.trim(), f.franchise),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open onClose={onClose} title={initial.id ? 'Edit product' : 'Add product'} className="wide-modal">
      <form className="stack" onSubmit={submit}>
        <h2>{initial.id ? 'Edit Product' : 'Add Product'}</h2>
        <div className="form-grid">
          <label className="field span-2"><span className="field-label">Name</span><input className="input" required value={f.name} onChange={set('name')} /></label>
          <label className="field"><span className="field-label">Brand</span>
            <input className="input" required list="brand-list" value={f.brand} onChange={set('brand')} />
            <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          </label>
          <label className="field"><span className="field-label">Category</span>
            <select className="input" value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="field"><span className="field-label">Franchise</span>
            <select className="input" value={f.franchise} onChange={set('franchise')}>{FRANCHISES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="field"><span className="field-label">Status</span>
            <select className="input" value={f.status} onChange={set('status')}><option value="instock">In stock</option><option value="preorder">Pre-order</option></select>
          </label>
          <label className="field"><span className="field-label">Price (Rs.)</span><input className="input" required type="number" min="0" value={f.price} onChange={set('price')} /></label>
          <label className="field"><span className="field-label">Was price (for sale, optional)</span><input className="input" type="number" min="0" value={f.compareAt} onChange={set('compareAt')} /></label>
          {f.status === 'instock' ? (
            <label className="field"><span className="field-label">Stock</span><input className="input" type="number" min="0" value={f.stock} onChange={set('stock')} /></label>
          ) : (
            <>
              <label className="field"><span className="field-label">Release (text)</span><input className="input" placeholder="e.g. Q2 2027" value={f.eta} onChange={set('eta')} /></label>
              <label className="field"><span className="field-label">Release date (countdown)</span><input className="input" type="date" value={f.releaseDate} onChange={set('releaseDate')} /></label>
            </>
          )}
          <label className="check"><input type="checkbox" checked={f.isNew} onChange={set('isNew')} /> New arrival</label>
          <label className="check"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Featured (Collector's Picks)</label>
          <div className="field span-2">
            <span className="field-label">Photo</span>
            <div className="image-field">
              <span className="thumb big">{f.name || f.image ? <ProductImage product={{ ...f, id: 0 }} /> : null}</span>
              <div className="stack">
                <input type="file" accept="image/*" onChange={upload} />
                <input className="input" placeholder="…or paste an image URL" value={f.image.startsWith('data:') ? '' : f.image} onChange={set('image')} />
                {f.image && <button type="button" className="link-btn" onClick={() => setF({ ...f, image: '' })}>Remove photo</button>}
              </div>
            </div>
          </div>
          <label className="field span-2"><span className="field-label">Description (optional)</span><textarea className="input" rows="3" value={f.description} onChange={set('description')} /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="row-gap">
          <button className="btn">Save Product</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Orders ──────────────────────────────────────────────────────────────────
function Orders() {
  const orders = useCollection('orders');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(null);
  const list = [...orders].reverse().filter((o) => filter === 'All' || o.status === filter);
  const current = open && orders.find((o) => o.id === open);

  return (
    <>
      <div className="admin-toolbar">
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {['All', ...ORDER_STATUSES].map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="muted small">{list.length} orders</span>
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong><div className="muted small">{fmtDate(o.createdAt)}</div></td>
                  <td>{o.customer.name}<div className="muted small">{o.customer.phone} · {o.address.district}</div></td>
                  <td>{formatPrice(o.total)}{o.payLater > 0 && <div className="muted small">{formatPrice(o.payLater)} due later</div>}</td>
                  <td className="small">{o.payment.method.toUpperCase()}<div className="muted small">{o.payment.status}</div></td>
                  <td>
                    <select className="input" value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} aria-label={`Status for ${o.id}`}>
                      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="link-btn" onClick={() => setOpen(o.id)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="muted">No orders yet. Place a test order from the shop to see it here.</p>}
      <Modal open={Boolean(current)} onClose={() => setOpen(null)} title="Order details" className="wide-modal">
        {current && (
          <>
            <OrderView order={current} />
            <p className="small"><strong>Email:</strong> {current.customer.email}</p>
            <a className="btn btn-sm" href={`https://wa.me/${current.customer.phone.replace(/^0/, '94').replace(/\D/g, '')}`} target="_blank" rel="noreferrer">Message on WhatsApp</a>
          </>
        )}
      </Modal>
    </>
  );
}

// ── Coupons ─────────────────────────────────────────────────────────────────
function Coupons() {
  const coupons = useCollection('coupons');
  const [f, setF] = useState({ code: '', type: 'percent', value: '', minSubtotal: '', note: '' });
  const [error, setError] = useState('');

  const add = (e) => {
    e.preventDefault();
    const code = f.code.trim().toUpperCase();
    if (coupons.some((c) => c.code === code)) return setError('That code already exists.');
    db.insert('coupons', { code, type: f.type, value: Number(f.value), minSubtotal: Number(f.minSubtotal) || 0, note: f.note, active: true });
    setF({ code: '', type: 'percent', value: '', minSubtotal: '', note: '' });
    setError('');
  };

  return (
    <>
      <form className="admin-toolbar wrap" onSubmit={add}>
        <input className="input" required placeholder="CODE" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />
        <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">% off</option><option value="fixed">Rs. off</option></select>
        <input className="input" required type="number" min="1" placeholder={f.type === 'percent' ? '10' : '1000'} value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        <input className="input" type="number" min="0" placeholder="Min. order (Rs.)" value={f.minSubtotal} onChange={(e) => setF({ ...f, minSubtotal: e.target.value })} />
        <input className="input" placeholder="Note (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <button className="btn"><PlusIcon width={16} height={16} /> Add Coupon</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Code</th><th>Discount</th><th>Min. order</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong><div className="muted small">{c.note}</div></td>
                <td>{c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td>{c.minSubtotal ? formatPrice(c.minSubtotal) : '—'}</td>
                <td><input type="checkbox" checked={c.active} onChange={(e) => db.update('coupons', c.id, { active: e.target.checked })} aria-label={`Activate ${c.code}`} /></td>
                <td className="actions"><button className="icon-btn sm danger" onClick={() => db.remove('coupons', c.id)} aria-label="Delete"><TrashIcon width={16} height={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Reviews ─────────────────────────────────────────────────────────────────
function ReviewsAdmin() {
  const reviews = useCollection('reviews');
  const products = useProducts();
  const list = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Review</th><th>Product</th><th>Date</th><th></th></tr></thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td><Stars value={r.rating} size={13} /> <strong>{r.title}</strong><div className="small">{r.text}</div><div className="muted small">{r.name}</div></td>
              <td className="small">{products.find((p) => p.id === r.productId)?.name || '—'}</td>
              <td className="small">{fmtDate(r.createdAt)}</td>
              <td className="actions">
                <label className="check small"><input type="checkbox" checked={r.verified} onChange={(e) => db.update('reviews', r.id, { verified: e.target.checked })} /> Verified</label>
                <button className="icon-btn sm danger" onClick={() => db.remove('reviews', r.id)} aria-label="Delete"><TrashIcon width={16} height={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : <p className="muted">No reviews yet.</p>;
}

// ── Customers ───────────────────────────────────────────────────────────────
function Customers() {
  const users = useCollection('users');
  const orders = useCollection('orders');
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spent</th><th>Coins</th><th>Role</th></tr></thead>
        <tbody>
          {users.map((u) => {
            const mine = orders.filter((o) => o.userId === u.id && o.status !== 'Cancelled');
            return (
              <tr key={u.id}>
                <td><strong>{u.name}</strong><div className="muted small">Joined {fmtDate(u.createdAt)}</div></td>
                <td className="small">{u.email}<br />{u.phone}</td>
                <td>{mine.length}</td>
                <td>{formatPrice(mine.reduce((s, o) => s + o.total, 0))}</td>
                <td>{u.coins || 0}</td>
                <td><span className={`status-pill ${u.role === 'admin' ? 's-confirmed' : ''}`}>{u.role}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Inbox ───────────────────────────────────────────────────────────────────
function Inbox() {
  const messages = useCollection('messages');
  const notify = useCollection('notifyRequests');
  const subscribers = useCollection('subscribers');

  const exportCsv = () => {
    const csv = ['email,date', ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'subscribers.csv';
    a.click();
  };

  return (
    <div className="admin-cols">
      <div className="panel span-2">
        <h3>Contact messages ({messages.length})</h3>
        {[...messages].reverse().map((m) => (
          <div key={m.id} className={`message ${m.read ? '' : 'unread'}`}>
            <div className="row-between">
              <strong>{m.name}</strong>
              <span className="muted small">{fmtDate(m.createdAt)}</span>
            </div>
            <p className="small">{m.message}</p>
            <div className="row-gap small">
              <a className="link" href={`mailto:${m.email}`}>{m.email}</a>
              {m.phone && <span className="muted">{m.phone}</span>}
              <button className="link-btn" onClick={() => db.update('messages', m.id, { read: !m.read })}>{m.read ? 'Mark unread' : 'Mark read'}</button>
              <button className="link-btn" onClick={() => db.remove('messages', m.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!messages.length && <p className="muted">No messages yet.</p>}
      </div>
      <div className="panel">
        <h3>Back-in-stock requests ({notify.length})</h3>
        {[...notify].reverse().map((n) => (
          <div key={n.id} className="row-between small">
            <span><strong>{n.contact}</strong><br /><span className="muted">{n.productName}</span></span>
            <button className="icon-btn sm danger" onClick={() => db.remove('notifyRequests', n.id)} aria-label="Delete"><TrashIcon width={14} height={14} /></button>
          </div>
        ))}
        {!notify.length && <p className="muted">None yet.</p>}
      </div>
      <div className="panel">
        <div className="row-between"><h3>Subscribers ({subscribers.length})</h3>{subscribers.length > 0 && <button className="link-btn" onClick={exportCsv}>Export CSV</button>}</div>
        {[...subscribers].reverse().slice(0, 30).map((s) => <div key={s.id} className="small">{s.email}</div>)}
        {!subscribers.length && <p className="muted">None yet.</p>}
      </div>
    </div>
  );
}

// ── Settings ────────────────────────────────────────────────────────────────
function Settings() {
  const [done, setDone] = useState('');
  const reset = (collections, label) => {
    if (!window.confirm(`Reset ${label}? This cannot be undone.`)) return;
    collections.forEach((c) => db.reset(c));
    setDone(`${label} reset.`);
  };
  return (
    <div className="panel narrow-form">
      <h3>Store settings</h3>
      <p className="muted small">Store name, contact details, delivery and payment settings live in <code>src/config/site.js</code>.</p>
      <p className="muted small">PayHere: {SITE.payhere.merchantId ? `merchant ${SITE.payhere.merchantId}${SITE.payhere.sandbox ? ' (sandbox)' : ''}` : 'not connected — card payments are simulated'}.</p>
      <h3>Demo data</h3>
      <div className="row-gap wrap">
        <button className="btn btn-outline" onClick={() => reset(['products'], 'Products')}>Reset products</button>
        <button className="btn btn-outline" onClick={() => reset(['orders'], 'Orders')}>Clear orders</button>
        <button className="btn btn-outline" onClick={() => reset(['products', 'orders', 'coupons', 'reviews', 'subscribers', 'notifyRequests', 'messages'], 'All store data')}>Reset everything</button>
      </div>
      {done && <p className="notice notice-ok">{done}</p>}
    </div>
  );
}
