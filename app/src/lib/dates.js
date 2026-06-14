export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  return new Date(value);
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysSince(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

export function formatRelativeTime(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;

  const diffMs = Date.now() - d.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const seconds = Math.round(abs / 1000);

  if (seconds < 10) return 'just now';

  const suffix = future ? 'from now' : 'ago';
  if (seconds < 60) return `${seconds}s ${suffix}`;

  const minutes = Math.round(abs / 60000);
  if (minutes < 60) return `${minutes}m ${suffix}`;
  const hours = Math.round(abs / 3600000);
  if (hours < 24) return `${hours}h ${suffix}`;
  const days = Math.round(abs / 86400000);
  if (days < 7) return `${days}d ${suffix}`;
  const weeks = Math.round(abs / 604800000);
  return `${weeks}w ${suffix}`;
}

/**
 * Seconds elapsed since `value` (a Date, ISO string, or Firestore Timestamp).
 * Returns null when the value is missing/invalid. Never negative.
 */
export function elapsedSeconds(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
}

/**
 * Human-friendly duration from a number of seconds.
 * 45 -> "45s", 130 -> "2m 10s", 3780 -> "1h 3m", 180000 -> "2d 2h".
 */
export function formatDuration(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return null;
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s}s`;
  const minutes = Math.floor(s / 60);
  if (minutes < 60) return `${minutes}m ${s % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

/** Absolute, human-readable timestamp for tooltips (e.g. "Jun 9, 2026, 3:14 PM"). */
export function formatDateTime(value) {
  const d = toDate(value);
  if (!d || isNaN(d)) return null;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isOverdue(value) {
  const d = toDate(value);
  if (!d) return false;
  return d < new Date();
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
