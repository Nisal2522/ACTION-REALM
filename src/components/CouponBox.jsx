import { useState } from 'react';
import { formatPrice } from '../config/site';
import { checkCoupon } from '../services/api';
import { useStore } from '../context/StoreContext';
import { CloseIcon, TagIcon } from './Icons';

export default function CouponBox({ subtotal }) {
  const { couponCode, setCouponCode } = useStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const applied = couponCode ? checkCoupon(couponCode, subtotal) : null;

  const apply = (e) => {
    e.preventDefault();
    const res = checkCoupon(input, subtotal);
    if (res.error) return setError(res.error);
    setCouponCode(res.coupon.code);
    setInput('');
    setError('');
  };

  if (couponCode && applied) {
    return (
      <div className={`coupon-applied ${applied.error ? 'invalid' : ''}`}>
        <TagIcon width={16} height={16} />
        <span>
          <strong>{couponCode}</strong>{' '}
          {applied.error ? <span className="error-text">{applied.error}</span> : <>· −{formatPrice(applied.discount)}</>}
        </span>
        <button className="icon-btn sm" onClick={() => setCouponCode('')} aria-label="Remove coupon"><CloseIcon width={16} height={16} /></button>
      </div>
    );
  }

  return (
    <form className="coupon" onSubmit={apply}>
      <div className="coupon-row">
        <input className="input" value={input} onChange={(e) => { setInput(e.target.value.toUpperCase()); setError(''); }} placeholder="Coupon code" aria-label="Coupon code" />
        <button className="btn btn-outline btn-sm" disabled={!input.trim()}>Apply</button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
