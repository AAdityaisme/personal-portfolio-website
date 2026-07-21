import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import type { OrbitCategory } from '../../data/aikawaData';
import { MOTION, prefersReducedMotion } from '../../lib/motion/constants';
import { makeDecorFragments } from '../../lib/aikawa/fragments';

const WORK_PALETTE = [
  'rgba(233, 213, 255, 0.6)',
  'rgba(244, 194, 224, 0.55)',
  'rgba(216, 180, 254, 0.45)',
  'rgba(251, 207, 232, 0.6)',
  'rgba(255, 241, 250, 0.8)',
];

type CapSpring = {
  arch: number;
  archV: number;
  lean: number;
  leanV: number;
  corner: number;
  cornerV: number;
  hover: boolean;
};

type Props = {
  category: OrbitCategory;
  onEnteredGallery: () => void;
};

/**
 * Stages 8–9 — Work intro (title first, image rising from below, pale→sharp)
 * and stacked cards whose SVG caps deform on hover and with scroll velocity.
 */
export function WorkScene({ category, onEnteredGallery }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const onEnteredRef = useRef(onEnteredGallery);
  onEnteredRef.current = onEnteredGallery;

  const decor = useMemo(() => makeDecorFragments(16, WORK_PALETTE, 53), []);
  const cards = category.cards;
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const chipEl = useRef<HTMLDivElement>(null);
  const chip = useRef({ x: 0, y: 0, tx: 0, ty: 0, on: false });

  // ZOOM cursor chip — follows the pointer with lag over any gallery image
  // (reference detail-view chip), click opens the lightbox.
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;
    const over = (e: PointerEvent) => {
      const media = (e.target as HTMLElement).closest('.akxCardMedia, .akxWorkRise');
      const on = !!media;
      chip.current.tx = e.clientX + 14;
      chip.current.ty = e.clientY + 16;
      if (on !== chip.current.on) {
        chip.current.on = on;
        if (on) {
          chip.current.x = chip.current.tx;
          chip.current.y = chip.current.ty;
        }
        gsap.to(chipEl.current, {
          opacity: on ? 1 : 0,
          scale: on ? 1 : 0.9,
          duration: 0.24,
          ease: 'power2.out',
        });
      }
    };
    rootEl.addEventListener('pointermove', over);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const c = chip.current;
      c.x += (c.tx - c.x) * 0.2;
      c.y += (c.ty - c.y) * 0.2;
      if (chipEl.current) chipEl.current.style.transform = `translate(${c.x}px, ${c.y}px)`;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      rootEl.removeEventListener('pointermove', over);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Escape closes the lightbox first (capture phase, so it wins over the
  // scene-level Escape that would otherwise exit the whole Work section).
  useEffect(() => {
    if (!zoomSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setZoomSrc(null);
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [zoomSrc]);

  // --- Intro ----------------------------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(['.akxWorkTitle', '.akxWorkRise', '.akxWorkRise img', '.akxWorkDecor'], {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'none',
        });
        return;
      }
      gsap.fromTo(
        '.akxWorkTitle',
        { opacity: 0, filter: 'blur(5px)', y: 16 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.65, ease: MOTION.easeOut }
      );
      gsap.fromTo(
        '.akxWorkRise',
        { y: '34vh', scale: 0.96 },
        { y: 0, scale: 1, duration: 0.82, delay: 0.25, ease: 'power4.out' }
      );
      gsap.fromTo(
        '.akxWorkRise img',
        { opacity: 0.2, filter: 'blur(12px) saturate(0.7)', scale: 1.06 },
        {
          opacity: 1,
          filter: 'blur(0px) saturate(1)',
          scale: 1,
          duration: 0.72,
          delay: 0.32,
          ease: MOTION.easeOut,
        }
      );
      gsap.fromTo(
        '.akxWorkDecor',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.7, stagger: 0.03, delay: 0.15, ease: MOTION.easeOut }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  // --- Lenis scroll + cap springs --------------------------------------------
  useEffect(() => {
    if (!scroller.current || !content.current) return;

    const reduced = prefersReducedMotion();
    const lenis = new Lenis({
      wrapper: scroller.current,
      content: content.current,
      duration: 1.05,
      smoothWheel: !reduced,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.0,
    });

    let velocity = 0;
    let entered = false;
    lenis.on('scroll', ({ velocity: v, scroll }: { velocity: number; scroll: number }) => {
      velocity = v;
      if (!entered && scroll > window.innerHeight * 0.4) {
        entered = true;
        onEnteredRef.current();
      }
    });

    const mediaEls = Array.from(root.current?.querySelectorAll<HTMLElement>('.akxCardMedia') ?? []);
    const shadowEls = Array.from(root.current?.querySelectorAll<HTMLElement>('.akxCardCapShadow') ?? []);
    const mediaImgs = Array.from(root.current?.querySelectorAll<HTMLElement>('.akxCardMedia img') ?? []);
    const cardEls = Array.from(root.current?.querySelectorAll<HTMLElement>('.akxCard') ?? []);
    const springs: CapSpring[] = mediaEls.map(() => ({
      arch: 15,
      archV: 0,
      lean: 0,
      leanV: 0,
      corner: 0,
      cornerV: 0,
      hover: false,
    }));

    cardEls.forEach((el, i) => {
      const spring = springs[i];
      el.addEventListener('pointerenter', () => {
        spring.hover = true;
        gsap.to(el, { y: -5, scale: 1.008, duration: 0.42, ease: MOTION.easeOut });
        gsap.to(mediaImgs[i] ?? null, { scale: 1.018, duration: 0.42, ease: MOTION.easeOut });
        gsap.to(shadowEls[i] ?? null, { opacity: 1, duration: 0.42, ease: MOTION.easeOut });
      });
      el.addEventListener('pointerleave', () => {
        spring.hover = false;
        gsap.to(el, { y: 0, scale: 1, duration: 0.65, ease: 'elastic.out(1, 0.7)' });
        gsap.to(mediaImgs[i] ?? null, { scale: 1, duration: 0.65, ease: 'elastic.out(1, 0.7)' });
        gsap.to(shadowEls[i] ?? null, { opacity: 0.72, duration: 0.65, ease: MOTION.easeOut });
      });
    });

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      lenis.raf(now);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (reduced) return;

      const vh = window.innerHeight;
      springs.forEach((s, i) => {
        const archTarget = (s.hover ? 26 : 15) + Math.min(14, Math.abs(velocity) * 0.55);
        const leanTarget = Math.max(-0.16, Math.min(0.16, velocity * 0.01));
        const cornerTarget = s.hover ? 5 : 0;

        const spring = (x: number, v: number, target: number, k = 110, damp = 13) => {
          const nv = (v + (target - x) * k * dt) * Math.max(0, 1 - damp * dt);
          return [x + nv * dt * 8, nv] as const;
        };
        [s.arch, s.archV] = spring(s.arch, s.archV, archTarget);
        [s.lean, s.leanV] = spring(s.lean, s.leanV, leanTarget, 90, 11);
        [s.corner, s.cornerV] = spring(s.corner, s.cornerV, cornerTarget);
        // The photograph's OWN top edge arches (reference uRollTopBend): a wide
        // shallow ellipse whose height breathes, leaning with scroll velocity.
        const media = mediaEls[i];
        if (media) {
          media.style.borderRadius = `50% 50% 0 0 / ${Math.max(2, s.arch).toFixed(1)}px ${Math.max(2, s.arch).toFixed(1)}px 0 0`;
          media.style.transform = `rotate(${(s.lean * 6).toFixed(2)}deg) translateY(${(-s.corner * 0.6).toFixed(1)}px)`;
        }

        // Internal image moves 3–5% slower than the card (soft parallax).
        const card = cardEls[i];
        const img = mediaImgs[i];
        if (card && img) {
          const r = card.getBoundingClientRect();
          const rel = (r.top + r.height / 2 - vh / 2) / vh;
          img.style.translate = `0 ${(rel * 4).toFixed(2)}%`;
        }
      });
      velocity *= 0.9;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [cards]);

  return (
    <div className="akxWork" ref={root}>
      <div className="akxWorkDecorLayer" aria-hidden="true">
        {decor.map((f, i) => (
          <span
            key={i}
            className="akxWorkDecor"
            style={{
              left: `${f.x * 100}%`,
              top: `${f.y * 100}%`,
              width: f.size,
              height: f.size * 0.86,
              clipPath: f.clipPath,
              background: f.color,
              opacity: f.opacity,
              rotate: `${f.rotation}deg`,
            }}
          />
        ))}
      </div>

      <div className="akxWorkScroller" ref={scroller}>
        <div className="akxWorkContent" ref={content}>
          <section className="akxWorkIntro">
            <h2 className="akxSectionTitle akxWorkTitle">{category.label}</h2>
            <p className="akxWorkLead">{category.lead}</p>
            <div className="akxWorkRise" onClick={() => setZoomSrc(category.image)}>
              <img src={category.image} alt="" draggable={false} />
            </div>
            <p className="akxWorkHint" aria-hidden="true">
              Scroll
            </p>
          </section>

          <section className="akxCards">
            {cards.map((card) => (
              <article className="akxCard" key={card.id}>
                <div className="akxCardCapShadow" aria-hidden="true" />
                <div
                  className="akxCardMedia"
                  style={{ background: card.imageBg ?? '#ece9e3' }}
                  onClick={() => card.image && setZoomSrc(card.image)}
                >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt=""
                      draggable={false}
                      className={card.imageFit === 'contain' ? 'isContain' : 'isCover'}
                    />
                  ) : (
                    <span className="akxCardMark" aria-hidden="true">
                      {card.meta ?? card.title}
                    </span>
                  )}
                </div>
                <div className="akxCardFooter">
                  <p className="akxCardMeta">{card.meta ?? category.label}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  {card.href ? (
                    <a
                      className="akxCardLink"
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {card.linkLabel ?? 'View ↗'}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>

      <div className="akxZoomChip" ref={chipEl} aria-hidden="true">
        Zoom
      </div>

      {zoomSrc ? (
        <div
          className="akxLightbox"
          onClick={() => setZoomSrc(null)}
          role="button"
          aria-label="Close zoomed image"
          tabIndex={-1}
        >
          <img src={zoomSrc} alt="" />
        </div>
      ) : null}
    </div>
  );
}
