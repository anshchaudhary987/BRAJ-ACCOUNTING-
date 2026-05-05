'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

const CountUp = memo(({ target, suffix = '', prefix = '', duration = 2000, decimals = 0, className = '' }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    let raf: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        raf = requestAnimationFrame(update);
      }
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target, duration, suffix, prefix, decimals]);

  return <span ref={ref} className={className}>{display}</span>;
});

CountUp.displayName = 'CountUp';
export default CountUp;
