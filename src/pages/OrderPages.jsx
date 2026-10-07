import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE, formatPrice } from '../config/site';
import { findOrder } from '../services/api';
import { useCollection } from '../services/db';
import OrderView from '../components/OrderView';
import { CheckIcon } from '../components/Icons';
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

  const submit = (e) => {
    e.preventDefault();
    setOrder(findOrder(form.number, form.phone));
  };

  return (
    <div className="container narrow page">
      <h1>Track Your Order</h1>
      <p className="muted">Enter your order number (e.g. AR10001) and the mobile number used at checkout.</p>
      <form className="track-form" onSubmit={submit}>
        <input className="input" required placeholder="Order number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        <input className="input" required placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn">Track</button>
      </form>
      {order === null && <p className="notice notice-low">No order found with those details. Check the number and try again.</p>}
      {order && <OrderView order={findOrder(form.number, form.phone) || order} />}
    </div>
  );
}
