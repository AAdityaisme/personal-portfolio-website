import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MOTION } from '../../lib/motion/constants';

type Props = {
  /** Real asset progress 0–100. */
  progress: number;
  name: string;
  /** Fired when the dissolve begins — homepage should start overlapping. */
  onReveal: () => void;
  /** Fired when the loader is fully gone and can unmount. */
  onDone: () => void;
};

/**
 * Stage 1 — centered name, percentage below, 1px ring drawing clockwise
 * from the upper area, then a blur dissolve (no wipe, no slide).
 */
export function Loader({ progress, name, onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const pctEl = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Displayed progress is the slower of real asset progress and a paced
      // ramp, so the ring always draws smoothly over ~1s like the recording.
      const pace = { value: 0 };
      const shown = { value: 0 };
      let finished = false;

      gsap.to(pace, { value: 100, duration: 1.05, delay: 0.35, ease: 'power2.inOut' });

      const finish = () => {
        finished = true;
        gsap.ticker.remove(tick);
        const tl = gsap.timeline({ onComplete: () => onDoneRef.current() });
        // Hold the closed ring, then dissolve through blur.
        tl.to({}, { duration: 0.14 });
        tl.to(ring.current, { opacity: 0.08, duration: 0.22, ease: MOTION.easeSoft });
        tl.to(
          '.akxLoaderCenter',
          {
            opacity: 0,
            filter: 'blur(8px)',
            scale: 0.98,
            duration: 0.38,
            ease: 'power3.in',
            onStart: () => onRevealRef.current(),
          },
          '<'
        );
        tl.to(root.current, { opacity: 0, duration: 0.34, ease: MOTION.easeSoft }, '-=0.1');
      };

      const tick = (_time: number, deltaTime: number) => {
        const target = Math.min(pace.value, Math.max(progressRef.current, pace.value * 0.55));
        shown.value += (target - shown.value) * Math.min(1, (deltaTime / 1000) * 9);
        if (target >= 99.9 && shown.value > 99.2) shown.value = 100;
        const v = Math.round(shown.value);
        if (pctEl.current) pctEl.current.textContent = `${v}%`;
        if (ring.current) ring.current.style.strokeDashoffset = String(1 - shown.value / 100);
        if (shown.value >= 100 && !finished) finish();
      };
      gsap.ticker.add(tick);

      return () => gsap.ticker.remove(tick);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="akxLoader" ref={root} aria-live="polite">
      <div className="akxLoaderCenter">
        <svg className="akxLoaderRing" viewBox="0 0 200 200" aria-hidden="true">
          <circle
            ref={ring}
            cx="100"
            cy="100"
            r="72"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </svg>
        <p className="akxLoaderName">{name}</p>
        <p className="akxLoaderPct" ref={pctEl}>
          0%
        </p>
      </div>
      <span className="akxLoaderMarker" aria-hidden="true" />
    </div>
  );
}
