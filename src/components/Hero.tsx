import { motion } from 'framer-motion';
import { profile } from '../data/aadiData';

type Props = {
  onExplore: () => void;
};

/** Intro only — fully removed once the user enters the galaxy so it cannot block the canvas. */
export function Hero({ onExplore }: Props) {
  return (
    <section className="heroOverlay" aria-label="Introduction">
      <div className="heroGrid">
        <motion.div
          className="heroCopy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="heroMeta">Est. 2025 · Bay Area, California</p>
          <h1 className="heroName">{profile.name}</h1>
          <p className="heroHeadline">{profile.headline}</p>
          <p className="heroTagline">{profile.tagline}</p>
          <div className="heroActions">
            <button type="button" className="btnPrimary" onClick={onExplore}>
              Explore the Galaxy
            </button>
            <a className="btnGhost" href={`mailto:${profile.email}`}>
              Contact Aadi
            </a>
          </div>
        </motion.div>

        <motion.figure
          className="heroPortrait"
          initial={{ opacity: 0, scale: 0.96, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="portraitRing" aria-hidden="true" />
          <img
            src={profile.portrait}
            alt="Aadi Sharma"
            width={480}
            height={600}
            fetchPriority="high"
          />
          <figcaption>Builder · Researcher · Public Servant</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
