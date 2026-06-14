import { useState } from 'react';
import {
  LogOut,
  Moon,
  Sun,
  BellRing,
  RefreshCcw,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import GitHubIcon from '../components/GitHubIcon';
import InstallApp from '../components/InstallApp';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { dataSource, resetDemo } from '../data';
import { getMessagingInstance } from '../firebase';
import { vapidKey, firebaseConfig, isDemoMode, repoUrl } from '../config';
import { cn } from '../lib/utils';

function Row({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="rounded-xl bg-accent-soft p-2.5 text-accent-ink">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        {hint && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, signOut, isDemo } = useAuth();
  const { theme, toggle } = useTheme();
  const [pushState, setPushState] = useState('idle'); // idle | busy | on | unsupported | error
  const [demoResetDone, setDemoResetDone] = useState(false);

  async function enablePush() {
    setPushState('busy');
    try {
      const messaging = await getMessagingInstance();
      if (!messaging || !vapidKey) {
        setPushState('unsupported');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushState('error');
        return;
      }
      const { getToken } = await import('firebase/messaging');
      const encoded = btoa(JSON.stringify(firebaseConfig));
      const registration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?config=${encodeURIComponent(encoded)}`,
      );
      const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
      await dataSource.setDoc('settings', 'user', { fcmToken: token });
      setPushState('on');
    } catch {
      setPushState('error');
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <section className="card divide-y divide-line">
        <Row icon={theme === 'dark' ? Moon : Sun} title="Appearance" hint="Light or dark, follows your system by default.">
          <button type="button" className="btn-ghost text-xs" onClick={toggle}>
            {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          </button>
        </Row>

        <Row
          icon={BellRing}
          title="Push notifications"
          hint={
            isDemoMode
              ? 'Not available in demo mode.'
              : vapidKey
                ? 'Get pinged when an agent needs your approval.'
                : 'Add VITE_FIREBASE_VAPID_KEY to .env to enable web push (optional).'
          }
        >
          <button
            type="button"
            className={cn('btn-ghost text-xs', pushState === 'on' && '!bg-success-soft !text-success !border-transparent')}
            disabled={isDemoMode || !vapidKey || pushState === 'busy' || pushState === 'on'}
            onClick={enablePush}
          >
            {{ idle: 'Enable', busy: 'Enabling…', on: 'Enabled ✓', unsupported: 'Unsupported', error: 'Retry' }[pushState]}
          </button>
        </Row>

        {isDemo ? (
          <Row icon={RefreshCcw} title="Demo data" hint="Put every sample job and approval back where it started.">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                resetDemo();
                setDemoResetDone(true);
                setTimeout(() => setDemoResetDone(false), 2000);
              }}
            >
              {demoResetDone ? 'Reset ✓' : 'Reset demo'}
            </button>
          </Row>
        ) : (
          <Row icon={LogOut} title="Account" hint={user?.email}>
            <button type="button" className="btn-danger-soft text-xs" onClick={signOut}>
              Sign out
            </button>
          </Row>
        )}
      </section>

      <section className="card divide-y divide-line">
        <Row icon={GitHubIcon} title="JobPilot is open source" hint="MIT licensed. Star it, fork it, make it yours.">
          <a href={repoUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
            GitHub
          </a>
        </Row>
        <Row icon={BookOpen} title="Setup guide" hint="Step-by-step: your own Firebase, Claude agents, connectors.">
          <a href={`${repoUrl}/blob/main/docs/SETUP.md`} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
            docs/SETUP.md
          </a>
        </Row>
        <Row
          icon={ShieldCheck}
          title="Your data, your project"
          hint="This app talks only to the Firebase project configured in .env, there is no third-party backend."
        />
      </section>

      <InstallApp />

      <p className="text-center text-xs text-faint">
        JobPilot v1.0 · {isDemo ? 'demo mode' : firebaseConfig.projectId}
      </p>
    </div>
  );
}
