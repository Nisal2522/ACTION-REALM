import { useEffect, useState } from 'react';
import { formatPrice } from '../config/site';
import { EXPENSE_METHODS, INCOME_METHODS, buildLedger } from '../data/finance';
import { db, useCollection } from '../services/db';
import { EditIcon, ExpenseIcon, IncomeIcon, PlusIcon, TagIcon, TrashIcon, TrendIcon } from '../components/Icons';
import SidePanel from './SidePanel';
import PageActions from './PageActions';
import Pagination from './Pagination';
import ExcelButton, { downloadExcel } from './ExcelExport';
import { FilterSelect, SearchInput } from './Toolbar';
import { BarPairChart } from './charts';
import { fmtDate } from './fields';

const today = () => new Date().toISOString().slice(0, 10);
const monthKey = (d) => d.slice(0, 7);
const inRange = (date, from, to) => (!from || date >= from) && (!to || date <= to);

// ── Shared entry page (Income / Expenses) ───────────────────────────────────
const CONFIG = {
  income: { collection: 'income', noun: 'income', title: 'Income', methods: INCOME_METHODS, tone: 'pos' },
  expenses: { collection: 'expenses', noun: 'expense', title: 'Expense', methods: EXPENSE_METHODS, tone: 'neg' },
};

function EntryPage({ kind }) {
  const cfg = CONFIG[kind];
  const entries = useCollection(cfg.collection);
  const [q, setQ] = useState('');
  const [method, setMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState(null);

  const methods = [...new Set([...cfg.methods, ...entries.map((x) => x.method).filter(Boolean)])];
  const needle = q.trim().toLowerCase();
  const list = [...entries]
    .filter((x) => (!method || x.method === method)
      && inRange(x.date, from, to)
      && (!needle || [x.description, x.shipmentNo, x.orderNo, x.method].join(' ').toLowerCase().includes(needle)))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));

  useEffect(() => setPage(1), [q, method, from, to, pageSize]);
  const lastPage = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(page, lastPage);
  const visible = list.slice((current - 1) * pageSize, current * pageSize);

  const total = list.reduce((s, x) => s + Number(x.amount || 0), 0);
  const thisMonth = entries.filter((x) => monthKey(x.date) === monthKey(today())).reduce((s, x) => s + Number(x.amount || 0), 0);
  const byMethod = Object.entries(list.reduce((m, x) => ({ ...m, [x.method]: (m[x.method] || 0) + Number(x.amount || 0) }), {})).sort((a, b) => b[1] - a[1]);

  const remove = (x) => {
    if (window.confirm(`Delete this ${cfg.noun} entry?`)) db.remove(cfg.collection, x.id);
  };
  const exportExcel = () => downloadExcel(kind, [
    ['Date', 'Method', 'Description', 'Amount (Rs.)', 'Shipment No', 'Order No'],
    ...list.map((x) => [x.date, x.method, x.description, x.amount, x.shipmentNo, x.orderNo]),
  ]);

  return (
    <>
      <PageActions>
        <button className="btn" onClick={() => setEditing({ method: cfg.methods[0], description: '', date: today(), amount: '', shipmentNo: '', orderNo: '' })}>
          <PlusIcon width={16} height={16} /> Add {cfg.noun}
        </button>
      </PageActions>

      <div className="fin-kpis">
        <div className={`adm-card fin-kpi ${cfg.tone}`}><span className="kpi-label">{from || to || method || q ? 'Total (filtered)' : `Total ${cfg.noun}`}</span><strong>{formatPrice(total)}</strong><span className="muted small">{list.length} entries</span></div>
        <div className="adm-card fin-kpi"><span className="kpi-label">This month</span><strong>{formatPrice(thisMonth)}</strong><span className="muted small">{new Date().toLocaleDateString('en-LK', { month: 'long', year: 'numeric' })}</span></div>
        <div className="adm-card fin-kpi"><span className="kpi-label">Biggest method</span><strong className="fin-small">{byMethod[0]?.[0] || 'None yet'}</strong><span className="muted small">{byMethod[0] ? formatPrice(byMethod[0][1]) : 'No entries yet'}</span></div>
      </div>

      <div className="admin-toolbar wrap">
        <SearchInput value={q} onChange={setQ} placeholder="Search description, shipment or order no…" />
        <FilterSelect label="Method" icon={TagIcon} value={method} onChange={setMethod} options={[{ value: '', label: 'All methods' }, ...methods.map((m) => ({ value: m, label: m }))]} />
        <label className="date-filter"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="date-filter"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        {list.length > 0 && <ExcelButton onClick={exportExcel} label={`Export ${kind} to Excel`} />}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Method</th><th>Description</th><th>Shipment No</th><th>Order No</th><th className="num">Amount</th><th className="actions-col">Actions</th></tr></thead>
          <tbody>
            {visible.map((x) => (
              <tr key={x.id} className="clickable" onClick={() => setEditing(x)}>
                <td className="nowrap">{fmtDate(x.date)}</td>
                <td><span className="badge-status">{x.method}</span></td>
                <td>{x.description}</td>
                <td className="muted">{x.shipmentNo}</td>
                <td className="muted">{x.orderNo}</td>
                <td className={`num strong ${cfg.tone}`}>{formatPrice(x.amount)}</td>
                <td className="actions" onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn sm" onClick={() => setEditing(x)} aria-label="Edit"><EditIcon width={16} height={16} /></button>
                  <button className="icon-btn sm danger" onClick={() => remove(x)} aria-label="Delete"><TrashIcon width={16} height={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="muted small table-empty">No {cfg.noun} entries {entries.length ? 'match these filters' : 'yet. Click “Add ' + cfg.noun + '” to add one'}.</p>}
        <Pagination page={current} pageSize={pageSize} total={list.length} onPage={setPage} onPageSize={setPageSize} />
      </div>

      {editing && <EntryForm cfg={cfg} methods={methods} initial={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function EntryForm({ cfg, methods, initial, onClose }) {
  const [f, setF] = useState({ ...initial, amount: initial.amount ?? '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = (e) => {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!f.method.trim()) return setError('Choose or type a method.');
    if (!f.description.trim()) return setError('Enter a description.');
    if (!f.date) return setError('Choose a date.');
    if (!(amount > 0)) return setError('Enter an amount greater than 0.');
    const data = { method: f.method.trim(), description: f.description.trim(), date: f.date, amount, shipmentNo: f.shipmentNo.trim().toUpperCase(), orderNo: f.orderNo.trim().toUpperCase() };
    if (initial.id) db.update(cfg.collection, initial.id, data);
    else db.insert(cfg.collection, data);
    onClose();
  };

  return (
    <SidePanel
      open
      onClose={onClose}
      onSubmit={save}
      title={initial.id ? `Edit ${cfg.noun}` : `Add ${cfg.noun}`}
      subtitle={initial.id ? `${fmtDate(initial.date)} · ${formatPrice(initial.amount)}` : `Record a new ${cfg.noun}. It appears on the Bank page straight away.`}
      footer={(
        <>
          {error && <p className="error sp-error">{error}</p>}
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn">{initial.id ? 'Save changes' : `Add ${cfg.noun}`}</button>
        </>
      )}
    >
      <div className="form-grid">
        <label className="field span-2">
          <span className="field-label">{cfg.title} method</span>
          <input className="input" list={`${cfg.collection}-methods`} value={f.method} onChange={set('method')} placeholder="Pick from the list or type a new one" />
          <datalist id={`${cfg.collection}-methods`}>{methods.map((m) => <option key={m} value={m} />)}</datalist>
        </label>
        <label className="field span-2">
          <span className="field-label">{cfg.title} description</span>
          <textarea className="input" rows={3} value={f.description} onChange={set('description')} placeholder={cfg.noun === 'income' ? 'e.g. Comic-con stall sales' : 'e.g. Customs clearance, batch 3'} />
        </label>
        <label className="field"><span className="field-label">Date</span><input className="input" type="date" value={f.date} onChange={set('date')} /></label>
        <label className="field">
          <span className="field-label">Amount (Rs.)</span>
          <input className="input amount-input" type="number" min="0" step="any" inputMode="decimal" value={f.amount} onChange={set('amount')} placeholder="0" />
        </label>
        <label className="field"><span className="field-label">Shipment No</span><input className="input" value={f.shipmentNo} onChange={set('shipmentNo')} placeholder="e.g. SHP-004" /></label>
        <label className="field"><span className="field-label">Order number</span><input className="input" value={f.orderNo} onChange={set('orderNo')} placeholder="e.g. AR10042" /></label>
      </div>
    </SidePanel>
  );
}

export const IncomeAdmin = () => <EntryPage kind="income" />;
export const ExpensesAdmin = () => <EntryPage kind="expenses" />;

// ── Bank page: profit / loss overview + ledger ──────────────────────────────
const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: '30', label: '30 days' },
  { id: '90', label: '90 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
];

function periodRange(period, from, to) {
  const iso = (d) => d.toISOString().slice(0, 10);
  if (period === 'month') return [`${today().slice(0, 7)}-01`, today()];
  if (period === '30' || period === '90') return [iso(new Date(Date.now() - Number(period) * 864e5)), today()];
  if (period === 'custom') return [from, to];
  return ['', ''];
}

const SOURCE_STYLE = { Expense: 'out', Income: 'in', 'Pre-order': 'pre' };

export function BankAdmin() {
  const income = useCollection('income');
  const expenses = useCollection('expenses');
  const orders = useCollection('orders');
  const [view, setView] = useState('date');
  const [period, setPeriod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(15);
  const [openShipment, setOpenShipment] = useState(null);

  const [start, end] = periodRange(period, from, to);
  const needle = q.trim().toLowerCase();
  const rows = buildLedger({ income, expenses, orders }).filter((r) => inRange(r.date, start, end)
    && (type === 'all' || r.kind === type)
    && (!needle || [r.description, r.shipmentNo, r.orderNo, r.method].join(' ').toLowerCase().includes(needle)));

  useEffect(() => setShown(15), [period, from, to, type, q, view]);

  const credit = rows.reduce((s, r) => s + r.credit, 0);
  const debit = rows.reduce((s, r) => s + r.debit, 0);
  const net = credit - debit;
  const preorder = rows.filter((r) => r.source === 'Pre-order').reduce((s, r) => s + r.credit, 0);
  const inShare = credit + debit ? (credit / (credit + debit)) * 100 : 50;

  const months = [...new Set(rows.map((r) => monthKey(r.date)))].sort().slice(-6);
  const chart = months.map((m) => ({
    label: new Date(`${m}-01`).toLocaleDateString('en-LK', { month: 'short' }),
    a: rows.filter((r) => monthKey(r.date) === m).reduce((s, r) => s + r.credit, 0),
    b: rows.filter((r) => monthKey(r.date) === m).reduce((s, r) => s + r.debit, 0),
  }));

  const shipments = Object.values(rows.reduce((g, r) => {
    const key = r.shipmentNo || '';
    g[key] = g[key] || { key, rows: [], credit: 0, debit: 0 };
    g[key].rows.push(r);
    g[key].credit += r.credit;
    g[key].debit += r.debit;
    return g;
  }, {}))
    .map((g) => ({ ...g, net: g.credit - g.debit }))
    .sort((a, b) => (a.key === '') - (b.key === '') || b.key.localeCompare(a.key));

  let running = 0;
  const withBalance = rows.map((r) => ({ ...r, balance: (running += r.credit - r.debit) })).reverse();

  const exportExcel = () => downloadExcel(`bank-statement-${period}`, [
    ['Date', 'Type', 'Source', 'Method', 'Description', 'Shipment No', 'Order No', 'Debit (Rs.)', 'Credit (Rs.)'],
    ...rows.map((r) => [r.date, r.kind === 'debit' ? 'Debit' : 'Credit', r.source, r.method, r.description, r.shipmentNo, r.orderNo, r.debit || '', r.credit || '']),
    [],
    ['', '', '', '', 'TOTAL', '', '', debit, credit],
    ['', '', '', '', net >= 0 ? 'PROFIT' : 'LOSS', '', '', '', Math.abs(net)],
  ]);

  return (
    <div className="bk">
      {/* ── Overview ── */}
      <div className="bk-top">
        <div className={`bk-hero ${net >= 0 ? 'profit' : 'loss'}`}>
          <div className="bk-hero-head">
            <span className="bk-hero-label">{net >= 0 ? 'Net profit' : 'Net loss'}</span>
            <span className="bk-pill">{PERIODS.find((p) => p.id === period)?.label}</span>
          </div>
          <div className="bk-hero-value">
            <TrendIcon down={net < 0} width={28} height={28} />
            {formatPrice(Math.abs(net))}
          </div>
          <div className="bk-split" aria-label={`Money in ${Math.round(inShare)}%, money out ${100 - Math.round(inShare)}%`}>
            <span className="in" style={{ width: `${inShare}%` }} />
            <span className="out" style={{ width: `${100 - inShare}%` }} />
          </div>
          <div className="bk-split-legend">
            <span><i className="in" />Money in {formatPrice(credit)}</span>
            <span><i className="out" />Money out {formatPrice(debit)}</span>
          </div>
          <div className="bk-hero-foot">
            <span>Margin <strong>{credit ? `${((net / credit) * 100).toFixed(1)}%` : '0%'}</strong></span>
            <span>Transactions <strong>{rows.length}</strong></span>
          </div>
        </div>

        <div className="bk-side">
          <div className="bk-mini in">
            <span className="bk-mini-icon"><IncomeIcon width={20} height={20} /></span>
            <div><span className="muted small">Credit</span><strong>{formatPrice(credit)}</strong><span className="muted small">incl. pre-orders {formatPrice(preorder)}</span></div>
          </div>
          <div className="bk-mini out">
            <span className="bk-mini-icon"><ExpenseIcon width={20} height={20} /></span>
            <div><span className="muted small">Debit</span><strong>{formatPrice(debit)}</strong><span className="muted small">all expenses</span></div>
          </div>
        </div>

        <div className="adm-card bk-chart">
          <div className="card-head"><h3>Monthly</h3><span className="muted small">in vs out</span></div>
          {chart.length ? <BarPairChart data={chart} aLabel="In" bLabel="Out" width={380} height={240} /> : <p className="muted small">No data for this period.</p>}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="bk-controls">
        <div className="segmented" role="group" aria-label="Period">
          {PERIODS.map((p) => <button key={p.id} className={period === p.id ? 'active' : ''} onClick={() => setPeriod(p.id)}>{p.label}</button>)}
        </div>
        {period === 'custom' && (
          <div className="bk-dates">
            <label className="date-filter"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label className="date-filter"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          </div>
        )}
        <div className="bk-controls-right">
          <div className="segmented" role="group" aria-label="Show">
            {[['all', 'All'], ['credit', 'In'], ['debit', 'Out']].map(([v, l]) => <button key={v} className={type === v ? 'active' : ''} onClick={() => setType(v)}>{l}</button>)}
          </div>
          {rows.length > 0 && <ExcelButton onClick={exportExcel} label="Export bank statement to Excel" />}
        </div>
      </div>

      {/* ── Ledger ── */}
      <div className="adm-card bk-ledger">
        <div className="bk-ledger-head">
          <div className="bk-tabs" role="tablist">
            <button role="tab" aria-selected={view === 'date'} className={view === 'date' ? 'active' : ''} onClick={() => setView('date')}>Date wise</button>
            <button role="tab" aria-selected={view === 'shipment'} className={view === 'shipment' ? 'active' : ''} onClick={() => setView('shipment')}>Shipment wise</button>
          </div>
          <SearchInput value={q} onChange={setQ} placeholder="Search…" />
        </div>

        {!rows.length && <p className="muted small table-empty">No transactions for this period.</p>}

        {view === 'date' && rows.length > 0 && (
          <>
            <ul className="bk-list">
              {withBalance.slice(0, shown).map((r) => (
                <li key={r.id} className="bk-item">
                  <span className={`bk-icon ${SOURCE_STYLE[r.source]}`}>{r.kind === 'debit' ? <ExpenseIcon width={18} height={18} /> : <IncomeIcon width={18} height={18} />}</span>
                  <div className="bk-item-main">
                    <strong>{r.description}</strong>
                    <span className="muted small">{fmtDate(r.date)} · {r.method}{r.source === 'Pre-order' && ' · pre-order'}</span>
                  </div>
                  <div className="bk-refs">
                    {r.shipmentNo && <span className="bk-chip">{r.shipmentNo}</span>}
                    {r.orderNo && <span className="bk-chip ghost">#{r.orderNo}</span>}
                  </div>
                  <div className="bk-amount">
                    <strong className={r.kind === 'debit' ? 'neg' : 'pos'}>{r.kind === 'debit' ? '−' : '+'}{formatPrice(r.debit || r.credit)}</strong>
                    <span className="muted small">Bal. {formatPrice(r.balance)}</span>
                  </div>
                </li>
              ))}
            </ul>
            {shown < withBalance.length && (
              <button className="bk-more" onClick={() => setShown(shown + 15)}>Show more ({withBalance.length - shown} left)</button>
            )}
          </>
        )}

        {view === 'shipment' && rows.length > 0 && (
          <div className="bk-ships">
            {shipments.map((g) => {
              const open = openShipment === g.key;
              const total = g.credit + g.debit || 1;
              return (
                <div key={g.key || 'none'} className={`bk-ship ${g.net >= 0 ? 'profit' : 'loss'} ${open ? 'open' : ''}`}>
                  <button className="bk-ship-head" onClick={() => setOpenShipment(open ? null : g.key)} aria-expanded={open}>
                    <span className="bk-ship-title">
                      <strong>{g.key || 'No shipment'}</strong>
                      <span className="muted small">{g.rows.length} transactions</span>
                    </span>
                    <span className="bk-ship-net">
                      <span className="muted small">{g.net >= 0 ? 'Profit' : 'Loss'}</span>
                      <strong>{formatPrice(Math.abs(g.net))}</strong>
                    </span>
                  </button>
                  <div className="bk-split thin">
                    <span className="in" style={{ width: `${(g.credit / total) * 100}%` }} />
                    <span className="out" style={{ width: `${(g.debit / total) * 100}%` }} />
                  </div>
                  <div className="bk-ship-figs">
                    <span><i className="in" />In {formatPrice(g.credit)}</span>
                    <span><i className="out" />Out {formatPrice(g.debit)}</span>
                  </div>
                  {open && (
                    <ul className="bk-ship-rows">
                      {g.rows.map((r) => (
                        <li key={r.id}>
                          <span className="muted small">{fmtDate(r.date)}</span>
                          <span className="bk-ship-desc">{r.description}</span>
                          <strong className={r.kind === 'debit' ? 'neg' : 'pos'}>{r.kind === 'debit' ? '−' : '+'}{formatPrice(r.debit || r.credit)}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
