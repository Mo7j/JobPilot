import { useState } from 'react';
import { LogIn, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasFirebaseConfig, repoUrl } from '../config';

export default function SignInScreen() {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
    } catch {
      // error message handled by AuthContext
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm anim-rise">
        <div className="flex flex-col items-center gap-3 pb-8 text-center">
          <img src="/jobpilot-192.png" alt="" className="size-14 rounded-2xl anim-float" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">JobPilot</h1>
            <p className="mt-1 text-sm text-muted">Your job-search crew is waiting.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-xs font-semibold text-danger">
              {error}
            </p>
          )}
          {!hasFirebaseConfig && (
            <p className="rounded-xl bg-warn-soft px-3.5 py-2.5 text-xs font-semibold text-warn">
              Firebase isn't configured, fill in app/.env (see docs/SETUP.md).
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="pt-5 text-center text-xs text-muted">
          This is a private, self-hosted deployment.{' '}
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-accent-ink hover:underline"
          >
            Host your own <ExternalLink size={11} />
          </a>
        </p>
      </div>
    </div>
  );
}
