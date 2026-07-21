import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { orbitCategories, profile } from '../../data/aikawaData';
import {
  GRID_CELLS,
  MOTION,
  STRIP,
  createMotionState,
  prefersReducedMotion,
  selectRect,
  stripWidthFraction,
  wrapOffset,
  type Scene,
} from '../../lib/motion/constants';
import { Loader } from './Loader';
import { PortfolioCanvas, type PanelPointerEvent } from './PortfolioCanvas';
import { MosaicTransition } from './MosaicTransition';
import { WorkScene } from './WorkScene';
import { Dock } from './Dock';
import { DebugPanel, type DebugApi } from './DebugPanel';

const INITIAL_INDEX = 4; // 'life' — photographic hero for the fragment assembly
const WORK_TINT = 'rgba(216, 180, 254, 0.92)';

type Props = { onEnterGalaxy: () => void };

function cellRectPx(cell: { cx: number; cy: number; w: number; h: number }) {
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  return {
    left: (cell.cx - cell.w / 2) * iw,
    top: (cell.cy - cell.h / 2) * ih,
    width: cell.w * iw,
    height: cell.h * ih,
  };
}

export function AikawaExperience({ onEnterGalaxy }: Props) {
  const count = orbitCategories.length;
  const [scene, setScene] = useState<Scene>('loading');
  const [loadPct, setLoadPct] = useState(0);
  const [loaderGone, setLoaderGone] = useState(false);
  const [canvasOn, setCanvasOn] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [workOn, setWorkOn] = useState(false);
  const [mosaicOn, setMosaicOn] = useState(false);
  const [dockVisible, setDockVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);
  const [selectedIndex, setSelectedIndex] = useState(INITIAL_INDEX);
  const [resetKey, setResetKey] = useState(0);
  const [workKey, setWorkKey] = useState(0);
  const [mosaicKey, setMosaicKey] = useState(0);

  const ms = useMemo(() => {
    const state = createMotionState();
    state.active.value = INITIAL_INDEX;
    state.selectedIndex = INITIAL_INDEX;
    return state;
  }, []);
  const sceneRef = useRef<Scene>('loading');
  sceneRef.current = scene;
  const lock = useRef(false);
  const activeFloat = useRef(INITIAL_INDEX); // unwrapped carousel target
  const stage = useRef<HTMLDivElement>(null);
  const titleEl = useRef<HTMLHeadingElement>(null);
  const labelEl = useRef<HTMLParagraphElement>(null);
  const mirrorEl = useRef<HTMLParagraphElement>(null);
  const shadowEl = useRef<HTMLDivElement>(null);
  const badgeEl = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, moved: false, startX: 0, base: 0, lastX: 0, lastT: 0, vel: 0 });
  /** Inertial carousel spin: velocity in panels/second, decays until snap. */
  const spin = useRef({ vel: 0, settled: true });
  const badge = useRef({ x: 0, y: 0, tx: 0, ty: 0, visible: false });
  const hoverSim = useRef(false);

  const active = orbitCategories[activeIndex];
  const selected = orbitCategories[selectedIndex];

  useEffect(() => {
    if (import.meta.env.DEV) {
      const w = window as unknown as { __ak?: unknown; __gsap?: unknown };
      w.__ak = ms;
      w.__gsap = gsap;
    }
  }, [ms]);

  // Center the giant title once; every later tween keeps these percents.
  useEffect(() => {
    if (titleEl.current) gsap.set(titleEl.current, { xPercent: -50, yPercent: -50 });
  }, [resetKey]);

  // --- Asset preload --------------------------------------------------------
  useEffect(() => {
    const urls = [
      ...new Set(
        orbitCategories.flatMap((c) => [c.image, ...c.cards.map((k) => k.image).filter(Boolean)])
      ),
    ] as string[];
    let loaded = 0;
    urls.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        setLoadPct(Math.round((loaded / urls.length) * 100));
      };
      img.src = src;
    });
  }, [resetKey]);

  // --- Contact shadow geometry (px, resize-aware) ---------------------------
  const [viewportTick, setViewportTick] = useState(0);
  useEffect(() => {
    const onResize = () => setViewportTick((t) => t + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const stripPx = useMemo(() => {
    void viewportTick;
    const w = stripWidthFraction() * window.innerWidth;
    const h = w * STRIP.aspect;
    return { w, h, bottom: STRIP.centerY * window.innerHeight + h / 2 };
  }, [viewportTick]);

  // --- Intro: the opening is NOT a category page -----------------------------
  // Loader dissolves → every category's photograph enters as a flat filmstrip
  // → the strip wraps onto the cylinder and orbits through the front, slowing
  // → reflection, giant title, identity line and dock resolve → user chooses.
  // One master timeline, replayable and scrubbable from the debug panel.
  const introTl = useRef<gsap.core.Timeline | null>(null);

  const startIntro = useCallback(() => {
    lock.current = true;
    setScene('intro');
    setCanvasOn(true);
    setCanvasVisible(true);
    setDockVisible(false);

    // Start upstream on the cylinder: just over one full turn away, flat.
    ms.wrap.value = 0;
    ms.curvature.value = 1;
    ms.reveal.value = 1;
    ms.reflection.value = 0;
    ms.grid.value = 0;
    ms.select.value = 0;
    ms.panelHidden = false;
    ms.cam.value = 0;
    ms.active.value = INITIAL_INDEX + count * 1.18;
    activeFloat.current = INITIAL_INDEX;
    setActiveIndex(INITIAL_INDEX);

    introTl.current?.kill();
    const tl = gsap.timeline({
      defaults: { ease: MOTION.easeInOut },
      onComplete: () => {
        lock.current = false;
        setScene('portfolio-curved');
      },
    });
    introTl.current = tl;

    tl.addLabel('photosEnter', 0);
    // Photographs sweep through the viewport — first flat, then orbiting —
    // decelerating through slightly more than one full revolution.
    tl.to(ms.active, { value: INITIAL_INDEX, duration: 3.6, ease: 'power3.inOut' }, 0);
    tl.addLabel('orbitBegins', 0.75);
    tl.to(ms.wrap, { value: 1, duration: 1.5, ease: 'power3.inOut' }, 0.75);
    // Splash camera settles as the arc forms (reference splashArcCameraBlend).
    tl.to(ms.cam, { value: 1, duration: 1.9, ease: 'power2.inOut' }, 0.9);
    tl.addLabel('categoriesResolve', 2.05);
    tl.to(ms.reflection, { value: 1, duration: 0.9, ease: MOTION.easeOut }, 2.05);
    tl.fromTo(
      titleEl.current,
      { opacity: 0, xPercent: -50, yPercent: -50, y: 18, scaleX: 0.97 },
      { opacity: 1, xPercent: -50, yPercent: -50, y: 0, scaleX: 1, duration: 0.95, ease: 'power4.out' },
      2.0
    );
    tl.fromTo(
      '.akxIdentity',
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.6, ease: MOTION.easeOut },
      2.25
    );
    tl.fromTo(
      shadowEl.current,
      { opacity: 0 },
      { opacity: 0.13 * ms.debug.shadowStrength, duration: 0.6, ease: MOTION.easeOut },
      2.35
    );
    tl.fromTo(
      [labelEl.current, mirrorEl.current],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: MOTION.easeOut },
      2.55
    );
    tl.addLabel('dockAppears', 2.9);
    tl.call(() => setDockVisible(true), undefined, 2.9);
    tl.addLabel('introComplete', 3.7);
    tl.to({}, { duration: 0.01 }, 3.7);

    // Reduced motion: skip the orbit — land on the resolved overview.
    if (prefersReducedMotion()) tl.progress(0.999);
  }, [count, ms]);

  const handleLoaderReveal = useCallback(() => {
    startIntro();
  }, [startIntro]);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (lock.current) return;
      if (sceneRef.current !== 'portfolio-curved') return;
      spin.current.vel = 0;
      spin.current.settled = true;
      activeFloat.current = Math.round(ms.active.value);
      activeFloat.current += dir;
      const wrapped = ((activeFloat.current % count) + count) % count;
      setActiveIndex(wrapped);
      gsap.killTweensOf(ms.active);
      gsap.to(ms.active, { value: activeFloat.current, duration: 0.85, ease: MOTION.easeInOut });
      if (labelEl.current) {
        gsap.fromTo(
          [labelEl.current, mirrorEl.current],
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, delay: 0.3, ease: MOTION.easeOut }
        );
      }
    },
    [count, ms]
  );

  const morphGrid = useCallback(() => {
    if (lock.current || sceneRef.current !== 'portfolio-curved') return;
    lock.current = true;
    ms.hoverPanel = -1;
    badge.current.visible = false;
    gsap.set(badgeEl.current, { opacity: 0 });
    // Stop rotation first, then unfold.
    spin.current.vel = 0;
    spin.current.settled = true;
    activeFloat.current = Math.round(ms.active.value);
    setActiveIndex(((activeFloat.current % count) + count) % count);
    gsap.killTweensOf(ms.active);
    const tl = gsap.timeline({
      onComplete: () => {
        lock.current = false;
        setScene('portfolio-grid');
      },
    });
    tl.to(ms.active, { value: activeFloat.current, duration: 0.2, ease: MOTION.easeSoft }, 0);
    tl.to(ms.grid, { value: 1, duration: 1.1, ease: MOTION.easeInOut }, 0.05);
    tl.to(shadowEl.current, { opacity: 0, duration: 0.5, ease: MOTION.easeOut }, 0.15);
    tl.to([labelEl.current, mirrorEl.current], { opacity: 0, y: -8, duration: 0.35, ease: MOTION.easeOut }, 0);
  }, [ms]);

  const backToCurved = useCallback(() => {
    if (lock.current || sceneRef.current !== 'portfolio-grid') return;
    lock.current = true;
    ms.hoverPanel = -1;
    badge.current.visible = false;
    gsap.to(badgeEl.current, { opacity: 0, duration: 0.2, ease: 'power2.out' });
    const tl = gsap.timeline({
      onComplete: () => {
        lock.current = false;
        setScene('portfolio-curved');
      },
    });
    tl.to(ms.grid, { value: 0, duration: 1.05, ease: MOTION.easeInOut }, 0);
    tl.to(
      shadowEl.current,
      { opacity: 0.13 * ms.debug.shadowStrength, duration: 0.5, ease: MOTION.easeOut },
      0.55
    );
    tl.fromTo(
      [labelEl.current, mirrorEl.current],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: MOTION.easeOut },
      0.7
    );
  }, [ms]);

  const openSelected = useCallback(
    (i: number) => {
      if (lock.current) return;
      const from = sceneRef.current;
      if (from !== 'portfolio-grid' && from !== 'portfolio-curved') return;
      const cat = orbitCategories[i];
      if (cat.enterGalaxy) {
        onEnterGalaxy();
        return;
      }
      lock.current = true;
      ms.selectedIndex = i;
      ms.hoverPanel = -1;
      badge.current.visible = false;
      gsap.to(badgeEl.current, { opacity: 0, duration: 0.2, ease: 'power2.out' });
      setSelectedIndex(i);

      const tl = gsap.timeline({
        onComplete: () => {
          setScene('fragment-transition');
          ms.panelHidden = true;
          setMosaicKey((k) => k + 1);
          setMosaicOn(true);
        },
      });
      setScene('project-selected');
      // Isolate directly from wherever the card sits (arc or grid) — never
      // detour through a full grid layout behind the selected image.
      tl.to(ms.select, { value: 1, duration: 0.85, ease: MOTION.easeInOut }, 0);
      tl.to(shadowEl.current, { opacity: 0, duration: 0.4, ease: MOTION.easeOut }, 0);
      tl.to(
        titleEl.current,
        { y: '-35vh', xPercent: -50, yPercent: -50, opacity: 0, duration: 0.75, ease: MOTION.easeInOut },
        '<'
      );
      tl.to([labelEl.current, mirrorEl.current], { opacity: 0, duration: 0.3, ease: MOTION.easeOut }, 0);
    },
    [ms, onEnterGalaxy]
  );

  const handleMosaicTitleReveal = useCallback(() => {
    setScene('work');
    setWorkKey((k) => k + 1);
    setWorkOn(true);
  }, []);

  const handleMosaicDone = useCallback(() => {
    lock.current = false;
    // Fragments stay scattered as the Work section border, then fade softly.
    gsap.to('.akxMosaic', { opacity: 0.5, duration: 1.2, delay: 0.6, ease: MOTION.easeSoft });
  }, []);

  const backToPortfolio = useCallback(() => {
    if (lock.current || (sceneRef.current !== 'work' && sceneRef.current !== 'work-gallery'))
      return;
    lock.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        setWorkOn(false);
        setMosaicOn(false);
        ms.panelHidden = false;
        ms.select.value = 0;
        ms.grid.value = 0;
        setScene('portfolio-curved');
        lock.current = false;
        gsap.fromTo(
          titleEl.current,
          { opacity: 0, xPercent: -50, yPercent: -50, y: 18, scaleX: 0.97 },
          { opacity: 1, xPercent: -50, yPercent: -50, y: 0, scaleX: 1, duration: 0.85, ease: 'power4.out' }
        );
        gsap.to(shadowEl.current, {
          opacity: 0.13 * ms.debug.shadowStrength,
          duration: 0.55,
          delay: 0.2,
          ease: MOTION.easeOut,
        });
        gsap.fromTo(
          [labelEl.current, mirrorEl.current],
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.4, ease: MOTION.easeOut }
        );
      },
    });
    tl.to('.akxWork', { opacity: 0, duration: 0.45, ease: MOTION.easeInOut }, 0);
    tl.to('.akxMosaic', { opacity: 0, duration: 0.4, ease: MOTION.easeOut }, 0);
  }, [ms]);

  // --- Panel pointer + hover choreography ------------------------------------
  const hoverOn = useRef(false);
  const setCurvedHover = useCallback(
    (on: boolean) => {
      if (hoverOn.current === on) return;
      hoverOn.current = on;
      ms.hoverActive = on;
      gsap.killTweensOf(ms.lift);
      if (on) {
        gsap.to(ms.lift, { value: -5, duration: MOTION.hover, ease: MOTION.easeOut });
        gsap.to(shadowEl.current, {
          opacity: 0.09 * ms.debug.shadowStrength,
          scaleX: 1.08,
          filter: 'blur(23px)',
          duration: MOTION.hover,
          ease: MOTION.easeOut,
        });
        // Label shifts a few pixels and the dock brightens slightly (§10).
        gsap.to([labelEl.current, mirrorEl.current], { y: -3, duration: MOTION.hover, ease: MOTION.easeOut });
        gsap.to('.akxDock', { filter: 'brightness(1.07)', duration: MOTION.hover, ease: MOTION.easeOut });
      } else {
        gsap.to(ms.lift, { value: 0, duration: 0.55, ease: MOTION.easeOut });
        gsap.to(shadowEl.current, {
          opacity: 0.13 * ms.debug.shadowStrength,
          scaleX: 1,
          filter: 'blur(18px)',
          duration: 0.55,
          ease: MOTION.easeOut,
        });
        gsap.to([labelEl.current, mirrorEl.current], { y: 0, duration: 0.55, ease: MOTION.easeOut });
        gsap.to('.akxDock', { filter: 'brightness(1)', duration: 0.55, ease: MOTION.easeOut });
      }
    },
    [ms]
  );

  const onPanelPointer = useCallback(
    (e: PanelPointerEvent) => {
      const sc = sceneRef.current;
      if (sc === 'portfolio-curved') {
        const isActivePanel = wrapOffset(e.index - Math.round(ms.active.value), count) === 0;
        if (!isActivePanel) return;
        if (e.uv) {
          ms.pointerUv = e.uv;
          setCurvedHover(true);
        } else if (!hoverSim.current) {
          setCurvedHover(false);
        }
      } else if (sc === 'portfolio-grid') {
        if (lock.current) return;
        if (e.uv) {
          ms.hoverPanel = e.index;
          ms.pointerUv = e.uv;
          badge.current.tx = e.clientX;
          badge.current.ty = e.clientY;
          if (!badge.current.visible) {
            badge.current.visible = true;
            badge.current.x = e.clientX;
            badge.current.y = e.clientY;
            gsap.fromTo(
              badgeEl.current,
              { opacity: 0, scale: 0.92, filter: 'blur(3px)' },
              { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.28, ease: MOTION.easeOut }
            );
          }
        } else if (ms.hoverPanel === e.index) {
          ms.hoverPanel = -1;
          badge.current.visible = false;
          gsap.to(badgeEl.current, { opacity: 0, duration: 0.24, ease: 'power2.out' });
        }
      }
    },
    [count, ms, setCurvedHover]
  );

  const onPanelClick = useCallback(
    (i: number) => {
      if (drag.current.moved) return;
      const sc = sceneRef.current;
      if (sc === 'portfolio-curved') {
        const off = wrapOffset(i - Math.round(ms.active.value), count);
        if (off === 0) openSelected(i);
        else navigate(off > 0 ? 1 : -1);
      } else if (sc === 'portfolio-grid') {
        openSelected(i);
      }
    },
    [count, ms, navigate, openSelected]
  );

  // --- VIEW badge follow loop -------------------------------------------------
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const b = badge.current;
      if (!badgeEl.current) return;
      b.x += (b.tx - b.x) * 0.18;
      b.y += (b.ty - b.y) * 0.18;
      if (ms.hoverPanel >= 0) {
        const off = wrapOffset(ms.hoverPanel - Math.round(ms.active.value), count);
        const cell = GRID_CELLS[off];
        if (cell) {
          const r = cellRectPx(cell);
          b.x = Math.max(r.left + 14, Math.min(r.left + r.width - 54, b.x));
          b.y = Math.max(r.top + 14, Math.min(r.top + r.height - 34, b.y));
        }
      }
      badgeEl.current.style.transform = `translate(${b.x}px, ${b.y}px)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, ms]);

  // --- Drag navigation on the curved strip -------------------------------------
  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (sceneRef.current !== 'portfolio-curved' || lock.current) return;
      drag.current = {
        on: true,
        moved: false,
        startX: e.clientX,
        base: ms.active.value,
        lastX: e.clientX,
        lastT: performance.now(),
        vel: 0,
      };
      spin.current.vel = 0;
      gsap.killTweensOf(ms.active);
    },
    [ms]
  );
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.on) return;
      const dx = e.clientX - d.startX;
      if (Math.abs(dx) > 6) d.moved = true;
      ms.active.value = d.base - dx / (stripPx.w * (1 + STRIP.gap));
      const now = performance.now();
      const dt = (now - d.lastT) / 1000;
      if (dt > 0.004) {
        // Instantaneous drag velocity in panels/second, lightly smoothed.
        const v = -(e.clientX - d.lastX) / (stripPx.w * (1 + STRIP.gap)) / dt;
        d.vel = d.vel * 0.6 + v * 0.4;
        d.lastX = e.clientX;
        d.lastT = now;
      }
    };
    const up = () => {
      const d = drag.current;
      if (!d.on) return;
      d.on = false;
      if (d.moved) {
        // Release becomes a fling — the spin ticker glides and settles it.
        spin.current.vel = Math.max(-4.5, Math.min(4.5, d.vel));
        spin.current.settled = false;
      }
      requestAnimationFrame(() => (drag.current.moved = false));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [count, ms, stripPx.w]);

  // --- Inertial spin: wheel/fling adds velocity, friction glides it down, ----
  // --- then the strip settles softly onto the nearest panel. -----------------
  useEffect(() => {
    const lastShownIndex = { value: activeIndex };
    const tick = (_time: number, deltaTime: number) => {
      const sp = spin.current;
      if (sceneRef.current !== 'portfolio-curved' || lock.current || drag.current.on) return;
      const dt = Math.min(0.05, deltaTime / 1000);
      if (Math.abs(sp.vel) > 0.02) {
        ms.active.value += sp.vel * dt;
        // Gentle exponential friction — keeps rolling, eventually slows down.
        sp.vel *= Math.exp(-1.35 * dt);
        sp.settled = false;
        const wrapped = ((Math.round(ms.active.value) % count) + count) % count;
        if (wrapped !== lastShownIndex.value) {
          lastShownIndex.value = wrapped;
          setActiveIndex(wrapped);
        }
      } else if (!sp.settled) {
        sp.vel = 0;
        sp.settled = true;
        activeFloat.current = Math.round(ms.active.value);
        const wrapped = ((activeFloat.current % count) + count) % count;
        lastShownIndex.value = wrapped;
        setActiveIndex(wrapped);
        gsap.to(ms.active, { value: activeFloat.current, duration: 0.9, ease: 'power3.out' });
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, ms]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (lock.current || sceneRef.current !== 'portfolio-curved') return;
      const delta = e.deltaY + e.deltaX;
      gsap.killTweensOf(ms.active);
      const sp = spin.current;
      sp.vel = Math.max(-4.5, Math.min(4.5, sp.vel + delta * 0.0035));
      sp.settled = false;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [ms]);

  // --- Keyboard ---------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'Escape') {
        if (sceneRef.current === 'portfolio-grid') backToCurved();
        else if (sceneRef.current === 'work' || sceneRef.current === 'work-gallery')
          backToPortfolio();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, backToCurved, backToPortfolio]);

  // --- Dock wiring --------------------------------------------------------------
  const inWork = scene === 'work' || scene === 'work-gallery';
  const modeHint = scene === 'portfolio-grid' ? 'carousel' : inWork ? 'back' : 'grid';
  const onDockPrev = useCallback(() => {
    if (inWork) backToPortfolio();
    else if (sceneRef.current === 'portfolio-grid') backToCurved();
    else navigate(-1);
  }, [inWork, backToPortfolio, backToCurved, navigate]);
  const onDockNext = useCallback(() => {
    if (inWork) backToPortfolio();
    else if (sceneRef.current === 'portfolio-grid') backToCurved();
    else navigate(1);
  }, [inWork, backToPortfolio, backToCurved, navigate]);
  const onDockOpen = useCallback(() => {
    if (inWork) backToPortfolio();
    else openSelected(activeIndex);
  }, [inWork, backToPortfolio, openSelected, activeIndex]);
  const onDockMode = useCallback(() => {
    const sc = sceneRef.current;
    if (sc === 'portfolio-curved') morphGrid();
    else if (sc === 'portfolio-grid') backToCurved();
    else if (inWork) backToPortfolio();
  }, [inWork, morphGrid, backToCurved]);

  // --- Debug API ------------------------------------------------------------------
  const debugApi: DebugApi = useMemo(
    () => ({
      replayLoader: () => {
        lock.current = false;
        introTl.current?.kill();
        gsap.globalTimeline.clear();
        setScene('loading');
        setLoaderGone(false);
        setCanvasOn(false);
        setCanvasVisible(false);
        setWorkOn(false);
        setMosaicOn(false);
        setDockVisible(false);
        setLoadPct(0);
        ms.curvature.value = 0;
        ms.wrap.value = 0;
        ms.grid.value = 0;
        ms.select.value = 0;
        ms.reveal.value = 0;
        ms.reflection.value = 0;
        ms.panelHidden = false;
        ms.cam.value = 1;
        activeFloat.current = INITIAL_INDEX;
        ms.active.value = INITIAL_INDEX;
        setActiveIndex(INITIAL_INDEX);
        setResetKey((k) => k + 1);
      },
      replayIntro: () => {
        const sc = sceneRef.current;
        if (sc === 'loading') return;
        setWorkOn(false);
        setMosaicOn(false);
        startIntro();
      },
      scrubIntro: (progress: number) => {
        introTl.current?.pause().progress(progress);
      },
      pauseIntro: () => {
        const tl = introTl.current;
        if (!tl) return;
        if (tl.paused()) tl.play();
        else tl.pause();
      },
      jumpIntro: (label: string) => {
        introTl.current?.pause().seek(label);
      },
      goCurved: () => {
        const sc = sceneRef.current;
        if (sc === 'portfolio-grid') backToCurved();
        else if (sc === 'work' || sc === 'work-gallery') backToPortfolio();
      },
      morphGrid,
      selectProject: () => openSelected(activeIndex),
      replayFragment: () => {
        if (!mosaicOn) return;
        setMosaicKey((k) => k + 1);
      },
      replayWork: () => {
        if (!workOn) return;
        setWorkKey((k) => k + 1);
      },
      toggleHoverSim: () => {
        hoverSim.current = !hoverSim.current;
        ms.pointerUv = { x: 0.62, y: 0.38 };
        setCurvedHover(hoverSim.current);
      },
      snapshot: () => ({
        scene: sceneRef.current,
        active: activeFloat.current,
        locked: lock.current,
        wrap: ms.wrap.value,
        grid: ms.grid.value,
        select: ms.select.value,
        reflection: ms.reflection.value,
        selectedIndex: ms.selectedIndex,
        hoverPanel: ms.hoverPanel,
      }),
    }),
    [ms, startIntro, backToCurved, backToPortfolio, morphGrid, openSelected, activeIndex, mosaicOn, workOn, setCurvedHover]
  );

  const selectRectPx = cellRectPx(selectRect());

  return (
    <div className="akxStage" ref={stage} key={resetKey}>
      <header className="akxTop">
        <p className="akxIdentity" style={{ opacity: 0 }}>
          <span className="akxIdentityName">{profile.name}</span> is building the trust &amp;
          evaluation layer for AI.
        </p>
        <button type="button" className="akxTopGalaxy" onClick={onEnterGalaxy}>
          Enter Galaxy
        </button>
      </header>

      <h2 className="akxPortfolioTitle" ref={titleEl} aria-hidden={scene === 'intro'}>
        PORTFOLIO
      </h2>

      {canvasOn ? (
        <div
          className={`akxCanvasWrap ${canvasVisible ? 'isOn' : ''} ${inWork || mosaicOn ? 'isBehind' : ''}`}
          onPointerDown={onDragStart}
        >
          <PortfolioCanvas
            categories={orbitCategories}
            motionState={ms}
            onPanelPointer={onPanelPointer}
            onPanelClick={onPanelClick}
          />
        </div>
      ) : null}

      <div
        className="akxShadow"
        ref={shadowEl}
        style={{
          width: stripPx.w * 0.62,
          top: stripPx.bottom + 4,
          opacity: 0,
        }}
        aria-hidden="true"
      />

      <p className="akxEmboss" ref={labelEl} style={{ opacity: 0 }} aria-live="polite">
        {active.label}
      </p>
      <p className="akxEmboss akxEmbossMirror" ref={mirrorEl} style={{ opacity: 0 }} aria-hidden="true">
        {active.label}
      </p>

      {mosaicOn ? (
        <MosaicTransition
          key={`mosaic-${mosaicKey}`}
          imageSrc={selected.image}
          imageFit={selected.imageFit}
          imageBg={selected.imageBg}
          rect={selectRectPx}
          tint={WORK_TINT}
          onTitleReveal={handleMosaicTitleReveal}
          onDone={handleMosaicDone}
        />
      ) : null}

      {workOn ? (
        <WorkScene
          key={`work-${workKey}`}
          category={selected}
          onEnteredGallery={() => setScene('work-gallery')}
        />
      ) : null}

      <div
        className="akxViewBadge"
        ref={badgeEl}
        style={{ opacity: 0, visibility: scene === 'portfolio-grid' ? 'visible' : 'hidden' }}
        aria-hidden="true"
      >
        VIEW
      </div>

      <Dock
        categories={orbitCategories}
        activeIndex={activeIndex}
        count={count}
        visible={dockVisible}
        modeHint={modeHint}
        onPrev={onDockPrev}
        onNext={onDockNext}
        onOpen={onDockOpen}
        onMode={onDockMode}
      />

      {!loaderGone ? (
        <Loader
          progress={loadPct}
          name={profile.name}
          onReveal={handleLoaderReveal}
          onDone={() => setLoaderGone(true)}
        />
      ) : null}

      {import.meta.env.DEV ? <DebugPanel api={debugApi} motionState={ms} /> : null}
    </div>
  );
}
