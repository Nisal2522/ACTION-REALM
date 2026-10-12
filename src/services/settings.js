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
  applySettings(db.get('settings', 'site'));
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
