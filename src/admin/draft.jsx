import { useState } from 'react';
import { SITE } from '../config/site';
import { saveSettings } from '../services/settings';
import { Field } from './fields';

// Read / write nested keys like "about.heroTitle".
export const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
export const setPath = (obj, path, value) => {
  const next = structuredClone(obj);
  const keys = path.split('.');
  let o = next;
  keys.slice(0, -1).forEach((k) => { o[k] = o[k] ?? {}; o = o[k]; });
  o[keys.at(-1)] = value;
  return next;
};

// Edit a copy of the site settings; nothing changes on the website until save().
export function useDraft() {
  const [draft, setDraft] = useState(() => structuredClone(SITE));
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(SITE);

  const get = (path) => getPath(draft, path);
  const set = (path, value) => {
    setDraft((d) => setPath(d, path, value));
    setStatus('');
  };
  const F = (field) => <Field key={field.key} field={field} value={get(field.key)} onChange={(v) => set(field.key, v)} />;

  const save = (validate) => {
    const problem = validate?.(draft);
    if (problem) return setError(problem);
    setError('');
    try {
      // Save only the sections that changed, so untouched settings keep following the defaults.
      const patch = Object.fromEntries(Object.keys(draft).filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(SITE[k])).map((k) => [k, draft[k]]));
      saveSettings(patch);
      setStatus('Saved. Your changes are live on the website.');
    } catch (err) {
      setError(err.message);
    }
  };
  const discard = () => {
    setDraft(structuredClone(SITE));
    setError('');
    setStatus('');
  };
  return { draft, setDraft, get, set, F, dirty, save, discard, status, error };
}

// Sticky bar at the bottom of an editor with Discard / Save.
export function SaveBar({ d, validate, label = 'Save changes' }) {
  return (
    <div className="save-bar">
      {d.error && <p className="error">{d.error}</p>}
      {d.status && !d.dirty && <p className="notice notice-ok no-margin">{d.status}</p>}
      {d.dirty && !d.error && <span className="muted small unsaved">Unsaved changes</span>}
      <button type="button" className="btn btn-outline" disabled={!d.dirty} onClick={d.discard}>Discard</button>
      <button type="button" className="btn" disabled={!d.dirty} onClick={() => d.save(validate)}>{label}</button>
    </div>
  );
}

// A titled card that groups related fields, CMS style.
export function Section({ title, desc, children, aside }) {
  return (
    <section className="cms-section">
      <div className="cms-section-head">
        <div>
          <h3>{title}</h3>
          {desc && <p className="muted small">{desc}</p>}
        </div>
        {aside}
      </div>
      <div className="cms-section-body">{children}</div>
    </section>
  );
}
