import { Link } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { ORDER_STEPS, statusClass, statusLabel } from '../services/api';
import ProductImage from './ProductImage';
import { CheckIcon } from './Icons';

const fmtDate = (iso) => new Date(iso).toLocaleString('en-LK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export function StatusTimeline({ order }) {
  if (order.status === 'Cancelled') return <p className="notice notice-low">This order was cancelled.</p>;
  const current = ORDER_STEPS.findIndex((s) => s.key === order.status);
  return (
    <ol className="timeline">
      {ORDER_STEPS.map((s, i) => {
        const at = [...(order.history || [])].reverse().find((h) => h.status === s.key)?.at;
        const state = i < current ? 'done' : i === current ? 'done current' : 'todo';
        return (
          <li key={s.key} className={state}>
            <span className="tl-dot">{i <= current ? <CheckIcon width={12} height={12} /> : <span className="tl-num">{i + 1}</span>}</span>
            <div className="tl-body">
              <div className="tl-row">
                <span className="tl-label">{s.label}</span>
                {at && <span className="tl-date">{fmtDate(at)}</span>}
              </div>
              <em className="tl-text">{s.text}</em>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function OrderView({ order }) {
  return (
    <div className="order-view">
      <div className="order-head">
        <div>
          <h3>Order #{order.id}</h3>
          <p className="muted small">Placed {fmtDate(order.createdAt)} · Payment: {order.payment.status}</p>
          {order.trackingNumber && <p className="small">Courier tracking: <strong>{order.trackingNumber}</strong></p>}
        </div>
        <span className={`status-pill ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
      </div>
      <StatusTimeline order={order} />
      <div className="order-items">
        {order.items.map((i) => (
          <div className="line" key={i.id}>
            <Link to={`/products/${i.slug}`} className="line-img"><ProductImage product={{ ...i, franchise: '' }} /></Link>
            <div className="line-info">
              <p className="line-title">{i.name}</p>
              <p className="muted small">Qty {i.qty}{i.preorder && ` · Pre-order · ETA ${i.eta}`}</p>
            </div>
            <span>{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
      </div>
      <div className="order-totals">
        <div className="row-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="row-between discount"><span>Coupon {order.couponCode}</span><span>−{formatPrice(order.discount)}</span></div>}
        {order.coinsDiscount > 0 && <div className="row-between discount"><span>{SITE.coinsName}</span><span>−{formatPrice(order.coinsDiscount)}</span></div>}
        <div className="row-between"><span>Delivery</span><span>{order.shipping ? formatPrice(order.shipping) : 'Free'}</span></div>
        <div className="row-between total"><span>Total</span><strong>{formatPrice(order.total)}</strong></div>
        {order.payLater > 0 && <div className="row-between"><span className="muted">Balance due when pre-orders arrive</span><span>{formatPrice(order.payLater)}</span></div>}
      </div>
      <p className="muted small">Delivering to {order.customer.name}, {order.address.line}, {order.address.city}, {order.address.district} · {order.customer.phone}</p>
    </div>
  );
}
