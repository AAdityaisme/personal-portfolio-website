import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import type { OrbitCategory } from '../../data/aikawaData';
import { MOTION } from '../../lib/motion/constants';

/** Rolls its content vertically whenever `itemKey` changes. */
function Roll({ itemKey, children }: { itemKey: string; children: ReactNode }) {
  const wrap = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<{ key: string; node: ReactNode }[]>([
    { key: itemKey, node: children },
  ]);
  const prevKey = useRef(itemKey);

  useEffect(() => {
    if (itemKey === prevKey.current) {
      setShown([{ key: itemKey, node: children }]);
      return;
    }
    prevKey.current = itemKey;
    setShown((cur) => [...cur.slice(-1), { key: itemKey, node: children }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemKey]);

  useEffect(() => {
    if (shown.length < 2 || !wrap.current) return;
    const [oldEl, newEl] = Array.from(wrap.current.children);
    const ctx = gsap.context(() => {
      gsap.fromTo(oldEl, { y: 0, opacity: 1 }, { y: -7, opacity: 0, duration: 0.26, ease: MOTION.easeOut });
      gsap.fromTo(
        newEl,
        { y: 7, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.26,
          ease: MOTION.easeOut,
          onComplete: () => setShown((cur) => cur.slice(-1)),
        }
      );
    }, wrap);
    return () => ctx.revert();
  }, [shown]);

  return (
    <span className="akxRoll" ref={wrap}>
      {shown.map((s) => (
        <span className="akxRollItem" key={s.key}>
          {s.node}
        </span>
      ))}
    </span>
  );
}

type Props = {
  categories: OrbitCategory[];
  activeIndex: number;
  count: number;
  visible: boolean;
  /** 'grid' | 'carousel' pick the mode icon; 'back' renders the detail dock. */
  modeHint: 'grid' | 'carousel' | 'back';
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
  onMode: () => void;
};

/**
 * Reference dock: one glass pill [thumb | eyebrow+label | ← →] plus a separate
 * circular mode button. Hovering an arrow previews the neighbouring category
 * inside the pill ("Next / FASHION" in the reference). Detail scenes swap to
 * [← back circle | Category pill | mode].
 */
export function Dock({
  categories,
  activeIndex,
  count,
  visible,
  modeHint,
  onPrev,
  onNext,
  onOpen,
  onMode,
}: Props) {
  const [peek, setPeek] = useState<0 | -1 | 1>(0);
  const detail = modeHint === 'back';
  const shownIndex = detail || peek === 0 ? activeIndex : (activeIndex + peek + count) % count;
  const shown = categories[shownIndex];
  const eyebrow = detail
    ? 'Category'
    : peek === 1
      ? 'Next'
      : peek === -1
        ? 'Prev'
        : `${String(activeIndex + 1).padStart(2, '0')}/${String(count).padStart(2, '0')}`;

  return (
    <nav className={`akxDock ${visible ? 'isOn' : ''}`} aria-label="Portfolio navigation">
      {detail ? (
        <button type="button" className="akxDockCircle" onClick={onPrev} aria-label="Back">
          <span className="akxDockIcon isLeft">←</span>
        </button>
      ) : null}

      <div className={`akxDockPill ${peek !== 0 ? 'isPeek' : ''}`}>
        <button type="button" className="akxDockHit" onClick={onOpen} aria-label={`Open ${shown.label}`}>
          <span className="akxDockThumb" style={{ background: shown.imageBg ?? '#1c1c1c' }}>
            <Roll itemKey={shown.id}>
              <img
                src={shown.image}
                alt=""
                draggable={false}
                className={shown.imageFit === 'contain' ? 'isContain' : 'isCover'}
              />
            </Roll>
          </span>
          <span className="akxDockText">
            <span className="akxDockSub">
              <Roll itemKey={eyebrow}>{eyebrow}</Roll>
            </span>
            <Roll itemKey={shown.id}>
              <strong>{shown.short}</strong>
            </Roll>
          </span>
        </button>

        {!detail ? (
          <span className="akxDockArrows">
            <button
              type="button"
              className="akxDockArr"
              onClick={onPrev}
              onPointerEnter={() => setPeek(-1)}
              onPointerLeave={() => setPeek(0)}
              aria-label="Previous category"
            >
              <span className="akxDockIcon isLeft">←</span>
            </button>
            <button
              type="button"
              className="akxDockArr"
              onClick={onNext}
              onPointerEnter={() => setPeek(1)}
              onPointerLeave={() => setPeek(0)}
              aria-label="Next category"
            >
              <span className="akxDockIcon isRight">→</span>
            </button>
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className="akxDockCircle isMode"
        onClick={onMode}
        aria-label={modeHint === 'grid' ? 'Grid view' : modeHint === 'carousel' ? 'Carousel view' : 'Overview'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {modeHint === 'grid' ? (
            <g fill="currentColor">
              <rect x="4.5" y="4.5" width="6" height="6" rx="1" />
              <rect x="13.5" y="4.5" width="6" height="6" rx="1" />
              <rect x="4.5" y="13.5" width="6" height="6" rx="1" />
              <rect x="13.5" y="13.5" width="6" height="6" rx="1" />
            </g>
          ) : (
            <circle
              cx="12"
              cy="12"
              r="7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeDasharray="9 4.5"
              transform="rotate(-70 12 12)"
            />
          )}
        </svg>
      </button>
    </nav>
  );
}
