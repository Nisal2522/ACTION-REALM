import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DISTRICTS, SITE, formatPrice, isValidPhone } from '../config/site';
import { createOrder, nextOrderId, priceOrder } from '../services/api';
import { isPayHereLive, payWithPayHere } from '../services/payhere';
import { track } from '../services/analytics';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/ProductImage';
import CouponBox from '../components/CouponBox';
import { Modal } from '../components/ui';
import { CheckIcon } from '../components/Icons';
import useTitle from '../hooks/useTitle';

const STEPS = ['Contact', 'Delivery', 'Payment'];

export default function Checkout() {
  useTitle('Checkout');
  const { cartItems, clearCart, couponCode } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const saved = user?.addresses?.[0];

  const [step, setStep] = useState(0);
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [address, setAddress] = useState(saved || { line: '', city: '', district: '', postal: '' });
  const [payment, setPayment] = useState('card');
  const [useCoins, setUseCoins] = useState(false);
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [payError, setPayError] = useState('');

  const coinsAvailable = user?.coins || 0;
  const pricing = priceOrder(cartItems, { couponCode, coinsToUse: useCoins ? coinsAvailable : 0 });
  const hasPreorder = pricing.hasPreorder;

  if (!cartItems.length) {
    return (
      <div className="container narrow center-page">
        <h1>Your cart is empty</h1>
        <Link to="/collections/in-stock" className="btn">Shop In-Stock Collectibles</Link>
      </div>
    );
  }

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!contact.name.trim()) e.name = 'Enter your name';
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) e.email = 'Enter a valid email';
      if (!isValidPhone(contact.phone)) e.phone = 'Enter a valid Sri Lankan mobile number (07X XXX XXXX)';
    }
    if (s === 1) {
      if (!address.line.trim()) e.line = 'Enter your street address';
      if (!address.city.trim()) e.city = 'Enter your city / town';
      if (!address.district) e.district = 'Choose your district';
      if (address.postal && !/^\d{5}$/.test(address.postal)) e.postal = 'Postal codes have 5 digits';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = (e) => {
    e.preventDefault();
    if (validate(step)) setStep(step + 1);
  };

  const finish = (paymentStatus, orderId) => {
    const order = createOrder({
      orderId,
      cartItems,
      pricing,
      customer: { ...contact, phone: contact.phone.replace(/[\s-]/g, '') },
      address,
      payment: { method: payment, status: paymentStatus },
      userId: user?.id,
    });
    track('purchase', { value: order.total, items: order.items });
    clearCart();
    navigate(`/order/${order.id}`, { replace: true });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setPayError('');
    if (payment === 'cod' || payment === 'bank') return finish(payment === 'bank' ? 'Awaiting transfer' : 'Pay on delivery');
    if (!isPayHereLive()) return setSimulating(true);
    try {
      setPaying(true);
      const orderId = nextOrderId();
      const result = await payWithPayHere({
        orderId,
        amount: pricing.payNow,
        customer: contact,
        address,
        items: cartItems.map((i) => i.product.name).join(', ').slice(0, 250),
      });
      if (result === 'paid') finish('Paid', orderId);
      else setPayError('Payment was cancelled. You can try again.');
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const paymentOptions = [
    { id: 'card', title: 'Credit / Debit Card', text: 'Visa, Mastercard, Amex · Secured by PayHere' },
    { id: 'bank', title: 'Bank Transfer', text: 'Transfer and send us the slip on WhatsApp' },
    { id: 'cod', title: 'Cash on Delivery', text: hasPreorder ? 'Not available for pre-orders' : 'Pay when your order arrives', disabled: hasPreorder },
  ];

  return (
    <div className="container checkout">
      <div className="checkout-main">
        <h1>Checkout</h1>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'current' : i < step ? 'done' : ''}>
              <button type="button" disabled={i > step} onClick={() => setStep(i)}>
                <span className="step-num">{i < step ? <CheckIcon width={14} height={14} /> : i + 1}</span> {s}
              </button>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <form className="checkout-form" onSubmit={next} noValidate>
            {!user && <p className="muted small">Have an account? <Link to="/login?next=/checkout" className="link">Log in</Link> for faster checkout and {SITE.coinsName}.</p>}
            <Field label="Full name" error={errors.name}>
              <input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
            </Field>
            <div className="field-row">
              <Field label="Email" error={errors.email}>
                <input className="input" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <input className="input" inputMode="tel" placeholder="07X XXX XXXX" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" />
              </Field>
            </div>
            <button className="btn btn-lg btn-block">Continue to Delivery</button>
          </form>
        )}

        {step === 1 && (
          <form className="checkout-form" onSubmit={next} noValidate>
            {user?.addresses?.length > 0 && (
              <div className="saved-addresses">
                <p className="muted small">Saved addresses</p>
                {user.addresses.map((a) => (
                  <button type="button" key={`${a.line}${a.city}`} className={`saved-address ${a.line === address.line && a.city === address.city ? 'active' : ''}`} onClick={() => setAddress(a)}>
                    {a.line}, {a.city}, {a.district}
                  </button>
                ))}
              </div>
            )}
            <Field label="Street address" error={errors.line}>
              <textarea className="input" rows="2" placeholder="House no, street, area" value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} autoComplete="street-address" />
            </Field>
            <div className="field-row three">
              <Field label="City / Town" error={errors.city}>
                <input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} autoComplete="address-level2" />
              </Field>
              <Field label="District" error={errors.district}>
                <select className="input" value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })}>
                  <option value="">Choose…</option>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Postal code (optional)" error={errors.postal}>
                <input className="input" inputMode="numeric" value={address.postal} onChange={(e) => setAddress({ ...address, postal: e.target.value })} autoComplete="postal-code" />
              </Field>
            </div>
            {address.district && (
              <p className="notice notice-ok">Free delivery to {address.district} · Estimated {address.district === 'Colombo' || address.district === 'Gampaha' ? '1–2' : '2–4'} business days</p>
            )}
            <button className="btn btn-lg btn-block">Continue to Payment</button>
          </form>
        )}

        {step === 2 && (
          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="review-box">
              <div><span className="muted small">Contact</span><p>{contact.name} · {contact.phone} · {contact.email}</p></div>
              <button type="button" className="link-btn" onClick={() => setStep(0)}>Edit</button>
            </div>
            <div className="review-box">
              <div><span className="muted small">Deliver to</span><p>{address.line}, {address.city}, {address.district}</p></div>
              <button type="button" className="link-btn" onClick={() => setStep(1)}>Edit</button>
            </div>

            <div className="pay-options">
              {paymentOptions.map((o) => (
                <label key={o.id} className={`pay ${payment === o.id ? 'active' : ''} ${o.disabled ? 'disabled' : ''}`}>
                  <input type="radio" name="payment" checked={payment === o.id} disabled={o.disabled} onChange={() => setPayment(o.id)} />
                  <span><strong>{o.title}</strong><span className="muted small">{o.text}</span></span>
                </label>
              ))}
            </div>
            {payment === 'bank' && (
              <div className="notice notice-pre small">
                {SITE.bank.name} · {SITE.bank.branch}<br />
                {SITE.bank.accountName} · A/C {SITE.bank.accountNumber}<br />
                Use your order number as the reference.
              </div>
            )}
            {pricing.total >= SITE.installmentThreshold && payment === 'card' && (
              <p className="emi-note small">0% installment plans are available on participating bank cards.</p>
            )}
            {payError && <p className="error">{payError}</p>}
            <button className="btn btn-lg btn-block" disabled={paying}>
              {paying ? 'Opening payment…' : `${payment === 'card' ? 'Pay' : 'Place Order'} · ${formatPrice(pricing.payNow)}`}
            </button>
            {!isPayHereLive() && payment === 'card' && <p className="muted small center">Demo mode: card payment is simulated until PayHere is connected.</p>}
          </form>
        )}
      </div>

      <aside className="summary">
        <h3>Order Summary</h3>
        {cartItems.map(({ id, qty, product }) => (
          <div className="line" key={id}>
            <div className="line-img"><ProductImage product={product} /><span className="line-qty">{qty}</span></div>
            <div className="line-info">
              <p className="line-title">{product.name}</p>
              {product.status === 'preorder' && <p className="muted small">Pre-order · ETA {product.eta}</p>}
            </div>
            <span>{formatPrice(product.price * qty)}</span>
          </div>
        ))}
        <CouponBox subtotal={pricing.subtotal} />
        {user && coinsAvailable > 0 && (
          <label className="coins-toggle">
            <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} />
            Use {coinsAvailable} {SITE.coinsName} (−{formatPrice(Math.min(coinsAvailable * SITE.coinValue, pricing.subtotal - pricing.discount))})
          </label>
        )}
        <div className="row-between"><span>Subtotal</span><span>{formatPrice(pricing.subtotal)}</span></div>
        {pricing.discount > 0 && <div className="row-between discount"><span>Coupon {pricing.coupon?.code}</span><span>−{formatPrice(pricing.discount)}</span></div>}
        {pricing.coinsDiscount > 0 && <div className="row-between discount"><span>{SITE.coinsName}</span><span>−{formatPrice(pricing.coinsDiscount)}</span></div>}
        <div className="row-between"><span>Delivery</span><span className="free">FREE</span></div>
        <div className="row-between total"><span>Total</span><strong>{formatPrice(pricing.total)}</strong></div>
        {hasPreorder && (
          <>
            <div className="row-between pay-now"><span>Pay now</span><strong>{formatPrice(pricing.payNow)}</strong></div>
            <div className="row-between"><span className="muted">Balance when pre-orders arrive</span><span>{formatPrice(pricing.payLater)}</span></div>
          </>
        )}
        <p className="muted small">You'll earn {pricing.coinsEarned} {SITE.coinsName}{!user && ' (log in to collect them)'}</p>
      </aside>

      <Modal open={simulating} onClose={() => setSimulating(false)} title="Simulated payment" className="small-modal">
        <div className="stack center-msg">
          <span className="payhere-mark">PayHere</span>
          <h3>Demo card payment</h3>
          <p className="muted">Amount: <strong>{formatPrice(pricing.payNow)}</strong></p>
          <p className="muted small">This is a simulation. Connect PayHere in src/config/site.js to take real payments.</p>
          <button className="btn btn-block" onClick={() => { setSimulating(false); finish('Paid (demo)'); }}>Simulate Successful Payment</button>
          <button className="btn btn-outline btn-block" onClick={() => { setSimulating(false); setPayError('Payment failed (simulated). Try again or choose another method.'); }}>Simulate Failed Payment</button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="error">{error}</span>}
    </label>
  );
}
