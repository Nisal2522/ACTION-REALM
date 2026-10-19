// One-time clean-up of text already saved in this browser: long dashes (" — ") in sentences are
// rewritten as commas, matching the updated wording on the site.
import { db } from './db';

const FLAG = 'ar_cleanup_dashes_v1';
const COLLECTIONS = ['settings', 'heroSlides', 'brandStrip', 'characters', 'perks', 'testimonials', 'faqs', 'pages', 'products', 'income', 'expenses'];

const clean = (v) => {
  if (typeof v === 'string') return v.replace(/\s+—\s+/g, ', ');
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
};

export function cleanSavedDashes() {
  try {
    if (localStorage.getItem(FLAG)) return;
    COLLECTIONS.forEach((c) => {
      if (!localStorage.getItem(`ar_db_${c}`)) return; // never saved: defaults from code are already clean
      const before = db.all(c);
      const after = clean(before);
      if (JSON.stringify(after) !== JSON.stringify(before)) db.replaceAll(c, after);
    });
    localStorage.setItem(FLAG, '1');
  } catch {
    /* storage unavailable */
  }
}
