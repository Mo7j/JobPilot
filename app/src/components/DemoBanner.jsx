import { Sparkles, ArrowUpRight } from 'lucide-react';
import { repoUrl } from '../config';

export default function DemoBanner() {
  return (
    <div className="flex items-center gap-2 bg-accent text-white text-xs font-semibold px-4 py-2">
      <Sparkles size={14} className="shrink-0" />
      <span className="flex-1">
        Demo mode, you're exploring sample data. Nothing is saved.
      </span>
      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 transition-colors"
      >
        Get your own <ArrowUpRight size={12} />
      </a>
    </div>
  );
}
