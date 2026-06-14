import { useEffect, useRef } from 'react';
import {
  motion,
  useAnimation,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';

function useMobileLanding() {
  const isMobile = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => {
      isMobile.current = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default function Reveal({ children, delay = 0, y = 24, className }) {
  const ref = useRef(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollDirection = useRef('down');
  const isMobileLanding = useMobileLanding();
  const isInView = useInView(ref, {
    margin: '-80px 0px -80px 0px',
    amount: 0.15,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? latest;
    scrollDirection.current = latest >= previous ? 'down' : 'up';
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      controls.set({ opacity: 1, y: 0 });
      return;
    }

    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition:
          scrollDirection.current === 'down' || isMobileLanding.current
            ? { duration: 0.6, delay, ease: [0.21, 0.6, 0.35, 1] }
            : { duration: 0 },
      });
      return;
    }

    if (!isMobileLanding.current) {
      controls.set({ opacity: 0, y });
    }
  }, [controls, delay, isInView, shouldReduceMotion, y]);

  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y }} animate={controls}>
      {children}
    </motion.div>
  );
}
