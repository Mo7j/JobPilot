import Reveal from './Reveal';
import mascotSearch from '../assets/mascot-search.png';
import mascotProgress from '../assets/mascot-progress.png';
import mascotSubmitted from '../assets/mascot-submitted.png';
import mascotOffer from '../assets/mascot-offer.png';

const STEPS = [
  {
    n: '01',
    title: 'The crew hunts around the clock',
    body: 'Through the day, agents sweep your platforms for fresh roles, filter them against your real profile, score the fit 0–100, and research each company, so you only ever see vetted matches.',
    img: mascotSearch,
  },
  {
    n: '02',
    title: 'Everything stops at your approval',
    body: 'Analysis done? It queues for you. CV drafted? Queues for you. Application filled? The agent screenshots the form and stops dead before Submit. Nothing irreversible happens without your tap.',
    img: mascotProgress,
  },
  {
    n: '03',
    title: 'Tailored, honest documents',
    body: 'A one-page CV rebuilt per role from your confirmed experience, never invented, plus a specific cover letter and prepared screening answers. The agents ask you questions instead of guessing.',
    img: mascotSubmitted,
  },
  {
    n: '04',
    title: 'Nothing gets lost after Apply',
    body: 'Every role keeps moving across the board with its notes, timeline, follow-up dates, and next step. JobPilot tracks sent applications and stuck jobs too, so your search never disappears into tabs and spreadsheets.',
    img: mascotOffer,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative bg-card py-20 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:-translate-y-full before:bg-gradient-to-b before:from-transparent before:to-card after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:translate-y-full after:bg-gradient-to-b after:from-card after:to-transparent"
    >
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center">
          <span className="section-kicker">How it works</span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Autopilot, with you in the cockpit.
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-16">
          {STEPS.map((step, i) => (
            <Reveal key={step.n}>
              <div
                className={`grid items-center gap-8 lg:grid-cols-2 ${
                  i % 2 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div>
                  <span className="font-display text-5xl font-bold text-accent/20">{step.n}</span>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{step.body}</p>
                </div>
                <div className="flex justify-center">
                  <img src={step.img} alt="" loading="lazy" className="w-72 max-w-full drop-shadow-lg sm:w-80" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
