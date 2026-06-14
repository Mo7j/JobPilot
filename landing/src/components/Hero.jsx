import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  Lock,
  Plus,
  RefreshCw,
  Share,
  Sidebar,
} from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import { GITHUB_URL, DEMO_URL, DEMO_EMBED_URL } from '../content';
import shotOverview from '../assets/shots/overview-light.png';
import shotBoard from '../assets/shots/applications-board.png';
import shotApprovals from '../assets/shots/approvals.png';
import shotAgents from '../assets/shots/agents.png';
import shotTrends from '../assets/shots/insights-trends.png';
import shotDark from '../assets/shots/overview-dark.png';
import shotMobile from '../assets/shots/mobile-overview.png';
import claudeLogo from '../assets/claude-logo.png';

const HERO_SHOTS = [
  { label: 'Overview', img: shotOverview },
  { label: 'Pipeline', img: shotBoard },
  { label: 'Approvals', img: shotApprovals },
  { label: 'Agents', img: shotAgents },
  { label: 'Insights', img: shotTrends },
  { label: 'Dark mode', img: shotDark },
];

const PHONE_SHOTS = [
  { label: 'Mobile overview', img: shotMobile },
  { label: 'Pipeline', img: shotBoard },
  { label: 'Approvals', img: shotApprovals },
  { label: 'Agents', img: shotAgents },
  { label: 'Insights', img: shotTrends },
  { label: 'Dark mode', img: shotDark },
];

const shotTransition = { duration: 0.85, ease: [0.22, 0.61, 0.36, 1] };

const reveal = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.21, 0.6, 0.35, 1],
    },
  },
};

function getDemoFrameSrc(path, surface) {
  const base = DEMO_EMBED_URL.endsWith('/') ? DEMO_EMBED_URL : `${DEMO_EMBED_URL}/`;
  const url = new URL(path, base);
  url.searchParams.set('embedded', 'landing');
  url.searchParams.set('surface', surface);
  return url.toString();
}

function GooeyWord({ words, morphTime = 1.05, cooldownTime = 0.35, disabled = false }) {
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const filterId = `gooey-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (disabled) return undefined;
    if (!words.length || !text1Ref.current || !text2Ref.current) return undefined;

    let frameId;
    let wordIndex = words.length - 1;
    let previousTime = Date.now();
    let morph = 0;
    let cooldown = cooldownTime;

    text1Ref.current.textContent = words[wordIndex % words.length];
    text2Ref.current.textContent = words[(wordIndex + 1) % words.length];

    const setMorph = (fraction) => {
      if (!text1Ref.current || !text2Ref.current) return;

      const nextFraction = Math.max(fraction, 0.01);
      text2Ref.current.style.filter = `blur(${Math.min(8 / nextFraction - 8, 36)}px)`;
      text2Ref.current.style.opacity = `${Math.pow(nextFraction, 0.4) * 100}%`;

      const currentFraction = Math.max(1 - fraction, 0.01);
      text1Ref.current.style.filter = `blur(${Math.min(8 / currentFraction - 8, 36)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(currentFraction, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      if (!text1Ref.current || !text2Ref.current) return;

      text2Ref.current.style.filter = '';
      text2Ref.current.style.opacity = '100%';
      text1Ref.current.style.filter = '';
      text1Ref.current.style.opacity = '0%';
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const newTime = Date.now();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime - previousTime) / 1000;
      previousTime = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          wordIndex = (wordIndex + 1) % words.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = words[wordIndex % words.length];
            text2Ref.current.textContent = words[(wordIndex + 1) % words.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, [words, morphTime, cooldownTime, disabled]);

  if (disabled) {
    return <span className="text-accent">{words[0]}</span>;
  }

  return (
    <span className="gooey-word text-accent" aria-label={words[0]}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <span aria-hidden="true" className="gooey-word-layer" style={{ filter: `url(#${filterId})` }}>
        <span ref={text1Ref} className="gooey-word-text" />
        <span ref={text2Ref} className="gooey-word-text" />
      </span>
      <span className="invisible" aria-hidden="true">
        guesswork
      </span>
    </span>
  );
}

function PhoneStatusBar() {
  return (
    <div className="phone-status-bar" aria-hidden="true">
      <span className="phone-status-time">9:41</span>
      <span className="phone-status-icons">
        <svg className="phone-cellular" viewBox="0 0 22 14" aria-hidden="true">
          <rect x="1" y="8.5" width="3.2" height="4.5" rx="1.35" fill="currentColor" opacity="0.62" />
          <rect x="6.2" y="6.2" width="3.2" height="6.8" rx="1.35" fill="currentColor" opacity="0.78" />
          <rect x="11.4" y="3.6" width="3.2" height="9.4" rx="1.35" fill="currentColor" opacity="0.9" />
          <rect x="16.6" y="1" width="3.2" height="12" rx="1.35" fill="currentColor" />
        </svg>
        <svg className="phone-wifi" viewBox="0 0 18 14" aria-hidden="true">
          <path d="M2.2 5.3C6 2.1 12 2.1 15.8 5.3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M5.3 8.1c2.2-1.8 5.2-1.8 7.4 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8 10.8c.6-.45 1.4-.45 2 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <svg className="phone-battery" viewBox="0 0 28 14" aria-hidden="true">
          <rect x="1.3" y="2.2" width="22" height="9.6" rx="2.7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.2" y="3.65" width="13.2" height="6.7" rx="1.55" fill="currentColor" />
          <path d="M25 5.05v3.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
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

export default function Hero() {
  const frameRef = useRef(null);
  const [activeShot, setActiveShot] = useState(0);
  const isMobileLanding = useMobileLanding();
  const shouldReduceMotion = useReducedMotion();
  const shouldSimplifyMotion = shouldReduceMotion || isMobileLanding;
  const hasInteractiveDemo = Boolean(DEMO_EMBED_URL);
  const showInteractivePhone = hasInteractiveDemo && !isMobileLanding;
  const desktopDemoSrc = useMemo(() => (hasInteractiveDemo ? getDemoFrameSrc('/', 'desktop') : ''), [hasInteractiveDemo]);
  const mobileDemoSrc = useMemo(() => (hasInteractiveDemo ? getDemoFrameSrc('/', 'mobile') : ''), [hasInteractiveDemo]);
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  });
  const frameY = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [80, 0, -18, -56]);
  const frameScale = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [0.9, 1, 1, 0.97]);
  const frameRotateX = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [12, 0, -1, -3]);
  const frameRotateY = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [-8, -3, 2, 5]);
  const frameRotateZ = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [-2.5, 0, 0.5, 1.5]);
  const frameOpacity = useTransform(scrollYProgress, [0, 0.12, 0.9, 1], [0.2, 1, 1, 0.7]);
  const phoneX = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [10, 0, -6, -10]);
  const phoneY = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [8, 0, -6, -10]);
  const phoneScale = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [0.94, 1.02, 1.02, 1]);
  const phoneRotateY = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [18, -6, -10, -16]);
  const phoneRotateZ = useTransform(scrollYProgress, [0, 0.28, 0.82, 1], [2, -1.5, -2.5, -3]);
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.1, 0.92, 1], [0.25, 1, 1, 0.78]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (hasInteractiveDemo || shouldSimplifyMotion) return;
    const normalized = Math.min(1, Math.max(0, (latest - 0.08) / 0.48));
    const nextShot = Math.round(normalized * (HERO_SHOTS.length - 1));
    setActiveShot((currentShot) => (currentShot === nextShot ? currentShot : nextShot));
  });

  return (
    <section id="top" className="hero-atmosphere relative overflow-clip pb-16 pt-32 sm:pt-36 lg:pb-10 lg:pt-[8.75rem]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <div className="absolute left-[-11rem] top-[-25rem] h-[45rem] w-[24rem] -rotate-45 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_16%,transparent),transparent)] opacity-70" />
        <div className="absolute right-[-8rem] top-20 h-[34rem] w-[18rem] rotate-12 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--amber)_17%,transparent),transparent)] opacity-70" />
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.12,
              },
            },
          }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.h1
            variants={reveal}
            className="hero-headline mx-auto max-w-4xl text-balance font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.85rem]"
          >
            <span className="hero-headline-main">Job hunting, without</span>{' '}
            <span className="hero-headline-rest">
              the <GooeyWord words={['burnout', 'busywork', 'guesswork']} disabled={shouldSimplifyMotion} />
            </span>
          </motion.h1>

          <motion.p variants={reveal} className="hero-copy mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Seven Claude agents hunt roles, score fit, draft tailored CVs, and fill applications, then{' '}
            <strong className="text-ink">stop and wait for your approval</strong>. Runs on your own Firebase and your own
            Claude. Your data never leaves your project.
          </motion.p>

          <motion.div variants={reveal} className="hero-actions mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <span className="demo-pulse rounded-[1rem] border border-accent/15 bg-accent/10 p-1">
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn-primary">
                Try the live demo <ArrowUpRight size={16} />
              </a>
            </span>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-ghost btn-github hero-github-btn" aria-label="Get it on GitHub">
              <GitHubIcon size={20} /> <span className="github-button-label">Get it on GitHub</span>
            </a>
          </motion.div>

          <motion.div variants={reveal} className="hero-trust-strip" aria-label="Product trust signals">
            <span>
              <Code size={16} strokeWidth={2.2} />
              100% Open Source
            </span>
            <span>
              <img src={claudeLogo} alt="" className="size-4 shrink-0" />
              Powered by Claude
            </span>
            <span>
              <Lock size={15} strokeWidth={2.2} />
              Your Data, Your Control
            </span>
          </motion.div>
        </motion.div>

        <div
          ref={frameRef}
          className={`demo-stage relative mx-auto mt-12 max-w-6xl sm:mt-16 lg:mt-20 ${hasInteractiveDemo ? '' : 'md:h-[240vh]'}`}
        >
          <div
            className={`relative z-0 mx-auto max-w-6xl px-0 [perspective:1600px] sm:px-4 md:block ${
              hasInteractiveDemo ? '' : 'md:sticky md:top-28 lg:top-32'
            }`}
          >
            <motion.div
              initial={shouldSimplifyMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)' }}
              animate={shouldSimplifyMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.65, ease: [0.21, 0.6, 0.35, 1] }}
              style={{
                y: frameY,
                scale: frameScale,
                rotateX: frameRotateX,
                rotateY: frameRotateY,
                rotateZ: frameRotateZ,
                opacity: frameOpacity,
                transformPerspective: 1600,
              }}
              className="laptop-device relative hidden shrink-0 will-change-transform md:mx-auto md:block md:w-[88%] lg:w-[86%] xl:w-[84%]"
            >
              <div className="laptop-lid">
                <span aria-hidden className="laptop-camera" />
                <div className="browser-frame relative rounded-[0.95rem]">
                  <div className="browser-chrome rounded-t-[0.85rem]">
                    <div className="browser-window-controls">
                      <span className="dot bg-[#ff5f57]" />
                      <span className="dot bg-[#febc2e]" />
                      <span className="dot bg-[#28c840]" />
                    </div>
                    <div className="browser-nav-controls" aria-hidden>
                      <span className="browser-icon-button">
                        <Sidebar size={12} strokeWidth={2.2} />
                      </span>
                      <span className="browser-icon-button is-muted">
                        <ChevronLeft size={13} strokeWidth={2.4} />
                      </span>
                      <span className="browser-icon-button is-muted">
                        <ChevronRight size={13} strokeWidth={2.4} />
                      </span>
                    </div>
                    <div className="browser-address" aria-hidden>
                      <span className="browser-site-dot" />
                      <span>your-jobpilot.web.app</span>
                      <RefreshCw size={10} strokeWidth={2.4} />
                    </div>
                    <div className="browser-action-controls" aria-hidden>
                      <span className="browser-icon-button">
                        <Share size={12} strokeWidth={2.2} />
                      </span>
                      <span className="browser-icon-button">
                        <Plus size={13} strokeWidth={2.4} />
                      </span>
                      <span className="browser-icon-button">
                        <Copy size={12} strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>
                  <div className="hero-shot-viewport">
                    {hasInteractiveDemo ? (
                      <iframe
                        src={desktopDemoSrc}
                        title="Interactive JobPilot desktop demo"
                        className="hero-demo-frame"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        {HERO_SHOTS.map((shot, i) => (
                          <motion.img
                            key={shot.label}
                            src={shot.img}
                            alt=""
                            aria-hidden
                            className="hero-shot"
                            initial={false}
                            animate={{
                              opacity: i === activeShot ? 1 : 0,
                              scale: i === activeShot ? 1 : 1.03,
                            }}
                            transition={shotTransition}
                          />
                        ))}
                        <img src={shotOverview} alt="JobPilot dashboard pages preview" className="invisible block w-full" />
                      </>
                    )}
                  </div>
                  <div aria-hidden className="device-glass" />
                </div>
              </div>
              <div aria-hidden className="laptop-hinge" />
            </motion.div>

            <motion.div
              initial={shouldSimplifyMotion ? { opacity: 0 } : { opacity: 0, filter: 'blur(10px)' }}
              animate={shouldSimplifyMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.78, ease: [0.21, 0.6, 0.35, 1] }}
              style={{
                x: isMobileLanding ? 0 : phoneX,
                y: isMobileLanding ? 0 : phoneY,
                scale: isMobileLanding ? 1 : phoneScale,
                rotateY: isMobileLanding ? 0 : phoneRotateY,
                rotateZ: isMobileLanding ? 0 : phoneRotateZ,
                opacity: isMobileLanding ? 1 : phoneOpacity,
                transformPerspective: isMobileLanding ? 0 : 1200,
              }}
              className="phone-frame z-20 mx-auto mt-4 w-52 max-w-[68vw] shrink-0 will-change-transform sm:w-60 md:absolute md:right-[2%] md:top-[7%] md:mx-0 md:mt-0 md:w-[24%] md:min-w-56 md:max-w-72 lg:right-[1%] lg:top-[5%] lg:w-[23%] xl:max-w-80"
            >
              <span aria-hidden className="phone-button phone-button-left" />
              <span aria-hidden className="phone-button phone-button-right" />
              <div className="phone-screen">
                <div className={`phone-shot-viewport ${showInteractivePhone ? 'is-interactive' : ''}`}>
                  {showInteractivePhone ? (
                    <>
                      <PhoneStatusBar />
                      <iframe
                        src={mobileDemoSrc}
                        title="Interactive JobPilot mobile demo"
                        className="phone-demo-frame"
                        scrolling="auto"
                      />
                    </>
                  ) : (
                    <>
                      <PhoneStatusBar />
                      {PHONE_SHOTS.map((shot, i) => (
                        <motion.img
                          key={shot.label}
                          src={shot.img}
                          alt=""
                          aria-hidden
                          className="phone-shot"
                          initial={false}
                          animate={{
                            opacity: i === activeShot ? 1 : 0,
                            scale: i === activeShot ? 1 : 1.03,
                          }}
                          transition={shotTransition}
                        />
                      ))}
                      <img src={shotMobile} alt="JobPilot mobile dashboard preview" className="invisible block w-full" />
                    </>
                  )}
                </div>
                <div aria-hidden className="phone-glass" />
                <div aria-hidden className="phone-island" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
