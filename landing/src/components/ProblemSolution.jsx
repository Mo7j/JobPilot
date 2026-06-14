import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SearchX, FileX2, CalendarX2, ArrowDown } from 'lucide-react';
import Reveal from './Reveal';

const PROBLEM_PHRASES = ['a full-time job', 'exhausting', 'never-ending'];

const PAINS = [
  {
    icon: SearchX,
    title: 'Endless scrolling',
    body: 'Hours on job boards every day, re-reading the same irrelevant postings, while the good ones close in 48 hours.',
  },
  {
    icon: FileX2,
    title: 'One CV for everything',
    body: 'Tailoring a resume per role is what works, and what nobody has the energy to do for application #37.',
  },
  {
    icon: CalendarX2,
    title: 'Lost follow-ups',
    body: 'Who did you apply to two weeks ago? Which recruiter said "ping me Friday"? The spreadsheet died in week one.',
  },
];

export default function ProblemSolution() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    const timeoutId = window.setTimeout(() => {
      setPhraseIndex((current) => (current + 1) % PROBLEM_PHRASES.length);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [phraseIndex, shouldReduceMotion]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal className="text-center">
        <span className="section-kicker">The problem</span>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          <span className="block">Job searching is</span>
          <span className="relative mt-1 inline-flex min-w-[11.5ch] justify-center overflow-hidden align-bottom text-accent">
            <AnimatePresence mode="wait">
              <motion.span
                key={PROBLEM_PHRASES[phraseIndex]}
                className="inline-block"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -32 }}
                transition={{ duration: 0.38, ease: [0.21, 0.6, 0.35, 1] }}
              >
                {PROBLEM_PHRASES[phraseIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PAINS.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.12}>
            <div className="card h-full p-7">
              <span className="inline-flex rounded-2xl bg-card-2 p-3 text-muted">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 flex flex-col items-center gap-3 text-center" delay={0.2}>
        <span className="rounded-full bg-accent-soft p-3 text-accent-ink">
          <ArrowDown size={20} />
        </span>
        <p className="font-display text-xl font-bold">
          So give the job to a crew that never gets tired.
        </p>
      </Reveal>
    </section>
  );
}
