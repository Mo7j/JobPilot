import { useEffect } from 'react';
import { refreshPushToken } from '../lib/push';

// Keeps the stored FCM token fresh. Runs once whenever the authenticated app
// mounts (a cold open of the installed PWA, or a reload). If the owner has
// already granted push permission, it re-registers the service worker and
// re-saves the current token to settings/user — without this, a token saved in
// a previous session goes stale and phone pushes silently stop after you reopen
// the app. Safe no-op in demo mode, without a VAPID key, or before permission.
export function usePushSync() {
  useEffect(() => {
    refreshPushToken().catch(() => {});
  }, []);
}
