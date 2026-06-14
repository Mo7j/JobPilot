/**
 * Central app configuration, everything comes from environment variables.
 * See app/.env.example for the full list and docs/SETUP.md for setup steps.
 */
const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** True when every required Firebase key is present. */
export const hasFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].every(Boolean);

/**
 * Demo mode: explicit via VITE_DEMO_MODE=true, or automatic when Firebase
 * isn't configured. The app then runs on bundled sample data (Jane Doe's
 * job search) and nothing is persisted.
 */
export const isDemoMode = env.VITE_DEMO_MODE === 'true' || !hasFirebaseConfig;

/** The single account allowed to use this deployment (live mode only). */
export const allowedEmail = (env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase();

/** Optional, enables web push notifications when set. */
export const vapidKey = env.VITE_FIREBASE_VAPID_KEY || '';

/** Repo link used in a few help spots. */
export const repoUrl = env.VITE_REPO_URL || 'https://github.com/Mo7j/JobPilot';
