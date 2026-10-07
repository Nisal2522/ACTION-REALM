import { useEffect, useRef } from 'react';
import { SITE } from '../config/site';
import useCountdown from '../hooks/useCountdown';
import { CloseIcon } from './Icons';

export function Modal({ open, onClose, title, children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        {children}
      </div>
    </div>
  );
}

export function Stars({ value = 0, count, size = 16, onChange }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`stars-row ${onChange ? 'interactive' : ''}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rounded >= n ? 'full' : rounded >= n - 0.5 ? 'half' : 'empty';
        const star = <span className={`star ${fill}`} style={{ fontSize: size }}>★</span>;
        return onChange ? (
          <button type="button" key={n} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>{star}</button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
      {count !== undefined && <span className="stars-count">({count})</span>}
    </span>
  );
}

const pad = (n) => String(n).padStart(2, '0');

export function Countdown({ target, label, compact = false }) {
  const { days, hours, minutes, seconds, done } = useCountdown(target);
  if (done) return null;
  if (compact) {
    return <span className="countdown-compact">{label} {days > 0 && `${days}d `}{pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>;
  }
  return (
    <div className="countdown">
      {label && <span className="countdown-label">{label}</span>}
      <div className="countdown-boxes">
        {[[days, 'Days'], [hours, 'Hrs'], [minutes, 'Min'], [seconds, 'Sec']].map(([v, l]) => (
          <span key={l}><strong>{pad(v)}</strong><small>{l}</small></span>
        ))}
      </div>
    </div>
  );
}

export const SaleCountdown = (props) => <Countdown target={SITE.saleEndsAt} label="Sale ends in" {...props} />;
