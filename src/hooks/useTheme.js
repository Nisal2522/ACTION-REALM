import { useEffect, useState } from 'react';

// Light by default; the choice is remembered per browser.
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ar_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ar_theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
