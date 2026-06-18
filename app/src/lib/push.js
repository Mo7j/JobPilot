import { getMessagingInstance } from '../firebase';
import { dataSource } from '../data';
import { vapidKey, firebaseConfig, isDemoMode } from '../config';

// Registers the FCM service worker and returns the registration. The worker is
// registered with the Firebase config base64-encoded in the query string, so no
// config is ever hardcoded in the worker file.
async function registerServiceWorker() {
  const encoded = btoa(JSON.stringify(firebaseConfig));
  return navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?config=${encodeURIComponent(encoded)}`,
  );
}

// Acquires the current FCM token and stores it on settings/user. FCM tokens can
// rotate, and a token only lives in the browser instance that minted it — so we
// must re-acquire and re-save it on every app open, otherwise a token saved in a
// previous session goes stale and pushes silently stop arriving (the "re-open and
// it's gray / no more notifications" bug). Returns the token, or null if push
// isn't available/permitted.
export async function refreshPushToken() {
  if (isDemoMode || !vapidKey) return null;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const { getToken } = await import('firebase/messaging');
  const registration = await registerServiceWorker();
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (token) await dataSource.setDoc('settings', 'user', { fcmToken: token });
  return token;
}

// Prompts for permission (if needed), then registers + stores the token.
// Returns one of: 'on' | 'unsupported' | 'error'.
export async function enablePush() {
  if (isDemoMode || !vapidKey) return 'unsupported';
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return 'unsupported';

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'error';

    const token = await refreshPushToken();
    return token ? 'on' : 'error';
  } catch {
    return 'error';
  }
}

// True when push was already enabled in a previous session (permission granted),
// so the UI can show "Enabled ✓" on load instead of resetting to "Enable".
export function pushAlreadyEnabled() {
  return (
    !isDemoMode &&
    !!vapidKey &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted'
  );
}
