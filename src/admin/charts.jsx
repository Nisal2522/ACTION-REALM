import { useState } from 'react';
import { formatPrice } from '../config/site';

const compact = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n)));

// Area chart with gridlines and a hover readout. data: [{ label, value }]
export function AreaChart({ data, height = 220 }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { l: 44, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = (() => {
    const p = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / p) * p;
  })();
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);
  const labelEvery = Math.ceil(data.length / 8);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  };

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="area-chart" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Sales over time">
        <defs>
          <linearGradient id="adm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="axis">{compact(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
          <text key={d.label + i} x={x(i)} y={H - 6} textAnchor="middle" className="axis">{d.label}</text>
        ))}
        <path d={area} fill="url(#adm-area)" />
        <path d={line} fill="none" stroke="var(--adm-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="hover-line" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="var(--adm-surface)" stroke="var(--adm-accent)" strokeWidth="2.5" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <strong>{formatPrice(data[hover].value)}</strong>
          <span>{data[hover].full || data[hover].label}{data[hover].orders !== undefined && ` · ${data[hover].orders} orders`}</span>
        </div>
      )}
    </div>
  );
}

// Donut chart. segments: [{ label, value, color }]
export function Donut({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--adm-muted-bg)" strokeWidth="18" />
        {total > 0 && segments.filter((s) => s.value).map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="18"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="donut-value">{centerValue ?? total}</text>
        <text x="70" y="86" textAnchor="middle" className="donut-label">{centerLabel}</text>
      </svg>
      <ul className="legend">
        {segments.map((s) => (
          <li key={s.label}><span className="swatch" style={{ background: s.color }} />{s.label}<strong>{s.value}</strong></li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, width = 96, height = 32 }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i * width) / Math.max(1, values.length - 1)},${height - 2 - (v / max) * (height - 4)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sparkline" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="var(--adm-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Side-by-side bars per period (e.g. credit vs debit each month). data: [{ label, a, b }]
export function BarPairChart({ data, aLabel = 'Credit', bLabel = 'Debit', aColor = '#22c55e', bColor = '#ef4444', height = 220 }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { l: 44, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b]));
  const p = 10 ** Math.floor(Math.log10(max));
  const niceMax = Math.ceil(max / p) * p;
  const slot = (W - pad.l - pad.r) / Math.max(1, data.length);
  const bw = Math.min(26, slot * 0.32);
  const y = (v) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="area-chart" role="img" aria-label={`${aLabel} and ${bLabel} by period`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="axis">{compact(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)}>
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" />
              <rect x={cx - bw - 2} y={y(d.a)} width={bw} height={Math.max(0, H - pad.b - y(d.a))} rx="4" fill={aColor} opacity={hover === null || hover === i ? 1 : 0.45} />
              <rect x={cx + 2} y={y(d.b)} width={bw} height={Math.max(0, H - pad.b - y(d.b))} rx="4" fill={bColor} opacity={hover === null || hover === i ? 1 : 0.45} />
              <text x={cx} y={H - 6} textAnchor="middle" className="axis">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="chart-tip" style={{ left: `${((pad.l + slot * hover + slot / 2) / W) * 100}%` }}>
          <strong>{data[hover].label}</strong>
          <span>{aLabel}: {formatPrice(data[hover].a)} · {bLabel}: {formatPrice(data[hover].b)}</span>
          <span>{data[hover].a - data[hover].b >= 0 ? 'Profit' : 'Loss'}: {formatPrice(Math.abs(data[hover].a - data[hover].b))}</span>
        </div>
      )}
      <div className="chart-legend">
        <span><i style={{ background: aColor }} />{aLabel}</span>
        <span><i style={{ background: bColor }} />{bLabel}</span>
      </div>
    </div>
  );
}
