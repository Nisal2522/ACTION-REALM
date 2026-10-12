import { useEffect, useState } from 'react';

// Dark mode by default; a visitor's own choice (moon/sun button) is remembered per browser.
const KEY = 'ar_mode';
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
