import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalaxyNode } from '../data/aadiData';

export type BubbleAnchor = {
  x: number;
  y: number;
};

type Props = {
  node: GalaxyNode | null;
  visible: boolean;
  /** Planet screen position for the tracking line tip */
  anchor?: BubbleAnchor | null;
  onBack?: () => void;
};

function MediaBlock({ node }: { node: GalaxyNode }) {
  if (!node.image || node.mediaPlacement === 'none') return null;
  const isTicket = node.id === 'startup';
  const isCorgi = node.id === 'corgi';
  const isAgs = node.id === 'finance';
  const isLogo = node.image === node.logo && !isTicket && !isCorgi && !isAgs;

  return (
    <div
      className={[
        'glassMedia',
        isTicket ? 'glassMediaTicket' : '',
        isCorgi ? 'glassMediaCorgi' : '',
        isAgs ? 'glassMediaAgs' : '',
        isLogo ? 'glassMediaLogo' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img src={node.image} alt="" loading="lazy" />
    </div>
  );
}

export function GlassBubble({ node, visible, anchor, onBack }: Props) {
  if (!node) return null;

  const side = node.bubbleSide;
  const style: CSSProperties = {
    ['--accent' as string]: node.accent,
  };

  const showSide = node.mediaPlacement === 'side' && !!node.image;
  const showTop = node.mediaPlacement === 'top' && !!node.image;

  // Tracking line from fixed bubble edge to planet screen point.
  let line: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (anchor && typeof window !== 'undefined') {
    const bubbleW = Math.min(420, window.innerWidth * 0.4);
    const midY = window.innerHeight * 0.5;
    const fromX = side === 'left' ? 28 + bubbleW : window.innerWidth - 28 - bubbleW;
    line = {
      x1: fromX,
      y1: midY,
      x2: anchor.x,
      y2: anchor.y,
    };
  }

  return (
    <>
      {visible && line ? (
        <svg className="bubbleTrackSvg" aria-hidden="true">
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={node.accent}
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
          <circle cx={line.x2} cy={line.y2} r="5" fill={node.accent} opacity="0.95" />
          <circle
            cx={line.x1}
            cy={line.y1}
            r="4"
            fill={node.accent}
            opacity="0.9"
          />
        </svg>
      ) : null}

      <AnimatePresence mode="wait">
        {visible ? (
          <motion.article
            key={node.id}
            className={`glassBubble isStaticDock dock-${side}`}
            initial={{ opacity: 0, x: side === 'left' ? -18 : 18, y: '-50%' }}
            animate={{ opacity: 1, x: 0, y: '-50%' }}
            exit={{ opacity: 0, x: side === 'left' ? -12 : 12, y: '-50%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={style}
          >
            <div className="glassBubbleGlow" aria-hidden="true" />
            <span className={`bubbleEdgeDot dock-${side}`} aria-hidden="true" />

            <div className="glassBubbleInner">
              {onBack ? (
                <button type="button" className="bubbleBackBtn" onClick={onBack}>
                  ← Back to orbit
                </button>
              ) : null}

              {showTop ? <MediaBlock node={node} /> : null}

              <div className="glassHeader">
                {node.logo && !showSide ? (
                  <div className={`glassBadge ${node.id === 'corgi' ? 'glassBadgePhoto' : ''}`}>
                    <img src={node.logo} alt="" className="glassBadgeImg" />
                  </div>
                ) : null}
                <div className="glassHeaderText">
                  <p className="glassKicker">{node.subtitle}</p>
                  <h2 className="glassTitle">{node.title}</h2>
                </div>
              </div>

              <div className={`glassMain ${showSide ? 'glassMainWithSide' : ''}`}>
                <div className="glassCopy">
                  {node.date ? <p className="glassDate">{node.date}</p> : null}
                  <p className="glassBody">{node.body}</p>

                  <ul className="glassBullets">
                    {node.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {node.impact ? <p className="glassImpact">{node.impact}</p> : null}

                  {node.links?.length ? (
                    <div className="glassLinks">
                      {node.links.map((link) => (
                        <a
                          key={link.href + link.label}
                          href={link.href}
                          className="glassLink"
                          target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>

                {showSide ? (
                  <div className="glassSideMedia">
                    <MediaBlock node={node} />
                  </div>
                ) : null}
              </div>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>
    </>
  );
}
