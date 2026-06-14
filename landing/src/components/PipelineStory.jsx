import Reveal from './Reveal';

const BEATS = [
  { time: '09:14', agent: 'Job Search', text: 'Found "Frontend Developer, Northwind Labs" on LinkedIn, posted 2 hours ago.' },
  { time: '10:02', agent: 'Job Analysis', text: 'Scored it 86/100, stack matches, junior-friendly, solid company. Queued for approval.' },
  { time: '12:30', agent: 'You', text: 'One tap on your phone: Approved.', you: true },
  { time: '13:05', agent: 'CV Creation', text: 'Asked two honest questions about your projects, then drafted a one-page CV tailored to their design-system focus.' },
  { time: '15:48', agent: 'You', text: 'CV looks great. Approved.', you: true },
  { time: '16:20', agent: 'Application Writer', text: 'Filled the whole form, uploaded the CV, wrote the cover letter, screenshot attached, stopped before Submit.' },
  { time: '18:11', agent: 'You', text: 'Reviewed the screenshot. Approved.', you: true },
  { time: '18:14', agent: 'Application Writer', text: 'Submitted. Interview notes drafted. Connection Builder reached out to the team.' },
];

export default function PipelineStory() {
  return (
    <section className="relative border-b border-line bg-card py-20 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:-translate-y-full before:bg-gradient-to-b before:from-transparent before:to-card">
      <div className="mx-auto max-w-6xl px-5">
      <Reveal className="text-center">
        <span className="section-kicker">A day in the pipeline</span>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          From posting to submitted, with three taps from you.
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 max-w-2xl">
        <ol className="relative flex flex-col gap-6 border-l-2 border-line pl-8">
          {BEATS.map((beat, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <li className="relative">
                <span
                  className={`absolute -left-[41px] top-0.5 flex size-5 items-center justify-center rounded-full border-2 ${
                    beat.you ? 'border-amber bg-amber-soft' : 'border-accent bg-accent-soft'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${beat.you ? 'bg-amber' : 'bg-accent'}`} />
                </span>
                <p className="text-xs font-bold uppercase tracking-wide text-faint">
                  {beat.time} · <span className={beat.you ? 'text-amber-ink' : 'text-accent-ink'}>{beat.agent}</span>
                </p>
                <p className={`mt-1 text-sm leading-relaxed ${beat.you ? 'font-bold' : 'text-muted'}`}>
                  {beat.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={0.3}>
          <p className="mt-8 rounded-2xl bg-accent-soft px-5 py-4 text-center text-sm font-semibold text-accent-ink">
            Total time you spent: about four minutes. (Fictional example, your mileage will be better.)
          </p>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
