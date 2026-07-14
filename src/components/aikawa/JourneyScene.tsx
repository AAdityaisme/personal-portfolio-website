import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { MOTION, STRIP } from '../../lib/motion/constants';
import {
  makeDecorFragments,
  makePieces,
  scatterFor,
  seededRandom,
} from '../../lib/aikawa/fragments';

const CYAN_PALETTE = [
  'rgba(96, 165, 250, 0.55)',
  'rgba(103, 232, 249, 0.5)',
  'rgba(147, 197, 253, 0.45)',
  'rgba(224, 242, 254, 0.75)',
  'rgba(56, 130, 246, 0.35)',
  'rgba(255, 255, 255, 0.85)',
];

type Props = {
  heroSrc: string;
  title: string;
  fragmentCount: number;
  /** True once the orchestrator starts the journey→portfolio timeline. */
  leaving: boolean;
  onAssembled: () => void;
  onHeroClick: () => void;
  /** Called when the hero has finished flying into the strip rect. */
  onLeaveDone: () => void;
};

/** Hero rect at rest, viewport fractions. */
const HERO = { cx: 0.5, cy: 0.54, w: 0.34, aspect: 3 / 4.4 };

export function JourneyScene({
  heroSrc,
  title,
  fragmentCount,
  leaving,
  onAssembled,
  onHeroClick,
  onLeaveDone,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInner = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [assembled, setAssembled] = useState(false);
  const onAssembledRef = useRef(onAssembled);
  onAssembledRef.current = onAssembled;
  const onLeaveDoneRef = useRef(onLeaveDone);
  onLeaveDoneRef.current = onLeaveDone;

  const cols = Math.max(6, Math.round(Math.sqrt(fragmentCount * 1.5)));
  const rows = Math.max(4, Math.round(fragmentCount / cols));
  const pieces = useMemo(() => makePieces(cols, rows, 7), [cols, rows]);
  const scatters = useMemo(() => {
    const rand = seededRandom(23);
    const spread = Math.min(window.innerWidth, 900) * 0.5;
    return pieces.map((p) => scatterFor(p, rand, spread));
  }, [pieces]);
  const decor = useMemo(() => makeDecorFragments(22, CYAN_PALETTE, 31), []);

  // --- Entrance: title sharpen + fragment assembly -------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0.25, filter: 'blur(5px)', y: 16 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.7, delay: 0.5, ease: MOTION.easeOut }
      );

      gsap.fromTo(
        '.akxDecorFrag',
        { opacity: 0, scale: 0.7 },
        {
          opacity: (i: number) => decor[i]?.opacity ?? 0.4,
          scale: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: MOTION.easeOut,
        }
      );

      const pieceEls = gsap.utils.toArray<HTMLElement>('.akxPiece');
      pieceEls.forEach((el, i) => {
        const s = scatters[i];
        const p = pieces[i];
        if (!s || !p) return;
        gsap.fromTo(
          el,
          { x: s.x, y: s.y, rotation: s.rotation, scale: s.scale, opacity: s.opacity },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.75 + p.fromCenter * 0.42,
            delay: 0.12 + p.fromCenter * 0.6,
            ease: MOTION.easeInOut,
          }
        );
        const tint = el.firstElementChild;
        if (tint) {
          gsap.fromTo(
            tint,
            { opacity: 0.55 },
            { opacity: 0, duration: 0.7, delay: 0.3 + p.fromCenter * 0.6, ease: MOTION.easeOut }
          );
        }
      });

      // Composition "starts resolving" → dock may enter.
      gsap.delayedCall(0.9, () => onAssembledRef.current());
      // Fully seamless → swap pieces for one solid image.
      gsap.delayedCall(1.75, () => setAssembled(true));
    }, root);
    return () => ctx.revert();
  }, [pieces, scatters, decor]);

  // --- Pointer: decor lag + hero counter-motion ----------------------------
  useEffect(() => {
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);

    const frags = Array.from(
      root.current?.querySelectorAll<HTMLElement>('.akxDecorFrag') ?? []
    );
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      const t = (performance.now() - start) / 1000;
      frags.forEach((el, i) => {
        const f = decor[i];
        if (!f) return;
        const amp = 2 + f.depth * 6;
        const px = 1 + f.depth * 11;
        const dx = Math.sin(t * f.speed + f.phase) * amp + current.x * px;
        const dy = Math.cos(t * f.speed * 0.8 + f.phase) * amp + current.y * px;
        const rot = f.rotation + Math.sin(t * f.speed * 0.5 + f.phase) * 1.6;
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      });
      if (heroRef.current && heroInner.current) {
        heroRef.current.style.rotate = `${current.x * 0.8}deg`;
        heroInner.current.style.translate = `${current.x * -4}px ${current.y * -4}px`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [decor]);

  // --- Exit: fragments outward, hero flies into the strip rect -------------
  useEffect(() => {
    if (!leaving || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.akxDecorFrag', {
        x: (i: number) => ((decor[i]?.x ?? 0.5) - 0.5) * 260,
        y: (i: number) => ((decor[i]?.y ?? 0.5) - 0.5) * 200,
        opacity: 0,
        duration: 0.3,
        ease: MOTION.easeInOut,
      });
      gsap.to(titleRef.current, {
        opacity: 0,
        filter: 'blur(6px)',
        y: -30,
        duration: 0.45,
        delay: 0.05,
        ease: MOTION.easeInOut,
      });

      const stripW = STRIP.width * window.innerWidth;
      const stripH = stripW * STRIP.aspect;
      gsap.to(heroRef.current, {
        left: '50%',
        top: `${STRIP.centerY * 100}%`,
        width: stripW,
        height: stripH,
        rotate: 0,
        duration: 0.5,
        delay: 0.15,
        ease: MOTION.easeInOut,
        onComplete: () => onLeaveDoneRef.current(),
      });
    }, root);
    return () => ctx.revert();
  }, [leaving, decor]);

  const heroW = HERO.w * 100;

  return (
    <div className="akxJourney" ref={root}>
      <div className="akxDecorLayer" aria-hidden="true">
        {decor.map((f, i) => (
          <span
            key={i}
            className="akxDecorFrag"
            style={{
              left: `${f.x * 100}%`,
              top: `${f.y * 100}%`,
              width: f.size,
              height: f.size * 0.86,
              clipPath: f.clipPath,
              background: f.color,
              opacity: f.opacity,
              zIndex: f.depth > 0.66 ? 3 : f.depth > 0.33 ? 1 : 0,
            }}
          />
        ))}
      </div>

      <h1 className="akxSectionTitle akxJourneyTitle" ref={titleRef}>
        {title}
      </h1>

      <div
        className="akxHero"
        ref={heroRef}
        style={{
          left: `${HERO.cx * 100}%`,
          top: `${HERO.cy * 100}%`,
          width: `${heroW}vw`,
          height: `${heroW / (1 / HERO.aspect)}vw`,
        }}
        onClick={onHeroClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onHeroClick()}
        aria-label="Open portfolio"
      >
        <div className="akxHeroInner" ref={heroInner}>
          {!assembled ? (
            pieces.map((p, i) => (
              <div
                key={i}
                className="akxPiece"
                style={{
                  clipPath: p.clipPath,
                  transformOrigin: `${p.cx * 100}% ${p.cy * 100}%`,
                  backgroundImage: `url(${heroSrc})`,
                }}
              >
                <div className="akxPieceTint" style={{ clipPath: p.clipPath }} />
              </div>
            ))
          ) : (
            <div className="akxHeroSolid" style={{ backgroundImage: `url(${heroSrc})` }} />
          )}
        </div>
      </div>
    </div>
  );
}
