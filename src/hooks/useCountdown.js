import { useEffect, useState } from 'react';

// Returns { days, hours, minutes, seconds, done } until `target` (ISO date string).
export default function useCountdown(target) {
  const end = target ? new Date(target).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!end) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  const diff = Math.max(0, end - now);
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor(diff / 36e5) % 24,
    minutes: Math.floor(diff / 6e4) % 60,
    seconds: Math.floor(diff / 1e3) % 60,
    done: !end || diff === 0,
  };
}
