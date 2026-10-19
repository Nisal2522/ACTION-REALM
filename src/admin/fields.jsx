import { useState } from 'react';
import { CloseIcon, PlusIcon } from '../components/Icons';

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// Shrink an uploaded photo so it fits comfortably in browser storage.
export function resizeImage(file, max = 1200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const isPng = file.type === 'image/png';
      resolve(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = URL.createObjectURL(file);
  });
}

// Upload a single image (stored as a data: URL; older content may still hold a normal URL).
export function ImageInput({ value, onChange, max = 1200, shape = 'tall' }) {
  const [error, setError] = useState('');
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onChange(await resizeImage(file, max));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="image-field">
      <span className={`thumb big ${shape}`}>{value ? <img src={value} alt="" /> : <span className="muted small">No image</span>}</span>
      <div className="stack grow">
        <label className="btn btn-outline btn-sm upload-btn">
          {value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" hidden onChange={upload} />
        </label>
        {value && <button type="button" className="link-btn left-align" onClick={() => onChange('')}>Remove image</button>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

// Renders one input for a field definition: { key, label, type, options, placeholder, help, required, span }
export function FieldInput({ field, value, onChange }) {
  const { type = 'text', options = [], placeholder, required } = field;
  if (type === 'textarea') {
    return <textarea className="input" rows={field.rows || 4} required={required} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (type === 'select') {
    return (
      <select className="input" required={required} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    );
  }
  if (type === 'checkbox') {
    return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
  }
  if (type === 'image') return <ImageInput value={value} onChange={onChange} max={field.max} shape={field.shape} />;
  if (type === 'color') {
    return (
      <span className="color-field">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      </span>
    );
  }
  if (type === 'number') {
    return <input className="input" type="number" step={field.step || 'any'} min={field.min} required={required} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
  }
  return <input className="input" type={type} required={required} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
}

export function Field({ field, value, onChange }) {
  if (field.type === 'checkbox') {
    return (
      <label className={`check ${field.span === 2 ? 'span-2' : ''}`}>
        <FieldInput field={field} value={value} onChange={onChange} /> {field.label}
        {field.help && <span className="muted small"> ({field.help})</span>}
      </label>
    );
  }
  return (
    <label className={`field ${field.span === 2 || ['textarea', 'image'].includes(field.type) ? 'span-2' : ''}`}>
      <span className="field-label">{field.label}</span>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.help && <span className="muted small">{field.help}</span>}
    </label>
  );
}

// Editable list of simple strings (e.g. categories).
export function StringList({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) return;
    onChange([...value, v]);
    setDraft('');
  };
  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="string-list">
      <div className="chips">
        {value.map((v, i) => (
          <span key={v} className="chip static">
            {i > 0 && <button type="button" className="chip-move" onClick={() => move(i, -1)} aria-label={`Move ${v} left`}>‹</button>}
            {v}
            {i < value.length - 1 && <button type="button" className="chip-move" onClick={() => move(i, 1)} aria-label={`Move ${v} right`}>›</button>}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`}><CloseIcon width={14} height={14} /></button>
          </span>
        ))}
      </div>
      <div className="coupon-row">
        <input className="input" value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" className="btn btn-outline btn-sm" onClick={add}><PlusIcon width={14} height={14} /> Add</button>
      </div>
    </div>
  );
}

// Editable list of small objects (e.g. store locations) using field definitions.
export function ObjectList({ value = [], onChange, fields, newItem, itemLabel = 'item' }) {
  const update = (i, key, v) => onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  return (
    <div className="object-list">
      {value.map((row, i) => (
        <div key={i} className="object-row">
          <div className="form-grid">
            {fields.map((f) => <Field key={f.key} field={f} value={row[f.key]} onChange={(v) => update(i, f.key, v)} />)}
          </div>
          <button type="button" className="link-btn" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove {itemLabel}</button>
        </div>
      ))}
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...value, { ...newItem }])}><PlusIcon width={14} height={14} /> Add {itemLabel}</button>
    </div>
  );
}

// Several product photos: upload (or drag & drop) many at once, reorder, remove. The first one is the main photo.
export function MultiImageInput({ value = [], onChange, max = 900, limit = 15 }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const room = limit - value.length;
    if (room <= 0) return setError(`You can add up to ${limit} photos.`);
    setBusy(true);
    try {
      const added = await Promise.all(files.slice(0, room).map((f) => resizeImage(f, max)));
      onChange([...value, ...added]);
      setError(files.length > room ? `Only ${room} more photo${room > 1 ? 's' : ''} could be added (limit ${limit}).` : '');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="multi-image">
      <div className="mi-grid">
        {value.map((src, i) => (
          <div key={`${i}-${src.length}`} className={`mi-item ${i === 0 ? 'main' : ''}`}>
            <img src={src} alt={`Photo ${i + 1}`} />
            {i === 0 && <span className="mi-main">Main</span>}
            <div className="mi-tools">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left" title="Move left">‹</button>
              {i !== 0 && <button type="button" onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])} title="Make main photo" aria-label="Make main photo">★</button>}
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move right" title="Move right">›</button>
              <button type="button" className="mi-remove" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove photo" title="Remove"><CloseIcon width={14} height={14} /></button>
            </div>
          </div>
        ))}
        {value.length < limit && (
          <label
            className={`mi-add ${dragOver ? 'over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          >
            <PlusIcon width={22} height={22} />
            <span>{busy ? 'Adding…' : 'Add photos'}</span>
            <small>or drag & drop</small>
            <input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </label>
        )}
      </div>
      <p className="muted small">{value.length}/{limit} photos · The first photo is shown on product cards. Use ‹ › to reorder or ★ to make a photo the main one.</p>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
