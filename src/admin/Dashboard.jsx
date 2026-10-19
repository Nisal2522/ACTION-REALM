import { useState } from 'react';
import { SITE, formatPrice } from '../config/site';
import { isPreorder, useProducts } from '../data/products';
import { useCollection } from '../services/db';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import { BagIcon, BoxIcon, TrendIcon, UsersIcon, TagIcon } from '../components/Icons';
import { AreaChart, Donut, Sparkline } from './charts';
import { fmtDate } from './fields';

const DAY = 864e5;
const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
];
const keyOf = (d) => d.toISOString().slice(0, 10);
const addDays = (key, n) => keyOf(new Date(new Date(`${key}T00:00:00Z`).getTime() + n * DAY));
const daysBetween = (a, b) => Math.round((new Date(`${b}T00:00:00Z`) - new Date(`${a}T00:00:00Z`)) / DAY) + 1;
const STATUS_COLORS = { Placed: '#3b82f6', Confirmed: '#a855f7', Shipped: '#f59e0b', Delivered: '#22c55e', Cancelled: '#ef4444' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const pctChange = (now, before) => (before ? ((now - before) / before) * 100 : now ? 100 : 0);

function Kpi({ icon: Icon, label, value, change, spark, tone = 'red' }) {
  const down = change < 0;
  return (
    <div className={`adm-card kpi tone-${tone}`}>
      <div className="kpi-top">
        <span className="kpi-icon"><Icon width={18} height={18} /></span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {change === null ? <span className="muted small">All time total</span> : (
          <>
            <span className={`delta ${down ? 'down' : 'up'}`}>
              <TrendIcon down={down} width={14} height={14} /> {Math.abs(change).toFixed(0)}%
            </span>
            <span className="muted small">vs previous period</span>
          </>
        )}
        {spark && <Sparkline values={spark} />}
      </div>
    </div>
  );
}

export default function Dashboard({ go }) {
  const { user } = useAuth();
  const products = useProducts();
  const orders = useCollection('orders');
  const users = useCollection('users');
  const [period, setPeriod] = useState('30');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const today = keyOf(new Date());
  const earliest = [...valid.map((o) => o.createdAt), ...users.map((u) => u.createdAt)].filter(Boolean).sort()[0]?.slice(0, 10) || addDays(today, -29);

  // Current period [start, end] and the same-length period just before it (for the % change).
  let start;
  let end = today;
  if (period === 'month') start = `${today.slice(0, 7)}-01`;
  else if (period === '30' || period === '90') start = addDays(today, -(Number(period) - 1));
  else if (period === 'all') start = earliest;
  else { start = from || addDays(today, -29); end = to || today; }
  if (start > end) [start, end] = [end, start];
  const days = daysBetween(start, end);
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(start, -days);
  const compare = period !== 'all';

  const inPeriod = (iso, a, b) => {
    const k = (iso || '').slice(0, 10);
    return k >= a && k <= b;
  };
  const cur = valid.filter((o) => inPeriod(o.createdAt, start, end));
  const prev = valid.filter((o) => inPeriod(o.createdAt, prevStart, prevEnd));
  const sum = (list) => list.reduce((s, o) => s + o.total, 0);
  const custCur = users.filter((u) => u.role !== 'admin' && inPeriod(u.createdAt, start, end)).length;
  const custPrev = users.filter((u) => u.role !== 'admin' && inPeriod(u.createdAt, prevStart, prevEnd)).length;
  const change = (a, b) => (compare ? pctChange(a, b) : null);

  // Chart: one point per day for short periods, one per month for long ones.
  const series = days <= 92
    ? [...Array(days)].map((_, i) => {
      const key = addDays(start, i);
      const d = new Date(`${key}T00:00:00Z`);
      const day = cur.filter((o) => o.createdAt.slice(0, 10) === key);
      return {
        label: d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
        full: d.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
        value: sum(day),
        orders: day.length,
      };
    })
    : [...new Set(cur.map((o) => o.createdAt.slice(0, 7)))].sort().map((m) => {
      const month = cur.filter((o) => o.createdAt.slice(0, 7) === m);
      const d = new Date(`${m}-01T00:00:00Z`);
      return {
        label: d.toLocaleDateString('en-LK', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
        full: d.toLocaleDateString('en-LK', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
        value: sum(month),
        orders: month.length,
      };
    });
  const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === today).length;
  const initials = (n = '') => n.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const periodLabel = period === 'all' ? 'All time' : period === 'month' ? 'This month' : period === 'custom' ? `${start} to ${end}` : `Last ${period} days`;
  const spark = (fn) => series.map(fn);

  const counts = {};
  cur.forEach((o) => o.items.forEach((i) => {
    counts[i.id] = counts[i.id] || { qty: 0, revenue: 0, item: i };
    counts[i.id].qty += i.qty;
    counts[i.id].revenue += i.qty * i.price;
  }));
  const top = Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topMax = Math.max(1, ...top.map((t) => t.revenue));

  const statusSegments = Object.entries(STATUS_COLORS).map(([label, color]) => ({ label, color, value: orders.filter((o) => o.status === label).length }));
  const lowStock = products.filter((p) => !isPreorder(p) && p.stock <= 2).slice(0, 6);
  const todo = [
    { label: 'Orders to confirm', value: orders.filter((o) => o.status === 'Placed').length, tab: 'orders', Icon: BagIcon, tone: 'blue' },
    { label: 'Orders to ship', value: orders.filter((o) => o.status === 'Confirmed').length, tab: 'orders', Icon: BoxIcon, tone: 'purple' },
    { label: 'Awaiting bank transfer', value: orders.filter((o) => o.payment.status === 'Awaiting transfer').length, tab: 'orders', Icon: TagIcon, tone: 'amber' },
  ];

  return (
    <div className="dash">
      <div className="dash-head dash-hero">
        <div>
          <span className="dash-date">{new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <h2>{greeting()}, {user?.name?.split(' ')[0] || 'there'}</h2>
          <p>Here's how {SITE.name} is doing{period === 'all' ? ' overall' : ''}. {todayOrders ? `${todayOrders} new order${todayOrders > 1 ? 's' : ''} today.` : 'No new orders yet today.'}</p>
        </div>
        <div className="dash-period">
          <div className="segmented" role="group" aria-label="Period">
            {PERIODS.map((p) => <button key={p.id} className={period === p.id ? 'active' : ''} onClick={() => setPeriod(p.id)}>{p.label}</button>)}
          </div>
          {period === 'custom' && (
            <div className="bk-dates">
              <label className="date-filter"><span>From</span><input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} /></label>
              <label className="date-filter"><span>To</span><input type="date" value={to} min={from || undefined} max={today} onChange={(e) => setTo(e.target.value)} /></label>
            </div>
          )}
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi tone="green" icon={TagIcon} label="Total sales" value={formatPrice(sum(cur))} change={change(sum(cur), sum(prev))} spark={spark((d) => d.value)} />
        <Kpi tone="blue" icon={BagIcon} label="Orders" value={cur.length} change={change(cur.length, prev.length)} spark={spark((d) => d.orders)} />
        <Kpi tone="purple" icon={BoxIcon} label="Average order value" value={formatPrice(cur.length ? sum(cur) / cur.length : 0)} change={change(cur.length ? sum(cur) / cur.length : 0, prev.length ? sum(prev) / prev.length : 0)} />
        <Kpi tone="amber" icon={UsersIcon} label="New customers" value={custCur} change={change(custCur, custPrev)} />
      </div>

      <div className="dash-grid">
        <div className="adm-card span-2">
          <div className="card-head"><h3>Sales over time</h3><span className="muted small">{periodLabel} · {formatPrice(sum(cur))}</span></div>
          <AreaChart data={series} />
        </div>
        <div className="adm-card">
          <div className="card-head"><h3>Orders by status</h3><button className="link-btn" onClick={() => go('orders')}>View all</button></div>
          <Donut segments={statusSegments} centerLabel="orders" />
        </div>

        <div className="adm-card span-2 flush">
          <div className="card-head padded"><h3>Recent orders</h3><button className="link-btn" onClick={() => go('orders')}>View all</button></div>
          {orders.length ? (
            <table className="table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="num">Total</th></tr></thead>
              <tbody>
                {[...orders].reverse().slice(0, 6).map((o) => (
                  <tr key={o.id} className="clickable" onClick={() => go('orders', o.id)}>
                    <td><strong>#{o.id}</strong></td>
                    <td><span className="dash-cust"><span className="dash-cust-av">{initials(o.customer.name)}</span>{o.customer.name}</span></td>
                    <td className="muted">{fmtDate(o.createdAt)}</td>
                    <td><span className={`badge-status s-${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td className="num">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState text="No orders yet" sub="Place a test order from the shop to see it here." />}
        </div>
        <div className="adm-card">
          <div className="card-head"><h3>Top products</h3><span className="muted small">by revenue</span></div>
          {top.length ? top.map(({ item, qty, revenue }, i) => (
            <div key={item.id} className="top-product ranked">
              <span className="tp-rank">{i + 1}</span>
              <span className="thumb"><ProductImage product={{ ...item, franchise: '' }} /></span>
              <span className="tp-info">
                <span className="tp-name">{item.name}</span>
                <span className="tp-bar"><span style={{ width: `${(revenue / topMax) * 100}%` }} /></span>
                <span className="muted small">{qty} sold</span>
              </span>
              <strong className="small">{formatPrice(revenue)}</strong>
            </div>
          )) : <EmptyState text="No sales in this period" />}
        </div>

        <div className="adm-card">
          <div className="card-head"><h3>To do</h3></div>
          <ul className="todo">
            {todo.map((t) => (
              <li key={t.label}>
                <button onClick={() => go(t.tab)}>
                  <span className={`todo-icon tone-${t.tone}`}><t.Icon width={16} height={16} /></span>
                  <span className="todo-label">{t.label}</span>
                  <span className={`count-pill ${t.value ? 'hot' : ''}`}>{t.value}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="adm-card span-2">
          <div className="card-head"><h3>Low stock</h3><button className="link-btn" onClick={() => go('products')}>Manage</button></div>
          {lowStock.length ? lowStock.map((p) => (
            <div key={p.id} className="top-product">
              <span className="thumb"><ProductImage product={p} /></span>
              <span className="tp-info">
                <span className="tp-name">{p.name}</span>
                <span className="stock-meter" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < p.stock ? (p.stock <= 1 ? 'low' : 'mid') : ''} />)}</span>
              </span>
              <span className={`badge-status ${p.stock === 0 ? 's-cancelled' : 's-shipped'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
            </div>
          )) : <EmptyState text="Stock levels look good" />}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ text, sub }) {
  return (
    <div className="adm-empty">
      <strong>{text}</strong>
      {sub && <span className="muted small">{sub}</span>}
    </div>
  );
}
