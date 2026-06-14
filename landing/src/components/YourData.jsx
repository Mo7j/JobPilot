import { Database, Globe, HardDrive, Plug, Lock, EyeOff } from 'lucide-react';
import Reveal from './Reveal';

const CONNECTORS = [
  { icon: Plug, name: 'Claude (Desktop or Code)', role: 'Runs the agents + the MCP bridge to your Firestore' },
  { icon: Globe, name: 'Claude in Chrome', role: 'Browses job boards and fills application forms' },
  { icon: HardDrive, name: 'Google Drive', role: 'Delivers CVs, reports, and screenshots to your phone' },
  { icon: Database, name: 'Your Firebase', role: 'The only database, created and owned by you' },
];

export default function YourData() {
  return (
    <section className="bg-night py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="chip bg-white/10 text-white mb-4">Your data, your keys</span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              There is no JobPilot server.{' '}
              <span className="text-amber">That's the point.</span>
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/70">
              During setup <strong className="text-white">you create your own Firebase project</strong>, 
              free tier, and everything lives there: your profile, your applications, your
              documents. The dashboard and the agents talk only to it. Nobody else can see
              your job search, including the people who built this.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-white/80">
              <li className="flex items-center gap-2.5">
                <Lock size={16} className="shrink-0 text-amber" />
                Firestore security rules lock the project to your account alone.
              </li>
              <li className="flex items-center gap-2.5">
                <EyeOff size={16} className="shrink-0 text-amber" />
                No telemetry, no analytics, no phone-home. Read the code.
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="grid gap-4 sm:grid-cols-2">
              {CONNECTORS.map(({ icon: Icon, name, role }) => (
                <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <span className="inline-flex rounded-xl bg-white/10 p-2.5">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold">{name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{role}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
