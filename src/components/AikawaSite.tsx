import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { orbitCategories, profile } from '../data/aikawaData';

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Props = {
  onEnterGalaxy: () => void;
};

export function AikawaSite({ onEnterGalaxy }: Props) {
  const [ready, setReady] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<'home' | 'detail'>('home');
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [progress, setProgress] = useState(0);
  const dragX = useRef(0);
  const dragging = useRef(false);

  const active = orbitCategories[index];
  const count = orbitCategories.length;

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame += 1;
      const next = Math.min(100, Math.round((frame / 42) * 100));
      setLoadPct(next);
      if (next < 100) requestAnimationFrame(tick);
      else setTimeout(() => setReady(true), 220);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  useEffect(() => {
    document.documentElement.dataset.akMode = mode;
  }, [mode]);

  const go = (dir: -1 | 1) => {
    setIndex((prev) => (prev + dir + count) % count);
  };

  const openDetail = () => setView('detail');
  const backHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const panels = useMemo(() => {
    return [-2, -1, 0, 1, 2].map((offset) => {
      const i = (index + offset + count * 10) % count;
      return { offset, cat: orbitCategories[i] };
    });
  }, [index, count]);

  const onPointerDown = (e: ReactPointerEvent) => {
    dragging.current = true;
    dragX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragX.current;
    dragging.current = false;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  };

  const detailLoop = useMemo(
    () => [...active.cards, ...active.cards],
    [active.cards]
  );

  return (
    <div className={`akStage ${mode === 'dark' ? 'isDark' : 'isLight'}`}>
      <AnimatePresence>
        {!ready ? (
          <motion.div
            className="akLoad"
            key="load"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <p className="akLoadName">{profile.name}</p>
            <p className="akLoadPct">{loadPct}%</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className="akTop">
        <p className="akTopLine">
          <button type="button" className="akTopName" onClick={backHome}>
            {profile.name}
          </button>
          <span> is building the trust layer for AI.</span>
        </p>
        <div className="akTopRight">
          <button type="button" className="akTopGalaxy" onClick={onEnterGalaxy}>
            Enter Galaxy
          </button>
          <p className="akTopPct">{view === 'home' ? `${index + 1}/${count}` : `${progress}%`}</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.section
            key="home"
            className="akHome"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <h1 className="akGiant" aria-live="polite">
              {active.label}
            </h1>

            <div
              className="akCarousel"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                dragging.current = false;
              }}
            >
              <div className="akCarouselStage">
                {panels.map(({ offset, cat }) => (
                  <button
                    key={`${cat.id}-${offset}`}
                    type="button"
                    className={`akPanel offset${offset}`}
                    style={{ background: cat.imageBg ?? '#111' }}
                    onClick={() => {
                      if (offset === 0) openDetail();
                      else go(offset > 0 ? 1 : -1);
                    }}
                    aria-label={cat.label}
                  >
                    <img
                      src={cat.image}
                      alt=""
                      className={cat.imageFit === 'contain' ? 'isContain' : 'isCover'}
                    />
                    {offset === 0 ? <span className="akPanelLabel">{cat.label}</span> : null}
                  </button>
                ))}
              </div>
              <div className="akReflection" aria-hidden="true">
                <div className="akCarouselStage isMirror">
                  {panels.map(({ offset, cat }) => (
                    <div
                      key={`m-${cat.id}-${offset}`}
                      className={`akPanel offset${offset}`}
                      style={{ background: cat.imageBg ?? '#111' }}
                    >
                      <img
                        src={cat.image}
                        alt=""
                        className={cat.imageFit === 'contain' ? 'isContain' : 'isCover'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="detail"
            className="akDetail"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <div className="akDetailHead">
              <p className="akDetailEyebrow">Category</p>
              <h2 className="akDetailTitle">{active.label}</h2>
              <p className="akDetailLead">{active.lead}</p>
            </div>

            <div className="akDetailHero" style={{ background: active.imageBg ?? '#111' }}>
              <img
                src={active.image}
                alt=""
                className={active.imageFit === 'contain' ? 'isContain' : 'isCover'}
              />
            </div>

            <div className="akRoulette">
              <div className="akRouletteTrack">
                {detailLoop.map((card, i) => (
                  <article key={`${card.id}-${i}`} className="akFrame">
                    <div
                      className="akFrameMedia"
                      style={{ background: card.imageBg ?? '#161616' }}
                    >
                      {card.image ? (
                        <img
                          src={card.image}
                          alt=""
                          className={card.imageFit === 'contain' ? 'isContain' : 'isCover'}
                        />
                      ) : null}
                    </div>
                    <div className="akFrameCopy">
                      <p className="akFrameMeta">{card.meta}</p>
                      <h3 className="akFrameTitle">{card.title}</h3>
                      <p className="akFrameBody">{card.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="akDetailContact" id="contact">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <button type="button" className="akGalaxyLink" onClick={onEnterGalaxy}>
                Enter Galaxy
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <nav className={`akFloat ${ready ? 'isOn' : ''}`} aria-label="Portfolio">
        <button type="button" className="akFloatSide" onClick={backHome} aria-label="Back">
          ←
        </button>

        <div className="akFloatCore">
          <button type="button" className="akFloatArrow" onClick={() => go(-1)} aria-label="Previous">
            ‹
          </button>

          <button type="button" className="akFloatCenter" onClick={openDetail}>
            <span className="akFloatThumb" style={{ background: active.imageBg ?? '#222' }}>
              <img
                src={active.image}
                alt=""
                className={active.imageFit === 'contain' ? 'isContain' : 'isCover'}
              />
            </span>
            <span className="akFloatText">
              <span className="akFloatSub">Category</span>
              <strong>{active.label}</strong>
            </span>
          </button>

          <button type="button" className="akFloatArrow" onClick={() => go(1)} aria-label="Next">
            ›
          </button>
        </div>

        <button
          type="button"
          className="akFloatSide"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          aria-label="Toggle mode"
        >
          {mode === 'light' ? '◐' : '◑'}
        </button>
      </nav>
    </div>
  );
}
