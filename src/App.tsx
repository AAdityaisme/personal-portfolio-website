import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AikawaSite } from './components/AikawaSite';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlassBubble } from './components/GlassBubble';
import { SmoothScroll } from './components/SmoothScroll';
import type { FocusTarget } from './components/GalaxyScene';
import { galaxyNodes, sunNode } from './data/aadiData';
import { useReducedMotion } from './hooks/useScrollProgress';
import { recordVisit } from './lib/visitCounter';

const GalaxyScene = lazy(() =>
  import('./components/GalaxyScene').then((mod) => ({ default: mod.GalaxyScene }))
);

const guideLines = [
  'Scroll to zoom in and out.',
  'Drag to look around.',
  'Click a glowing planet to see qualifications and experience.',
] as const;

const guideEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

function GalaxyMode({ onExit }: { onExit: () => void }) {
  const reducedMotion = useReducedMotion();
  const [focusedTarget, setFocusedTarget] = useState<FocusTarget>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [guideStep, setGuideStep] = useState(0);
  const [guideLineOn, setGuideLineOn] = useState(true);
  const [guideDone, setGuideDone] = useState(false);

  const activeNode =
    focusedTarget === 'sun'
      ? sunNode
      : focusedTarget != null
        ? galaxyNodes[focusedTarget] ?? null
        : null;
  const showBubble = focusedTarget != null && !!activeNode;
  const showGuide = focusedTarget == null && !guideDone && guideLineOn;

  const onAnchor = useCallback((screen: { x: number; y: number } | null) => {
    setAnchor(screen);
  }, []);

  const onPlanetHover = useCallback((id: string | null) => {
    setHoveredId(id);
  }, []);

  const onPlanetSelect = useCallback((index: number) => {
    setFocusedTarget(index);
  }, []);

  const onSunSelect = useCallback(() => {
    setFocusedTarget('sun');
  }, []);

  const goBack = useCallback(() => {
    setFocusedTarget(null);
    setAnchor(null);
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    const onLost = () => setSceneFailed(true);
    window.addEventListener('webglcontextlost', onLost as EventListener);
    return () => window.removeEventListener('webglcontextlost', onLost as EventListener);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (focusedTarget != null) goBack();
        else onExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedTarget, goBack, onExit]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    if (focusedTarget != null) setGuideDone(true);
  }, [focusedTarget]);

  useEffect(() => {
    if (guideDone || reducedMotion) {
      if (reducedMotion) setGuideDone(true);
      return;
    }

    let alive = true;
    const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    (async () => {
      for (let i = 0; i < guideLines.length; i++) {
        if (!alive) return;
        setGuideStep(i);
        setGuideLineOn(true);
        await wait(2000);
        if (!alive) return;
        await wait(1600);
        if (!alive) return;
        setGuideLineOn(false);
        await wait(1600);
      }
      if (alive) setGuideDone(true);
    })();

    return () => {
      alive = false;
    };
  }, [guideDone, reducedMotion]);

  if (sceneFailed) {
    return (
      <div className="galaxyFallback">
        <div className="galaxyFallbackInner">
          <p>3D scene could not start on this device.</p>
          <button type="button" className="btnPrimary" onClick={onExit}>
            Back to site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="galaxyMode galaxyModeEnter">
      <ErrorBoundary
        fallback={
          <div className="galaxyFallback">
            <div className="galaxyFallbackInner">
              <p>3D scene could not start on this device.</p>
              <button type="button" className="btnPrimary" onClick={onExit}>
                Back to site
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={<div className="galaxyFallback" aria-hidden="true" />}>
          <GalaxyScene
            focusedTarget={focusedTarget}
            reducedMotion={reducedMotion}
            hoveredId={hoveredId}
            onAnchor={onAnchor}
            onPlanetHover={onPlanetHover}
            onPlanetSelect={onPlanetSelect}
            onSunSelect={onSunSelect}
          />
        </Suspense>
      </ErrorBoundary>

      <div className="orbitSubtitleStage" aria-live="polite">
        <AnimatePresence mode="wait">
          {showGuide ? (
            <motion.p
              key={guideStep}
              className="orbitSubtitle"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 2, ease: guideEase },
              }}
              exit={{
                opacity: 0,
                y: -8,
                transition: { duration: 1.6, ease: guideEase },
              }}
            >
              {guideLines[guideStep]}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {focusedTarget == null ? (
        <button type="button" className="orbitBack" onClick={onExit}>
          ← Leave galaxy
        </button>
      ) : null}

      <div className={`bubbleStage ${showBubble ? 'isOpen' : ''}`}>
        <GlassBubble
          node={activeNode}
          visible={showBubble}
          anchor={showBubble ? anchor : null}
          onBack={goBack}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<'site' | 'galaxy'>('site');

  useEffect(() => {
    recordVisit();
  }, []);

  if (mode === 'galaxy') {
    return (
      <main className="appShell galaxyShell">
        <GalaxyMode onExit={() => setMode('site')} />
      </main>
    );
  }

  return (
    <SmoothScroll enabled>
      <main className="appShell akShell">
        <AikawaSite onEnterGalaxy={() => setMode('galaxy')} />
      </main>
    </SmoothScroll>
  );
}
