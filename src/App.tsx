import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EditorialSite } from './components/EditorialSite';
import { GlassBubble } from './components/GlassBubble';
import { SmoothScroll } from './components/SmoothScroll';
import type { FocusTarget } from './components/GalaxyScene';
import { galaxyNodes, sunNode } from './data/aadiData';
import { useReducedMotion } from './hooks/useScrollProgress';
import { recordVisit } from './lib/visitCounter';

const GalaxyScene = lazy(() =>
  import('./components/GalaxyScene').then((mod) => ({ default: mod.GalaxyScene }))
);

function isDesktopViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
}

function GalaxyMode({ onExit }: { onExit: () => void }) {
  const reducedMotion = useReducedMotion();
  const [focusedTarget, setFocusedTarget] = useState<FocusTarget>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeNode =
    focusedTarget === 'sun'
      ? sunNode
      : focusedTarget != null
        ? galaxyNodes[focusedTarget] ?? null
        : null;
  const showBubble = focusedTarget != null && !!activeNode;

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
    <div className="galaxyMode">
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

      {focusedTarget == null ? (
        <p className="orbitHint" aria-live="polite">
          <span className="orbitHintPulse" aria-hidden="true" />
          Drag to look · Click a glowing world
        </p>
      ) : null}

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
  const [mode, setMode] = useState<'site' | 'galaxy'>(() =>
    isDesktopViewport() ? 'galaxy' : 'site'
  );

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
      <main className="appShell edShell">
        <EditorialSite onEnterGalaxy={() => setMode('galaxy')} />
      </main>
    </SmoothScroll>
  );
}
