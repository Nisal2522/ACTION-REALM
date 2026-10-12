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
const RANGES = [7, 30, 90];
const STATUS_COLORS = { Placed: '#3b82f6', Confirmed: '#a855f7', Shipped: '#f59e0b', Delivered: '#22c55e', Cancelled: '#ef4444' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const pctChange = (now, before) => (before ? ((now - before) / before) * 100 : now ? 100 : 0);

function Kpi({ icon: Icon, label, value, change, spark }) {
  const down = change < 0;
  return (
    <div className="adm-card kpi">
      <div className="kpi-top">
        <span className="kpi-icon"><Icon width={18} height={18} /></span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        <span className={`delta ${down ? 'down' : 'up'}`}>
          <TrendIcon down={down} width={14} height={14} /> {Math.abs(change).toFixed(0)}%
        </span>
        <span className="muted small">vs previous period</span>
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
  const [range, setRange] = useState(30);

  const now = Date.now();
  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const inRange = (iso, from, to) => {
    const t = new Date(iso).getTime();
    return t > from && t <= to;
  };
  const cur = valid.filter((o) => inRange(o.createdAt, now - range * DAY, now));
  const prev = valid.filter((o) => inRange(o.createdAt, now - 2 * range * DAY, now - range * DAY));
  const sum = (list) => list.reduce((s, o) => s + o.total, 0);
  const custCur = users.filter((u) => u.role !== 'admin' && inRange(u.createdAt, now - range * DAY, now)).length;
  const custPrev = users.filter((u) => u.role !== 'admin' && inRange(u.createdAt, now - 2 * range * DAY, now - range * DAY)).length;

  // Daily series for the chart.
  const series = [...Array(range)].map((_, i) => {
    const d = new Date(now - (range - 1 - i) * DAY);
    const key = d.toISOString().slice(0, 10);
    const day = valid.filter((o) => o.createdAt.slice(0, 10) === key);
    return {
      label: d.toLocaleDateString('en-LK', range > 30 ? { month: 'short', day: 'numeric' } : { day: 'numeric', month: 'short' }),
      full: d.toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: sum(day),
      orders: day.length,
    };
  });
  const spark = (fn) => series.map(fn);

  const counts = {};
  cur.forEach((o) => o.items.forEach((i) => {
    counts[i.id] = counts[i.id] || { qty: 0, revenue: 0, item: i };
    counts[i.id].qty += i.qty;
    counts[i.id].revenue += i.qty * i.price;
  }));
  const top = Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const statusSegments = Object.entries(STATUS_COLORS).map(([label, color]) => ({ label, color, value: orders.filter((o) => o.status === label).length }));
  const lowStock = products.filter((p) => !isPreorder(p) && p.stock <= 2).slice(0, 6);
  const todo = [
    { label: 'Orders to confirm', value: orders.filter((o) => o.status === 'Placed').length, tab: 'orders' },
    { label: 'Orders to ship', value: orders.filter((o) => o.status === 'Confirmed').length, tab: 'orders' },
    { label: 'Awaiting bank transfer', value: orders.filter((o) => o.payment.status === 'Awaiting transfer').length, tab: 'orders' },
  ];

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <h2>{greeting()}, {user?.name?.split(' ')[0] || 'there'}</h2>
          <p className="muted">Here's how {SITE.name} is doing.</p>
        </div>
        <div className="segmented" role="group" aria-label="Date range">
          {RANGES.map((r) => <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r} days</button>)}
        </div>
      </div>

      <div className="kpi-grid">
        <Kpi icon={TagIcon} label="Total sales" value={formatPrice(sum(cur))} change={pctChange(sum(cur), sum(prev))} spark={spark((d) => d.value)} />
        <Kpi icon={BagIcon} label="Orders" value={cur.length} change={pctChange(cur.length, prev.length)} spark={spark((d) => d.orders)} />
        <Kpi icon={BoxIcon} label="Average order value" value={formatPrice(cur.length ? sum(cur) / cur.length : 0)} change={pctChange(cur.length ? sum(cur) / cur.length : 0, prev.length ? sum(prev) / prev.length : 0)} />
        <Kpi icon={UsersIcon} label="New customers" value={custCur} change={pctChange(custCur, custPrev)} />
      </div>

      <div className="dash-grid">
        <div className="adm-card span-2">
          <div className="card-head"><h3>Sales over time</h3><span className="muted small">Last {range} days · {formatPrice(sum(cur))}</span></div>
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
                    <td>{o.customer.name}</td>
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
          {top.length ? top.map(({ item, qty, revenue }) => (
            <div key={item.id} className="top-product">
              <span className="thumb"><ProductImage product={{ ...item, franchise: '' }} /></span>
              <span className="tp-info"><span className="tp-name">{item.name}</span><span className="muted small">{qty} sold</span></span>
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
                  <span>{t.label}</span>
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
              <span className="tp-info"><span className="tp-name">{p.name}</span><span className="muted small">{p.brand}</span></span>
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
