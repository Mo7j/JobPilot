import { ArrowUpRight, Star } from 'lucide-react';
import Reveal from './Reveal';
import GitHubIcon from './GitHubIcon';
import { GITHUB_URL, DEMO_URL } from '../content';
import relax from '../assets/relax.png';
import claudeLogo from '../assets/claude-logo.png';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-10 pt-20">
      <Reveal>
        <div className="footer-cta">
          <div className="footer-cta-copy">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Let the crew take the night shift.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/78">
              Free, open source, self-hosted. Clone it tonight and wake up to vetted matches waiting for your approval.
            </p>
            <div className="footer-cta-actions mt-7 flex flex-wrap items-center gap-3">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn footer-star-btn" aria-label="Star on GitHub">
                <Star size={16} /> <span className="footer-star-label">Star on GitHub</span>
              </a>
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn footer-demo-btn">
                Try the demo <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
          <img src={relax} alt="" className="footer-cta-image" loading="lazy" />
        </div>
      </Reveal>

      <div className="footer-meta">
        <p className="footer-brand">
          <img src="/logo.png" alt="" className="size-4 rounded" /> JobPilot · MIT License
        </p>
        <p className="footer-credit">
          Built by{' '}
          <a href="https://github.com/Mo7j" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold hover:text-ink">
            <GitHubIcon size={12} /> Mohammed Hijazi
          </a>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <img src={claudeLogo} alt="" className="size-3.5" /> powered by Claude
          </span>
        </p>
      </div>
    </footer>
  );
}
