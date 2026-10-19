import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { findOrder } from '../services/api';
import { useCollection } from '../services/db';
import OrderView from '../components/OrderView';
import { CheckIcon, PhoneIcon, SearchIcon, TruckIcon, WhatsAppIcon } from '../components/Icons';
import PageHero from '../components/PageHero';
import useTitle from '../hooks/useTitle';

export function OrderConfirmation() {
  const { id } = useParams();
  const orders = useCollection('orders');
  const order = orders.find((o) => o.id === id);
  useTitle(order ? `Order #${order.id}` : 'Order');

  if (!order) {
    return (
      <div className="container narrow center-page">
        <h1>Order not found</h1>
        <Link to="/track-order" className="btn">Track an Order</Link>
      </div>
    );
  }

  return (
    <div className="container narrow page">
      <div className="center-msg">
        <span className="success-icon big"><CheckIcon width={32} height={32} /></span>
        <h1>Thank you, {order.customer.name.split(' ')[0]}!</h1>
        <p>Your order <strong>#{order.id}</strong> has been placed. We'll send updates to {order.customer.phone}.</p>
        {order.coinsEarned > 0 && order.userId && <p className="muted">You earned {order.coinsEarned} {SITE.coinsName}.</p>}
      </div>
      {order.payment.method === 'bank' && (
        <div className="notice notice-pre">
          <strong>Complete your bank transfer of {formatPrice(order.payNow)}</strong><br />
          {SITE.bank.name} · {SITE.bank.branch} · {SITE.bank.accountName} · A/C {SITE.bank.accountNumber}<br />
          Reference: {order.id}. Send the slip to us on{' '}
          <a className="link" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Payment slip for order ${order.id}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>.
        </div>
      )}
      <OrderView order={order} />
      <div className="row-gap center-row">
        <Link to="/" className="btn">Continue Shopping</Link>
        <Link to={order.userId ? '/account' : '/track-order'} className="btn btn-outline">{order.userId ? 'My Orders' : 'Track Order'}</Link>
      </div>
    </div>
  );
}

export function TrackOrder() {
  useTitle('Track Order');
  useCollection('orders'); // live status updates
  const [form, setForm] = useState({ number: '', phone: '' });
  const [order, setOrder] = useState(undefined);
  const live = order ? findOrder(form.number, form.phone) || order : order;

  const submit = (e) => {
    e.preventDefault();
    setOrder(findOrder(form.number, form.phone));
  };

  return (
    <div className="info-page">
      <PageHero label="Order tracking" title="Track your order" text="Enter your order number and the mobile number you used at checkout to see where your collectibles are." icon={TruckIcon} />

      <div className="container narrow-wide">
        <form className="track-card" onSubmit={submit}>
          <label className="track-field">
            <span className="track-field-icon">#</span>
            <span className="track-field-body">
              <span className="track-field-label">Order number</span>
              <input required placeholder="e.g. AR10042" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </span>
          </label>
          <label className="track-field">
            <span className="track-field-icon"><PhoneIcon width={16} height={16} /></span>
            <span className="track-field-body">
              <span className="track-field-label">Mobile number</span>
              <input required inputMode="tel" placeholder="07X XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </span>
          </label>
          <button className="btn btn-lg track-btn"><SearchIcon width={18} height={18} /> Track order</button>
        </form>

        {live === null && (
          <div className="track-empty">
            <span className="track-empty-icon">?</span>
            <div>
              <h3>We couldn't find that order</h3>
              <p className="muted">Check the order number in your confirmation message and use the same mobile number you entered at checkout.</p>
              <a className="link" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi, I need help tracking order ${form.number}`)}`} target="_blank" rel="noreferrer">Ask us on WhatsApp →</a>
            </div>
          </div>
        )}

        {live && <div className="track-result"><OrderView order={live} /></div>}

        {live === undefined && (
          <div className="info-tiles">
            <div className="info-tile">
              <span className="info-tile-icon">#</span>
              <h3>Where's my order number?</h3>
              <p className="muted">It starts with “AR” and is shown on the confirmation page and in your order message.</p>
            </div>
            <div className="info-tile">
              <span className="info-tile-icon"><TruckIcon width={20} height={20} /></span>
              <h3>Delivery times</h3>
              <p className="muted">Colombo &amp; Gampaha {SITE.deliveryDays.colombo} days, other districts {SITE.deliveryDays.other} business days.</p>
            </div>
            <div className="info-tile">
              <span className="info-tile-icon wa"><WhatsAppIcon width={20} height={20} /></span>
              <h3>Need help?</h3>
              <p className="muted">Message us on <a className="link" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>. We usually reply within minutes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
