import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Reveal from './Reveal';
import { FAQS } from '../content';

function Item({ faq, open, onToggle }) {
  return (
    <div className="card overflow-hidden !rounded-2xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex-1 font-bold">{faq.q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      className="py-20"
    >
      <div className="mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <span className="section-kicker">FAQ</span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            The questions everyone asks.
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.05}>
              <Item faq={faq} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
