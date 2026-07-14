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
  active: OrbitCategory;
  index: number;
  count: number;
  visible: boolean;
  /** Label under the mode circle's meaning changes per scene. */
  modeHint: 'grid' | 'carousel' | 'back';
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
  onMode: () => void;
};

/** Stage — fixed glass navigation dock: prev circle, center pill, next circle, mode circle. */
export function Dock({ active, index, count, visible, modeHint, onPrev, onNext, onOpen, onMode }: Props) {
  return (
    <nav className={`akxDock ${visible ? 'isOn' : ''}`} aria-label="Portfolio navigation">
      <button type="button" className="akxDockCircle" onClick={onPrev} aria-label="Previous">
        <span className="akxDockIcon isLeft">‹</span>
      </button>

      <button type="button" className="akxDockPill" onClick={onOpen} aria-label={`Open ${active.label}`}>
        <span className="akxDockThumb" style={{ background: active.imageBg ?? '#1c1c1c' }}>
          <Roll itemKey={active.id}>
            <img
              src={active.image}
              alt=""
              draggable={false}
              className={active.imageFit === 'contain' ? 'isContain' : 'isCover'}
            />
          </Roll>
        </span>
        <span className="akxDockText">
          <span className="akxDockSub">
            {String(index + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
          </span>
          <Roll itemKey={active.id}>
            <strong>{active.short}</strong>
          </Roll>
        </span>
        <span className="akxDockDot" aria-hidden="true" />
      </button>

      <button type="button" className="akxDockCircle" onClick={onNext} aria-label="Next">
        <span className="akxDockIcon isRight">›</span>
      </button>

      <button
        type="button"
        className="akxDockCircle isMode"
        onClick={onMode}
        aria-label={modeHint === 'grid' ? 'Grid view' : modeHint === 'carousel' ? 'Carousel view' : 'Back'}
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
