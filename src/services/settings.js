import { SITE, applySettings } from '../config/site';
import { db, registerSeed, useCollection } from './db';

// Only the admin's changes are stored; everything else comes from DEFAULT_SETTINGS in code.
registerSeed('settings', () => [{ id: 'site' }]);

const CLEANUP_KEY = 'ar_settings_cleanup_v1';

// Copy saved settings into SITE (call once at startup).
export function loadSettings() {
  const doc = db.get('settings', 'site');
  try {
    if (doc && !localStorage.getItem(CLEANUP_KEY)) {
      const { footer, headerMenu, ...rest } = doc; // eslint-disable-line no-unused-vars
      if (footer || headerMenu) db.replaceAll('settings', [rest]);
      localStorage.setItem(CLEANUP_KEY, '1');
    }
  } catch {
    /* storage unavailable */
  }
  removeSavedLink('/rewards', 'ar_settings_cleanup_v2');
  applySettings(db.get('settings', 'site'));
}

// One-time removal of a footer link from footers the admin already saved.
function removeSavedLink(url, key) {
  try {
    if (localStorage.getItem(key)) return;
    const columns = db.get('settings', 'site')?.footer?.columns;
    if (columns?.some((c) => c.links?.some((l) => l.url === url))) {
      const footer = db.get('settings', 'site').footer;
      saveSettings({ footer: { ...footer, columns: columns.map((c) => ({ ...c, links: (c.links || []).filter((l) => l.url !== url) })) } });
    }
    localStorage.setItem(key, '1');
  } catch {
    /* storage unavailable */
  }
}

// Re-renders when settings change, keeping SITE up to date.
export function useSettings() {
  const doc = useCollection('settings').find((d) => d.id === 'site');
  applySettings(doc);
  return SITE;
}

export function saveSettings(patch) {
  if (db.get('settings', 'site')) db.update('settings', 'site', patch);
  else db.insert('settings', { id: 'site', ...patch });
}
