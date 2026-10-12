import { useEffect, useRef } from 'react';
import { CloseIcon } from '../components/Icons';

// Slide-in panel from the right, used for every add / edit form in the admin.
// Pass onSubmit to make the panel a form; `footer` holds the action buttons (kept visible at the bottom).
export default function SidePanel({ open, onClose, title, subtitle, children, footer, onSubmit, wide = false }) {
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
  const Body = onSubmit ? 'form' : 'div';

  return (
    <div className="sp-root">
      <div className="sp-scrim" onClick={onClose} />
      <aside className={`sp ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <Body className="sp-inner" onSubmit={onSubmit}>
          <header className="sp-head">
            <div>
              <h2>{title}</h2>
              {subtitle && <p className="muted small">{subtitle}</p>}
            </div>
            <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close"><CloseIcon width={18} height={18} /></button>
          </header>
          <div className="sp-body">{children}</div>
          {footer && <footer className="sp-foot">{footer}</footer>}
        </Body>
      </aside>
    </div>
  );
}
