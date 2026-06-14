import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import { GITHUB_URL, DEMO_URL } from '../content';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#crew', label: 'The crew' },
  { href: '#setup', label: 'Setup' },
  { href: '#faq', label: 'FAQ' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <nav
        data-open={menuOpen}
        className={`relative mx-auto max-w-6xl rounded-[1.4rem] transition-all duration-300 ${
          scrolled
            ? 'bg-card/82 shadow-[0_16px_50px_-28px_rgb(29_26_54_/_0.35)] backdrop-blur-xl lg:max-w-5xl'
            : 'bg-card/88 shadow-[0_12px_38px_-28px_rgb(29_26_54_/_0.32)] backdrop-blur-xl sm:bg-transparent sm:shadow-none sm:backdrop-blur-0'
        }`}
      >
        <div className={`flex items-center gap-4 px-4 transition-all duration-300 ${scrolled ? 'py-2.5' : 'py-3.5'}`}>
          <a href="#top" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="" className="size-8 rounded-xl" />
            <span className="font-display text-lg font-bold tracking-tight">JobPilot</span>
          </a>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 px-4 py-2 text-sm font-semibold text-muted md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
          </div>

          <div className="ml-auto hidden items-center gap-2.5 sm:flex">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost btn-github nav-github-btn" aria-label="GitHub">
              <GitHubIcon size={19} />
            </a>
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-primary nav-demo-btn !px-3.5 !py-2 text-xs">
              Try the demo <ArrowUpRight size={14} />
            </a>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="relative ml-auto grid size-10 place-items-center rounded-xl bg-card text-ink transition-colors hover:text-accent-ink sm:hidden"
          >
            <Menu
              size={20}
              className={`absolute transition-all duration-200 ${menuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
            />
            <X
              size={20}
              className={`absolute transition-all duration-200 ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'}`}
            />
          </button>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-300 sm:hidden ${
            menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0">
            <div className="space-y-2 px-4 pb-4 pt-3">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-bold text-muted transition-colors hover:bg-accent-soft hover:text-accent-ink"
                >
                  {l.label}
                </a>
              ))}
              <div className="grid gap-2 pt-2">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost btn-github !w-full !py-2.5 text-xs">
                  <GitHubIcon size={15} /> GitHub
                </a>
                <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-primary !w-full !py-2.5 text-xs">
                  Try the demo <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
