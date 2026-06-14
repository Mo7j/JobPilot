import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import { SETUP_STEPS, SETUP_URL } from '../content';

export default function SetupPreview() {
  return (
    <section
      id="setup"
      className="relative bg-card py-20 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:translate-y-full after:bg-gradient-to-b after:from-card after:to-transparent"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <span className="section-kicker">Setup</span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            One evening. Six steps. Then it just runs.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            The guide spells out every click, and each step ends with a "you know it worked
            when..." checkpoint. The setup agent does the personal part for you.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SETUP_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={(i % 3) * 0.1}>
              <div className="card h-full p-6">
                <span className="font-display text-3xl font-bold text-accent/25">
                  {String(step.n).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center" delay={0.2}>
          <a href={SETUP_URL} target="_blank" rel="noreferrer" className="btn-primary">
            Read the full setup guide <ArrowUpRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
