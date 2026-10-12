import { ChevronIcon } from '../components/Icons';

// Page numbers with « previous / next ». Shows at most 7 page buttons (with … gaps).
export default function Pagination({ page, pageSize, total, onPage, onPageSize, sizes = [10, 20, 50] }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const numbers = [];
  for (let n = 1; n <= pages; n += 1) {
    if (n === 1 || n === pages || Math.abs(n - page) <= 1) numbers.push(n);
    else if (numbers[numbers.length - 1] !== '…') numbers.push('…');
  }

  return (
    <div className="pager">
      <span className="muted small">Showing <strong>{from}–{to}</strong> of <strong>{total}</strong></span>
      <div className="pager-right">
        {onPageSize && (
          <label className="pager-size muted small">
            Rows
            <select className="input" value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <nav className="pager-nav" aria-label="Pagination">
          <button disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronIcon dir="left" width={16} height={16} /></button>
          {numbers.map((n, i) => (n === '…'
            ? <span key={`gap${i}`} className="pager-gap">…</span>
            : <button key={n} className={n === page ? 'active' : ''} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}>{n}</button>))}
          <button disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronIcon dir="right" width={16} height={16} /></button>
        </nav>
      </div>
    </div>
  );
}
