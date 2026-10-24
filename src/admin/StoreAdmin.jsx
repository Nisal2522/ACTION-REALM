import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { describe, getBrands, getCategories, getFranchises, isPreorder, isSoldOut, saveProduct, useProducts } from '../data/products';
import { ORDER_STATUSES, setOrderStatus, statusClass, statusLabel, statusText } from '../services/api';
import { db, useCollection } from '../services/db';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import OrderView from '../components/OrderView';
import { Stars } from '../components/ui';
import SidePanel from './SidePanel';
import PageActions from './PageActions';
import Pagination from './Pagination';
import ExcelButton, { downloadExcel } from './ExcelExport';
import { FilterSelect, SearchInput } from './Toolbar';
import { BoxIcon, EditIcon, PlusIcon, TagIcon, TrashIcon, WhatsAppIcon } from '../components/Icons';
import { Field, MultiImageInput, fmtDate } from './fields';
import ListEditor from './ListEditor';

export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Awaiting transfer', 'Pay on delivery', 'Refunded'];
// Older demo orders were saved as "Paid (demo)"; treat them as "Paid".
const cleanPayment = (s) => (s === 'Paid (demo)' ? 'Paid' : s);

// ── Products ────────────────────────────────────────────────────────────────
const emptyProduct = () => ({
  name: '', brand: '', category: getCategories()[0], franchise: getFranchises()[0], price: '', compareAt: '', status: 'instock',
  stock: 5, eta: '', releaseDate: '', isNew: false, featured: false, image: '', description: '',
});

export function Products() {
  const products = useProducts();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useSearchParams();
  const openId = params.get('open');
  const [editing, setEditing] = useState(() => (openId && products.find((x) => String(x.id) === openId)) || null);

  useEffect(() => {
    const found = openId && products.find((x) => String(x.id) === openId);
    if (found) setEditing(found);
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeEditor = () => {
    setEditing(null);
    if (openId) setParams({ tab: 'products' }, { replace: true });
  };

  const list = products.filter((p) =>
    [p.name, p.brand, p.category].join(' ').toLowerCase().includes(q.toLowerCase())
    && (!cat || p.category === cat)
    && (!status || (status === 'preorder' ? isPreorder(p) : status === 'soldout' ? isSoldOut(p) : status === 'sale' ? p.compareAt > p.price : !isPreorder(p) && !isSoldOut(p))));

  // Back to page 1 when the filters change; stay on a valid page if items are deleted.
  useEffect(() => {
    setPage(1);
  }, [q, cat, status, pageSize]);
  const lastPage = Math.max(1, Math.ceil(list.length / pageSize));
  const currentPage = Math.min(page, lastPage);
  const visible = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const remove = (p) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) db.remove('products', p.id);
  };

  return (
    <>
      <PageActions>
        <button className="btn" onClick={() => setEditing(emptyProduct())}><PlusIcon width={16} height={16} /> Add Product</button>
      </PageActions>
      <div className="admin-toolbar wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search products, brands…" />
        <FilterSelect
          label="Category"
          icon={BoxIcon}
          value={cat}
          onChange={setCat}
          options={[{ value: '', label: 'All categories' }, ...getCategories().map((c) => ({ value: c, label: c }))]}
        />
        <FilterSelect
          label="Status"
          icon={TagIcon}
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'instock', label: 'In stock' },
            { value: 'preorder', label: 'Pre-order' },
            { value: 'soldout', label: 'Sold out' },
            { value: 'sale', label: 'On sale' },
          ]}
        />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th /><th>Product</th><th>Price</th><th className="center-col">Stock</th><th>Status</th><th>Tags</th><th className="actions-col">Actions</th></tr></thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td><span className="thumb"><ProductImage product={p} /></span></td>
                <td><Link to={`/products/${p.slug}`} className="strong-link" target="_blank">{p.name}</Link><div className="muted small">{p.brand} · {p.category} · {p.franchise}</div></td>
                <td>{formatPrice(p.price)}{p.compareAt ? <div className="muted small strike">{formatPrice(p.compareAt)}</div> : null}</td>
                <td className="center-col">
                  {isPreorder(p) ? <span className="muted small">{p.eta || 'TBA'}</span> : (
                    <input className="input stock-input" type="number" min="0" value={p.stock}
                      onChange={(e) => db.update('products', p.id, { stock: Math.max(0, Number(e.target.value)) })} aria-label={`Stock for ${p.name}`} />
                  )}
                </td>
                <td><span className={`status-pill ${isPreorder(p) ? 's-confirmed' : isSoldOut(p) ? 's-cancelled' : 's-delivered'}`}>{isPreorder(p) ? 'Pre-order' : isSoldOut(p) ? 'Sold out' : 'In stock'}</span></td>
                <td className="small">
                  <label className="check"><input type="checkbox" checked={Boolean(p.featured)} onChange={(e) => db.update('products', p.id, { featured: e.target.checked })} /> Featured</label>
                  <label className="check"><input type="checkbox" checked={Boolean(p.isNew)} onChange={(e) => db.update('products', p.id, { isNew: e.target.checked })} /> New</label>
                </td>
                <td className="actions">
                  <button className="icon-btn sm" onClick={() => setEditing(p)} aria-label="Edit" title="Edit"><EditIcon width={16} height={16} /></button>
                  <button className="icon-btn sm danger" onClick={() => remove(p)} aria-label="Delete" title="Delete"><TrashIcon width={16} height={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="muted small table-empty">No products match these filters.</p>}
        <Pagination page={currentPage} pageSize={pageSize} total={list.length} onPage={setPage} onPageSize={setPageSize} />
      </div>
      {editing && <ProductForm initial={editing} onClose={closeEditor} brands={getBrands(products)} />}
    </>
  );
}

function ProductForm({ initial, onClose, brands }) {
  const [f, setF] = useState({
    ...initial,
    compareAt: initial.compareAt || '',
    eta: initial.eta || '',
    releaseDate: initial.releaseDate || '',
    images: initial.images?.length ? initial.images : initial.image ? [initial.image] : [],
  });
  const [error, setError] = useState('');
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const field = (def) => <Field key={def.key} field={def} value={f[def.key]} onChange={set(def.key)} />;

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
        images: f.images,
        image: f.images[0] || '', // main photo used on cards, cart and search
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
    <SidePanel
      open
      wide
      onClose={onClose}
      onSubmit={submit}
      title={initial.id ? 'Edit product' : 'Add product'}
      subtitle={initial.id ? initial.name : 'Fill in the details and save to publish it in the shop.'}
      footer={(
        <>
          {error && <p className="error sp-error">{error}</p>}
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn">Save product</button>
        </>
      )}
    >
        <div className="form-grid">
          {field({ key: 'name', label: 'Name', required: true, span: 2 })}
          <label className="field"><span className="field-label">Brand</span>
            <input className="input" required list="brand-list" value={f.brand} onChange={(e) => set('brand')(e.target.value)} />
            <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
          </label>
          {field({ key: 'category', label: 'Category', type: 'select', options: getCategories() })}
          {field({ key: 'franchise', label: 'Franchise', type: 'select', options: getFranchises() })}
          {field({ key: 'status', label: 'Status', type: 'select', options: [{ value: 'instock', label: 'In stock' }, { value: 'preorder', label: 'Pre-order' }] })}
          {field({ key: 'price', label: 'Price (Rs.)', type: 'number', min: 0, required: true })}
          {field({ key: 'compareAt', label: 'Was price (for sale, optional)', type: 'number', min: 0 })}
          {f.status === 'instock'
            ? field({ key: 'stock', label: 'Stock', type: 'number', min: 0 })
            : (
              <>
                {field({ key: 'eta', label: 'Release (text)', placeholder: 'e.g. Q2 2027' })}
                {field({ key: 'releaseDate', label: 'Release date (countdown)', type: 'date' })}
              </>
            )}
          <div className="check-row span-2">
            {field({ key: 'isNew', label: 'New arrival', type: 'checkbox' })}
            {field({ key: 'featured', label: "Featured (Collector's Picks)", type: 'checkbox' })}
          </div>
          <div className="field span-2">
            <span className="field-label">Photos</span>
            <MultiImageInput value={f.images} onChange={set('images')} max={900} />
          </div>
          {field({ key: 'description', label: 'Description (leave empty for an automatic one)', type: 'textarea', rows: 3 })}
        </div>
    </SidePanel>
  );
}

// ── Orders ──────────────────────────────────────────────────────────────────
const METHOD_LABELS = { card: 'Card', bank: 'Bank transfer', cod: 'Cash on delivery' };
const paymentTone = (status) => (/paid/i.test(status) ? 's-delivered' : /refund/i.test(status) ? 's-cancelled' : 's-shipped');

export function Orders() {
  const orders = useCollection('orders');
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [params, setParams] = useSearchParams();
  const [open, setOpenState] = useState(() => params.get('open'));
  const needle = q.trim().toLowerCase();

  useEffect(() => {
    if (params.get('open')) setOpenState(params.get('open'));
  }, [params]);
  const setOpen = (id) => {
    setOpenState(id);
    if (!id && params.get('open')) setParams({ tab: 'orders' }, { replace: true });
  };
  const list = [...orders].reverse().filter((o) =>
    (filter === 'All' || o.status === filter)
    && (!needle || [o.id, o.customer.name, o.customer.phone, o.customer.email, o.shipmentNo, o.remarks].join(' ').toLowerCase().includes(needle)));
  const current = open && orders.find((o) => o.id === open);

  const exportExcel = () => downloadExcel('orders', [
    ['Order', 'Date', 'Customer', 'Phone', 'Email', 'District', 'Shipment No', 'Total (Rs.)', 'Payment method', 'Payment status', 'Status', 'Remarks'],
    ...list.map((o) => [o.id, o.createdAt.slice(0, 10), o.customer.name, o.customer.phone, o.customer.email, o.address.district, o.shipmentNo || '', o.total,
      METHOD_LABELS[o.payment.method] || o.payment.method, cleanPayment(o.payment.status), o.status, o.remarks || '']),
  ]);

  return (
    <>
      <div className="admin-toolbar wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search order #, name, phone, shipment…" />
        <FilterSelect
          label="Order status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'All', label: `All statuses (${orders.length})` },
            ...ORDER_STATUSES.map((s) => ({ value: s, label: `${statusLabel(s)} (${orders.filter((o) => o.status === s).length})` })),
          ]}
        />
        {list.length > 0 && <ExcelButton onClick={exportExcel} label="Export orders to Excel" />}
      </div>
      {list.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Shipment No</th><th>Payment</th><th>Status</th><th className="num">Total</th><th className="actions-col">Actions</th></tr></thead>
            <tbody>
              {list.map((o) => {
                const count = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <tr key={o.id} className="clickable" onClick={() => setOpen(o.id)}>
                    <td>
                      <strong>#{o.id}</strong><div className="muted small">{fmtDate(o.createdAt)} · {count} {count === 1 ? 'item' : 'items'}</div>
                      {o.remarks && <div className="order-remark small" title={o.remarks}>{o.remarks}</div>}
                    </td>
                    <td>{o.customer.name}<div className="muted small">{o.customer.phone} · {o.address.district}</div></td>
                    <td>{o.shipmentNo ? <span className="ship-chip">{o.shipmentNo}</span> : <span className="muted small">Not set</span>}</td>
                    <td><span className={`badge-status ${paymentTone(o.payment.status)}`}>{cleanPayment(o.payment.status)}</span></td>
                    <td><span className={`badge-status ${statusClass(o.status)}`}>{statusLabel(o.status)}</span></td>
                    <td className="num">{formatPrice(o.total)}{o.payLater > 0 && <div className="muted small">{formatPrice(o.payLater)} due later</div>}</td>
                    <td className="actions">
                      <button className="icon-btn sm" onClick={(e) => { e.stopPropagation(); setOpen(o.id); }} aria-label={`Edit order ${o.id}`} title="Edit order"><EditIcon width={16} height={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="muted">No orders found. Place a test order from the shop to see it here.</p>}
      {current && <OrderEditor key={current.id} order={current} onClose={() => setOpen(null)} />}
    </>
  );
}

// Side panel to update an order: status, payment, tracking and shipment number in one place.
function OrderEditor({ order, onClose }) {
  const [f, setF] = useState({
    status: order.status,
    payment: cleanPayment(order.payment.status),
    tracking: order.trackingNumber || '',
    shipmentNo: order.shipmentNo || '',
    remarks: order.remarks || '',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const waNumber = order.customer.phone.replace(/^0/, '94').replace(/\D/g, '');
  const waText = encodeURIComponent(`Hi ${order.customer.name.split(' ')[0]}, update on your ${SITE.name} order #${order.id}: ${statusLabel(f.status)}. ${statusText(f.status) || (f.status === 'Cancelled' ? 'Your order has been cancelled.' : '')}${f.tracking ? ` Tracking: ${f.tracking}` : ''}`);

  const save = (e) => {
    e.preventDefault();
    if (f.status !== order.status) setOrderStatus(order.id, f.status);
    db.update('orders', order.id, (x) => ({ payment: { ...x.payment, status: f.payment }, trackingNumber: f.tracking.trim(), shipmentNo: f.shipmentNo.trim().toUpperCase(), remarks: f.remarks.trim() }));
    onClose();
  };
  const remove = () => {
    if (!window.confirm(`Delete order #${order.id}? This cannot be undone.`)) return;
    db.remove('orders', order.id);
    onClose();
  };

  return (
    <SidePanel
      open
      wide
      onClose={onClose}
      onSubmit={save}
      title={`Order #${order.id}`}
      subtitle={`${order.customer.name} · ${fmtDate(order.createdAt)}`}
      footer={(
        <>
          <button type="button" className="btn btn-outline danger-btn sp-left" onClick={remove}><TrashIcon width={16} height={16} /> Delete</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn">Save changes</button>
        </>
      )}
    >
      <div className="stack">
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Order status</span>
            <select className="input" value={f.status} onChange={set('status')}>
              {ORDER_STATUSES.map((s, i) => <option key={s} value={s}>{s === 'Cancelled' ? s : `${i + 1}. ${statusLabel(s)}`}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Payment status</span>
            <select className="input" value={f.payment} onChange={set('payment')}>
              {[...new Set([cleanPayment(order.payment.status), ...PAYMENT_STATUSES])].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Courier tracking number</span>
            <input className="input" value={f.tracking} onChange={set('tracking')} placeholder="Shown to the customer" />
          </label>
          <label className="field">
            <span className="field-label">Shipment No</span>
            <input className="input" value={f.shipmentNo} onChange={set('shipmentNo')} placeholder="e.g. SHP-004" />
          </label>
          <label className="field span-2">
            <span className="field-label">Remarks <span className="muted small">(only admins see this)</span></span>
            <textarea className="input remarks-input" rows={3} value={f.remarks} onChange={set('remarks')} placeholder="e.g. Customer asked to deliver after 5 PM. Balance to be paid on arrival." />
          </label>
        </div>
        <a className="wa-link" href={`https://wa.me/${waNumber}?text=${waText}`} target="_blank" rel="noreferrer">
          <span className="wa-icon"><WhatsAppIcon width={16} height={16} /></span>
          Send status update to the customer on WhatsApp →
        </a>
        <OrderView order={order} />
        <p className="small muted contact-line">
          <span>Email: <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></span>
          <span>Phone: <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></span>
        </p>
      </div>
    </SidePanel>
  );
}

// ── Customers ───────────────────────────────────────────────────────────────
export function Customers() {
  const users = useCollection('users');
  const orders = useCollection('orders');
  const { user: me } = useAuth();
  const [params] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') || '');
  const list = users.filter((u) => [u.name, u.email, u.phone].join(' ').toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="admin-toolbar">
        <input className="input" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="muted small">{list.length} accounts</span>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Spent</th><th>{SITE.coinsName}</th><th>Role</th></tr></thead>
          <tbody>
            {list.map((u) => {
              const mine = orders.filter((o) => o.userId === u.id && o.status !== 'Cancelled');
              return (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong><div className="muted small">Joined {fmtDate(u.createdAt)}</div></td>
                  <td className="small">{u.email}<br />{u.phone}</td>
                  <td>{mine.length}</td>
                  <td>{formatPrice(mine.reduce((s, o) => s + o.total, 0))}</td>
                  <td><input className="input stock-input" type="number" min="0" value={u.coins || 0} onChange={(e) => db.update('users', u.id, { coins: Math.max(0, Number(e.target.value)) })} aria-label={`Coins for ${u.name}`} /></td>
                  <td>
                    <select className="input" value={u.role} disabled={u.id === me?.id} onChange={(e) => db.update('users', u.id, { role: e.target.value })} aria-label={`Role for ${u.name}`} title={u.id === me?.id ? "You can't change your own role" : ''}>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small">Make someone an Admin to let them use this panel. Edit coins to give rewards or fix balances.</p>
    </>
  );
}

// ── Reviews ─────────────────────────────────────────────────────────────────
export function ReviewsAdmin() {
  const reviews = useCollection('reviews');
  const products = useProducts();
  const list = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list.length ? (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Review</th><th>Product</th><th>Date</th><th className="actions-col">Actions</th></tr></thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td><Stars value={r.rating} size={13} /> <strong>{r.title}</strong><div className="small">{r.text}</div><div className="muted small">{r.name}</div></td>
              <td className="small">{products.find((p) => p.id === r.productId)?.name || 'Deleted product'}</td>
              <td className="small">{fmtDate(r.createdAt)}</td>
              <td className="actions">
                <span className="review-actions">
                  <input type="checkbox" className="review-check" checked={Boolean(r.verified)} onChange={(e) => db.update('reviews', r.id, { verified: e.target.checked })} aria-label="Verified buyer" title="Verified buyer" />
                  <button className="icon-btn sm danger" onClick={() => db.remove('reviews', r.id)} aria-label="Delete"><TrashIcon width={16} height={16} /></button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : <p className="muted">No reviews yet.</p>;
}

// ── Coupons ─────────────────────────────────────────────────────────────────
export function Coupons() {
  const orders = useCollection('orders');
  return (
    <ListEditor
      collection="coupons"
      itemName="coupon"
      headerAction
      sortable={false}
      intro="Discount codes customers enter in the cart or at checkout."
      newItem={{ code: '', type: 'percent', value: 10, minSubtotal: 0, note: '', active: true }}
      validate={(c, all) => {
        c.code = (c.code || '').trim().toUpperCase(); // eslint-disable-line no-param-reassign
        if (!c.code) return 'Enter a code.';
        if (all.some((x) => x.code === c.code && x.id !== c.id)) return 'That code already exists.';
        if (!(Number(c.value) > 0)) return 'Enter a discount amount.';
        if (c.type === 'percent' && c.value > 100) return 'A percentage cannot be more than 100.';
        return null;
      }}
      fields={[
        { key: 'code', label: 'Code', required: true, placeholder: 'e.g. SAVE10' },
        { key: 'type', label: 'Type', type: 'select', options: [{ value: 'percent', label: '% off' }, { value: 'fixed', label: 'Rs. off' }] },
        { key: 'value', label: 'Discount', type: 'number', min: 1, required: true },
        { key: 'minSubtotal', label: 'Minimum order (Rs.)', type: 'number', min: 0 },
        { key: 'note', label: 'Note (admins only)', span: 2 },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { label: 'Code', render: (c) => <><strong>{c.code}</strong><div className="muted small">{c.note}</div></> },
        { label: 'Discount', render: (c) => (c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)) },
        { label: 'Min. order', render: (c) => (c.minSubtotal ? formatPrice(c.minSubtotal) : 'None') },
        { label: 'Times used', render: (c) => orders.filter((o) => o.couponCode === c.code).length },
        { label: 'Active', render: (c) => <input type="checkbox" checked={c.active} onChange={(e) => db.update('coupons', c.id, { active: e.target.checked })} aria-label={`Activate ${c.code}`} /> },
      ]}
    />
  );
}

// ── Inbox ───────────────────────────────────────────────────────────────────
export function Inbox() {
  const messages = useCollection('messages');
  const notify = useCollection('notifyRequests');
  const subscribers = useCollection('subscribers');

  const exportExcel = () => downloadExcel('subscribers', [['Email', 'Subscribed on'], ...subscribers.map((s) => [s.email, s.createdAt.slice(0, 10)])]);

  return (
    <div className="admin-cols">
      <div className="panel span-2">
        <h3>Contact messages ({messages.length})</h3>
        {[...messages].reverse().map((m) => (
          <div key={m.id} className={`message ${m.read ? '' : 'unread'}`}>
            <div className="row-between">
              <span><strong>{m.name}</strong>{m.subject && <span className="muted small"> · {m.subject}</span>}</span>
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
        <div className="row-between"><h3 className="no-margin">Subscribers ({subscribers.length})</h3>{subscribers.length > 0 && <ExcelButton small onClick={exportExcel} label="Export subscribers to Excel" />}</div>
        {[...subscribers].reverse().slice(0, 50).map((s) => (
          <div key={s.id} className="row-between small">
            <span>{s.email}</span>
            <button className="icon-btn sm danger" onClick={() => db.remove('subscribers', s.id)} aria-label="Delete"><TrashIcon width={14} height={14} /></button>
          </div>
        ))}
        {!subscribers.length && <p className="muted">None yet.</p>}
      </div>
    </div>
  );
}
