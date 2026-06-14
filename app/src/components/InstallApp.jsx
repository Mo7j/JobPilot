import { useEffect, useState } from 'react';
import { Smartphone, Share, SquarePlus, CheckCircle2, Download } from 'lucide-react';

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Mac, distinguish by touch support
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export default function InstallApp() {
  const [standalone, setStandalone] = useState(isStandalone());
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault(); // stash so we can trigger it from our own button
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandalone());

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    mq.addEventListener?.('change', onChange);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      mq.removeEventListener?.('change', onChange);
    };
  }, []);

  async function promptInstall() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  // Already running as the installed, full-screen app.
  if (standalone || installed) {
    return (
      <section className="card flex items-center gap-4 px-5 py-4">
        <span className="rounded-xl bg-success-soft p-2.5 text-success">
          <CheckCircle2 size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Installed</p>
          <p className="text-xs text-muted leading-relaxed">
            You're running JobPilot as a full-screen app, no browser bars.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        <span className="rounded-xl bg-accent-soft p-2.5 text-accent-ink">
          <Smartphone size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Install JobPilot</p>
          <p className="text-xs text-muted leading-relaxed">
            Add it to your home screen to run full-screen.
          </p>
        </div>
        {deferred && (
          <button type="button" className="btn-primary shrink-0 text-xs" onClick={promptInstall}>
            <Download size={14} /> Install
          </button>
        )}
      </div>

      {/* iOS has no install prompt API, show the manual steps. */}
      {ios && !deferred && (
        <ol className="border-t border-line bg-card-2/40 px-5 py-4 text-xs text-muted">
          <li className="flex items-center gap-2.5 py-1">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-bold text-accent-ink">
              1
            </span>
            Tap the <Share size={13} className="mx-0.5 inline text-accent" /> Share button in Safari's toolbar.
          </li>
          <li className="flex items-center gap-2.5 py-1">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-bold text-accent-ink">
              2
            </span>
            Choose <SquarePlus size={13} className="mx-0.5 inline text-accent" /> “Add to Home Screen”.
          </li>
          <li className="flex items-center gap-2.5 py-1">
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-bold text-accent-ink">
              3
            </span>
            Open JobPilot from the new home-screen icon, not from Safari.
          </li>
        </ol>
      )}

      {/* Non-iOS, no prompt captured yet (e.g. already dismissed, or unsupported browser). */}
      {!ios && !deferred && (
        <p className="border-t border-line bg-card-2/40 px-5 py-4 text-xs text-muted leading-relaxed">
          Open your browser menu and choose <strong className="text-ink">“Install app”</strong> or{' '}
          <strong className="text-ink">“Add to Home screen”</strong>. If you don't see it, the app may already be
          installed.
        </p>
      )}
    </section>
  );
}
