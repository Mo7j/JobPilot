import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Reveal from './Reveal';
import { AGENTS } from '../content';
import faceSetupAgent from '../assets/agents/setup-agent.png';

const AUTO_ADVANCE_MS = 2000;
const MANUAL_PAUSE_MS = 6500;

function calculateGap(width) {
  const minWidth = 320;
  const maxWidth = 680;
  const minGap = 42;
  const maxGap = 92;

  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return maxGap;

  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

function useMobileLanding() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default function AgentCrew() {
  const shouldReduceMotion = useReducedMotion();
  const isMobileLanding = useMobileLanding();
  const shouldSimplifyMotion = shouldReduceMotion || isMobileLanding;
  const imageContainerRef = useRef(null);
  const lastManualInteractionRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(520);
  const [isUserControlling, setIsUserControlling] = useState(false);

  const crew = useMemo(
    () => [
      ...AGENTS,
      {
        slug: 'setup',
        name: 'Setup Agent',
        cadence: 'Runs once',
        face: faceSetupAgent,
        blurb:
          'Interviews you about your background and market, then generates your profile, screening answers, market playbook, and a CV design unique to you.',
        gated: false,
        setup: true,
      },
    ],
    []
  );

  const activeAgent = crew[activeIndex];

  useEffect(() => {
    const updateWidth = () => {
      if (imageContainerRef.current) {
        setContainerWidth(imageContainerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const advanceNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % crew.length);
  }, [crew.length]);

  const markManualInteraction = useCallback(() => {
    lastManualInteractionRef.current = Date.now();
  }, []);

  const handleControlEnd = useCallback(() => {
    markManualInteraction();
    setIsUserControlling(false);
  }, [markManualInteraction]);

  const handleNext = useCallback(() => {
    markManualInteraction();
    setActiveIndex((index) => (index + 1) % crew.length);
  }, [crew.length, markManualInteraction]);

  const handlePrev = useCallback(() => {
    markManualInteraction();
    setActiveIndex((index) => (index - 1 + crew.length) % crew.length);
  }, [crew.length, markManualInteraction]);

  const handleSelect = useCallback(
    (index) => {
      markManualInteraction();
      setActiveIndex(index);
    },
    [markManualInteraction]
  );

  useEffect(() => {
    if (shouldSimplifyMotion) return undefined;

    const interval = window.setInterval(() => {
      if (isUserControlling) return;
      if (Date.now() - lastManualInteractionRef.current < MANUAL_PAUSE_MS) return;
      advanceNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(interval);
  }, [advanceNext, isUserControlling, shouldSimplifyMotion]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  function getImageStyle(index) {
    if (shouldSimplifyMotion) {
      return {
        zIndex: index === activeIndex ? 3 : 1,
        opacity: index === activeIndex ? 1 : 0,
        pointerEvents: index === activeIndex ? 'auto' : 'none',
      };
    }

    const gap = calculateGap(containerWidth);
    const lift = Math.min(64, gap * 0.72);
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + crew.length) % crew.length === index;
    const isRight = (activeIndex + 1) % crew.length === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        filter: 'saturate(1) brightness(1) blur(0px)',
        pointerEvents: 'auto',
        transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)',
      };
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.88,
        filter: 'saturate(0.92) brightness(1) blur(1.8px)',
        pointerEvents: 'auto',
        transform: `translateX(-${gap}px) translateY(-${lift}px) scale(0.86) rotateY(16deg)`,
      };
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.88,
        filter: 'saturate(0.92) brightness(1) blur(1.8px)',
        pointerEvents: 'auto',
        transform: `translateX(${gap}px) translateY(-${lift}px) scale(0.86) rotateY(-16deg)`,
      };
    }

    return {
      zIndex: 1,
      opacity: 0,
      filter: 'saturate(0.82) brightness(0.98) blur(4px)',
      pointerEvents: 'none',
      transform: 'translateX(0px) translateY(18px) scale(0.78) rotateY(0deg)',
    };
  }

  return (
    <section id="crew" className="mx-auto max-w-6xl px-5 py-20">
      <Reveal className="text-center">
        <span className="section-kicker">The crew</span>
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Seven specialists. One manager. You're the captain.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Each agent has one job, its own knowledge files, and a memory that learns your
          taste from every approve and reject.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-14"
          onPointerEnter={() => setIsUserControlling(true)}
          onPointerLeave={handleControlEnd}
          onFocusCapture={() => setIsUserControlling(true)}
          onBlurCapture={handleControlEnd}
        >
          <div
            ref={imageContainerRef}
            className="relative mx-auto h-[22rem] w-full max-w-lg overflow-visible sm:h-[28rem]"
            style={{ perspective: '1100px' }}
          >
            {crew.map((agent, index) => (
              <button
                key={agent.slug}
                type="button"
                aria-label={`Show ${agent.name}`}
                aria-current={index === activeIndex}
                onClick={() => handleSelect(index)}
                className={`agent-face-card group absolute inset-x-5 top-0 mx-auto h-[21.5rem] max-w-sm rounded-[2rem] bg-card p-3 text-left shadow-card focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface sm:inset-x-10 sm:h-[27rem] sm:p-4 ${
                  shouldSimplifyMotion
                    ? 'transition-opacity duration-300 ease-out'
                    : 'transition-all duration-700 ease-[cubic-bezier(.4,2,.3,1)]'
                }`}
                style={getImageStyle(index)}
              >
                <span className="relative flex h-full flex-col overflow-hidden rounded-[1.55rem] bg-agent-portrait p-4 sm:p-5">
                  <span className="pointer-events-none absolute inset-x-5 top-5 z-30 flex items-center justify-between gap-3">
                    <span className="chip agent-badge max-w-[11rem]">
                      {agent.cadence}
                    </span>
                    {agent.gated && (
                      <span className="agent-icon-badge agent-icon-badge-gated grid size-8 shrink-0 place-items-center rounded-full">
                        <ShieldCheck size={14} />
                      </span>
                    )}
                    {agent.setup && (
                      <span className="agent-icon-badge agent-icon-badge-setup grid size-8 shrink-0 place-items-center rounded-full">
                        <Sparkles size={14} />
                      </span>
                    )}
                  </span>

                  <span className="relative mt-9 flex min-h-0 flex-1 items-end justify-center sm:mt-11">
                    <span className="agent-face-halo" aria-hidden="true" />
                    <img
                      src={agent.face}
                      alt=""
                      loading={isMobileLanding ? (index === activeIndex ? 'eager' : 'lazy') : undefined}
                      decoding={isMobileLanding ? 'async' : undefined}
                      fetchPriority={isMobileLanding ? (index === activeIndex ? 'high' : 'low') : undefined}
                      className="agent-face-img relative z-10 max-h-[17rem] max-w-[17rem] object-contain object-bottom drop-shadow-[0_18px_22px_rgb(29_26_54_/_0.18)] group-hover:scale-[1.035] sm:max-h-[21.5rem] sm:max-w-[21.5rem]"
                    />
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="crew-detail-card min-h-80 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent.slug}
                initial={shouldSimplifyMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldSimplifyMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: shouldSimplifyMotion ? 0.18 : 0.28, ease: 'easeInOut' }}
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="chip bg-card-2 text-muted">{activeAgent.cadence}</span>
                    <h3 className="mt-4 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                      {activeAgent.setup && <Sparkles size={19} className="text-amber" />}
                      {activeAgent.name}
                    </h3>
                  </div>

                  {activeAgent.gated && (
                    <span className="chip shrink-0 bg-amber-soft text-amber-ink">
                      <ShieldCheck size={12} /> approval-gated
                    </span>
                  )}
                </div>

                <p className="mt-6 min-h-28 text-base leading-8 text-muted">
                  {shouldSimplifyMotion
                    ? activeAgent.blurb
                    : activeAgent.blurb.split(' ').map((word, index) => (
                        <motion.span
                          key={`${activeAgent.slug}-${word}-${index}`}
                          initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: 'easeInOut',
                            delay: 0.024 * index,
                          }}
                          className="inline-block"
                        >
                          {word}&nbsp;
                        </motion.span>
                      ))}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                  <div className="flex gap-2">
                    {crew.map((agent, index) => (
                      <button
                        key={agent.slug}
                        type="button"
                        onClick={() => handleSelect(index)}
                        aria-label={`Show ${agent.name}`}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeIndex ? 'w-8 bg-accent' : 'w-2.5 bg-line hover:bg-faint'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous agent"
                      className="grid size-11 place-items-center rounded-full bg-night text-white transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next agent"
                      className="grid size-11 place-items-center rounded-full bg-night text-white transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
