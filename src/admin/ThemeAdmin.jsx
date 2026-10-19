import { SaveBar, Section, useDraft } from './draft';

const PRESETS = ['#b90a1c', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#2563eb', '#7c3aed', '#db2777', '#111827'];

export default function ThemeAdmin() {
  const d = useDraft();
  const accent = d.get('accentColor');
  const radius = Number(d.get('radius')) || 0;

  return (
    <div className="theme-layout">
      <div>
        <Section title="Logo" desc="Shown in the header, footer, admin panel and newsletter popup. Square images work best.">
          <div className="form-grid">{d.F({ key: 'logo', label: 'Logo', type: 'image', max: 512, shape: 'square' })}</div>
        </Section>

        <Section title="Brand colour" desc="Used for buttons, links, prices, badges and highlights across the whole site.">
          <div className="swatches">
            {PRESETS.map((c) => (
              <button key={c} type="button" className={`swatch-btn ${accent?.toLowerCase() === c ? 'active' : ''}`} style={{ background: c }} onClick={() => d.set('accentColor', c)} aria-label={`Use ${c}`} title={c} />
            ))}
          </div>
          <div className="form-grid">{d.F({ key: 'accentColor', label: 'Custom colour', type: 'color', span: 2 })}</div>
        </Section>

        <Section title="Style">
          <div className="form-grid">
            <label className="field span-2">
              <span className="field-label">Corner rounding: {radius}px</span>
              <input type="range" min="0" max="24" step="2" value={radius} onChange={(e) => d.set('radius', Number(e.target.value))} />
              <span className="muted small">0 = sharp, square corners · 24 = very rounded cards and images.</span>
            </label>
            {d.F({ key: 'defaultMode', label: 'Colour mode for new visitors', type: 'select', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }], help: 'Visitors can still switch with the moon/sun button.' })}
          </div>
        </Section>
      </div>

      <aside className="theme-preview" style={{ '--pv-accent': accent, '--pv-radius': `${radius}px` }}>
        <span className="cms-group-title">Live preview</span>
        <div className="pv-card">
          <div className="pv-img">
            <span className="pv-badge">New</span>
          </div>
          <div className="pv-body">
            <span className="pv-brand">Hot Toys</span>
            <strong>Iron Man Mark LXXXV</strong>
            <span className="pv-price">Rs. 121,999</span>
            <span className="pv-btn">+ Add to cart</span>
          </div>
        </div>
        <p className="muted small">This is how products and buttons will look. Save to apply it to the website.</p>
      </aside>

      <SaveBar d={d} />
    </div>
  );
}
