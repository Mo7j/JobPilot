import { useEffect, useState } from 'react';

/**
 * Returns the current epoch milliseconds, refreshed on an interval so that
 * relative times ("2m ago") and live counters ("Running for 45s") re-render
 * without a manual refresh.
 *
 * @param {number} intervalMs how often to tick (default 1000ms)
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
