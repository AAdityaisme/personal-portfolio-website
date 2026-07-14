import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';

type Props = {
  children: ReactNode;
  enabled?: boolean;
};

/** Lenis smooth scroll — same feel as polished portfolio sites. */
export function SmoothScroll({ children, enabled = true }: Props) {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.85,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    document.documentElement.classList.add('lenis');

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, [enabled]);

  return <>{children}</>;
}
