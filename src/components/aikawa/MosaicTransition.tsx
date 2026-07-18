import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { MOTION } from '../../lib/motion/constants';
import { disperseFor, makePieces, seededRandom } from '../../lib/aikawa/fragments';

type Props = {
  imageSrc: string;
  imageFit: 'cover' | 'contain';
  imageBg?: string;
  /** Screen rect the selected tile occupies (px). */
  rect: { left: number; top: number; width: number; height: number };
  /** Work-palette tint the pieces recolor toward. */
  tint: string;
  /** Fired when fragments are at peak separation — Work title may reveal. */
  onTitleReveal: () => void;
  /** Fired when the transition has fully settled. */
  onDone: () => void;
};

/**
 * Stage 7 — mosaic fragmentation: the selected image segments in place,
 * pieces drift outward (no violent shatter), recolor to Work tones and
 * remain scattered as the decorative border of the new section.
 */
export function MosaicTransition({
  imageSrc,
  imageFit,
  imageBg,
  rect,
  tint,
  onTitleReveal,
  onDone,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const onTitleRevealRef = useRef(onTitleReveal);
  onTitleRevealRef.current = onTitleReveal;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const pieces = useMemo(() => makePieces(8, 6, 17), []);
  const targets = useMemo(() => {
    const rand = seededRandom(41);
    return pieces.map((p) => disperseFor(p, rand));
  }, [pieces]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>('.akxMosaicPiece');
      const tl = gsap.timeline({ onComplete: () => onDoneRef.current() });

      // Phase 1 — segmentation: tiny gaps + micro rotation, same rectangle.
      els.forEach((el, i) => {
        const p = pieces[i];
        const rand = seededRandom(100 + i);
        const gap = 2 + rand() * 3;
        tl.to(
          el,
          {
            x: (p.cx - 0.5) * gap * 2.4,
            y: (p.cy - 0.5) * gap * 2.4,
            rotation: (rand() - 0.5) * 6,
            duration: 0.25,
            ease: MOTION.easeSoft,
          },
          0
        );
      });

      // Phase 2 — dispersal outward, calm not explosive.
      els.forEach((el, i) => {
        const t = targets[i];
        const p = pieces[i];
        tl.to(
          el,
          {
            x: t.x,
            y: t.y,
            rotation: `+=${t.rotation}`,
            scale: t.scale,
            opacity: t.opacity,
            duration: 0.65,
            ease: MOTION.easeInOut,
          },
          0.25 + p.fromCenter * 0.08
        );
        // Phase 3 — recolor toward Work tones while separated, and pick up a
        // glassy specular so the pieces read as prism shards.
        const tintEl = el.firstElementChild;
        if (tintEl) {
          tl.to(tintEl, { opacity: 0.62, duration: 0.55, ease: MOTION.easeSoft }, 0.32);
        }
        const glossEl = el.children[1];
        if (glossEl) {
          tl.to(glossEl, { opacity: 0.5, duration: 0.55, ease: MOTION.easeSoft }, 0.36);
        }
      });

      // Phase 4 — title reveal near peak separation.
      tl.call(() => onTitleRevealRef.current(), undefined, 0.72);
      tl.to({}, { duration: 0.35 }); // settle
    }, root);
    return () => ctx.revert();
  }, [pieces, targets]);

  return (
    <div
      className="akxMosaic"
      ref={root}
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      aria-hidden="true"
    >
      {pieces.map((p, i) => (
        <div
          key={i}
          className="akxMosaicPiece"
          style={{
            clipPath: p.clipPath,
            transformOrigin: `${p.cx * 100}% ${p.cy * 100}%`,
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: imageFit === 'contain' ? 'contain' : 'cover',
            backgroundColor: imageBg ?? 'transparent',
          }}
        >
          <div
            className="akxMosaicTint"
            style={{ clipPath: p.clipPath, background: tint }}
          />
          <div className="akxMosaicGloss" style={{ clipPath: p.clipPath }} />
        </div>
      ))}
    </div>
  );
}
