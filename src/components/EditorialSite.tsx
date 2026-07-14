import { useRef, useState, type TouchEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile, projects, type ProjectCard } from '../data/editorialData';
import { MasteryBoard } from './MasteryBoard';
import { MiniGalaxy } from './MiniGalaxy';
import { SkillsBoard } from './SkillsBoard';

type Props = {
  onEnterGalaxy: () => void;
};

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.18 as const },
  transition: { duration: 1.15, ease: easeOut },
};

const deckSpring = { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.9 };

function SectionLabel({ children }: { children: string }) {
  return <p className="edLabel">{children}</p>;
}

function PhotoBand({
  image,
  quote,
  caption,
}: {
  image: string;
  quote: string;
  caption: string;
}) {
  return (
    <section className="edPhotoBand" style={{ backgroundImage: `url(${image})` }}>
      <div className="edPhotoScrim" aria-hidden="true" />
      <motion.div className="edPhotoInner" {...fadeUp}>
        <p className="edPhotoQuote">{quote}</p>
        <p className="edPhotoCaption">{caption}</p>
      </motion.div>
    </section>
  );
}

function ProjectSlide({ p }: { p: ProjectCard }) {
  const tone = p.imageTone ?? 'photo';
  return (
    <article className="edDeckCard">
      {p.image ? (
        <div className={`edProjectMedia isFill isTone-${tone}`}>
          <img src={p.image} alt="" loading="lazy" />
        </div>
      ) : (
        <div className="edProjectMedia isPlaceholder" aria-hidden="true">
          <span>{p.kicker}</span>
        </div>
      )}
      <p className="edProjectKicker">{p.kicker}</p>
      <h3 className="edProjectTitle">{p.title}</h3>
      <p className="edProjectBody">{p.body}</p>
      <ul className="edProjectTags">
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="edProjectLinks">
        {p.links.map((l) => (
          <a
            key={l.href + l.label}
            href={l.href}
            target={l.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={l.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          >
            {l.label}
          </a>
        ))}
      </div>
    </article>
  );
}

function ProjectDeck({ items }: { items: ProjectCard[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (next: number, dir: number) => {
    const len = items.length;
    const wrapped = ((next % len) + len) % len;
    setDirection(dir);
    setIndex(wrapped);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx < 0) go(index + 1, 1);
    else go(index - 1, -1);
  };

  return (
    <motion.div className="edDeck" {...fadeUp}>
      <div
        className="edDeckStage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className="edDeckArrow isPrev"
          aria-label="Previous project"
          onClick={() => go(index - 1, -1)}
        >
          ‹
        </button>

        <div className="edDeckViewport">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={items[index].id}
              className="edDeckSlide"
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir >= 0 ? '72%' : '-72%',
                  opacity: 0,
                  scale: 0.96,
                }),
                center: { x: 0, opacity: 1, scale: 1 },
                exit: (dir: number) => ({
                  x: dir >= 0 ? '-72%' : '72%',
                  opacity: 0,
                  scale: 0.96,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={deckSpring}
            >
              <ProjectSlide p={items[index]} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="edDeckArrow isNext"
          aria-label="Next project"
          onClick={() => go(index + 1, 1)}
        >
          ›
        </button>
      </div>

      <div className="edDeckDots" role="tablist" aria-label="Project slides">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`edDeckDot ${i === index ? 'isActive' : ''}`}
            aria-label={`Show ${item.title}`}
            onClick={() => go(i, i > index ? 1 : -1)}
          />
        ))}
      </div>
      <p className="edDeckHint">
        {index + 1} / {items.length} · arrows or swipe
      </p>
    </motion.div>
  );
}

export function EditorialSite({ onEnterGalaxy }: Props) {
  return (
    <div className="edPage">
      <header
        className="edHero"
        style={{ backgroundImage: 'url(./images/hero-nebula.png)' }}
      >
        <div className="edHeroScrim" aria-hidden="true" />
        <motion.div
          className="edHeroInner"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, ease: easeOut }}
        >
          <img
            src="./images/aadi-hero.png"
            alt="Aadi Sharma"
            className="edHeroPhoto"
            width={160}
            height={160}
          />
          <p className="edEyebrow">Bay Area · Trust layer for AI</p>
          <h1 className="edName">{profile.name}</h1>
          <p className="edHeadline">{profile.headline}</p>
          <p className="edLead">
            I turned down Georgia Tech and built my own orbit from DVC. Evaluation research, stealth
            founding, and GTM — systems that hold up when the benchmark looks fine and the real world
            does not.
          </p>
          <div className="edHeroActions">
            <a className="edBtnSecondary" href="#about">
              Read the story
            </a>
          </div>
        </motion.div>
      </header>

      <motion.div {...fadeUp}>
        <MiniGalaxy onEnter={onEnterGalaxy} />
      </motion.div>

      <section className="edSection" id="about">
        <motion.div {...fadeUp}>
          <SectionLabel>01 · About</SectionLabel>
          <h2 className="edTitle">
            Who I am when the <span className="edGold">room gets quiet</span>
          </h2>
        </motion.div>
        <div className="edProse">
          <motion.p {...fadeUp}>
            I&apos;m Aadi Sharma — Data Science and Economics at Diablo Valley College, 4.0 GPA,
            building from the Bay Area. I turned down Georgia Tech on purpose. The bet was ownership
            and shipping speed over a name on a hoodie.
          </motion.p>
          <motion.p {...fadeUp}>
            Day to day I move between three lanes. As a founder I&apos;m shipping a stealth AI product
            while attending YC Startup School. In GTM at Corgi I learn how markets buy. In evaluation
            work — including a specialized OpenAI track — I study where models look strong on paper
            and fail in the wild.
          </motion.p>
          <motion.p {...fadeUp}>
            Outside the product loop I run finance and ops across campus organizations, source
            early-stage deals at Mangusta Capital, and I&apos;ve closed meaningful personal sales under
            pressure. Community college is a launchpad, not a waiting room.
          </motion.p>
        </div>
      </section>

      <PhotoBand
        image="./images/sf-cable-cars.png"
        quote="Building in public, learning in the open."
        caption="CALIFORNIA STREET · SAN FRANCISCO"
      />

      <section className="edSection" id="research">
        <motion.div {...fadeUp}>
          <SectionLabel>02 · Research</SectionLabel>
          <h2 className="edTitle">
            What I&apos;m <span className="edGold">pursuing</span> now
          </h2>
        </motion.div>
        <div className="edProse">
          <motion.p {...fadeUp}>
            My focus is AI evaluation integrity — the gap between leaderboard performance and
            real-world reliability. Gatekeeper systems can pass benchmarks while quietly routing
            around hard cases or hiding failure modes that only show up in production.
          </motion.p>
          <motion.p {...fadeUp}>
            The work sits between technical evaluation and institutional design: not only whether a
            model scores well, but whether the evaluation process itself can be trusted.
          </motion.p>
        </div>
        <motion.div className="edResearchHead" {...fadeUp}>
          <p className="edStoryKicker">INDEPENDENT · 2026 – PRESENT</p>
          <h3 className="edResearchTitle">AI Evaluation Integrity</h3>
        </motion.div>
      </section>

      <PhotoBand
        image="./images/sf-skyline.png"
        quote="I didn't come to California for an easy path."
        caption="SAN FRANCISCO · BLUE HOUR"
      />

      <MasteryBoard />

      <section className="edSection edProjectsSection" id="work">
        <motion.div className="edSectionIntro" {...fadeUp}>
          <SectionLabel>04 · Work</SectionLabel>
          <h2 className="edTitle">
            In <span className="edGold">motion</span>
          </h2>
          <p className="edSectionLead edProjectsLead">
            Founding, evaluation, GTM, campus ops — the work that keeps the orbit spinning.
          </p>
        </motion.div>
        <ProjectDeck items={projects} />
      </section>

      <SkillsBoard />

      <PhotoBand
        image="./images/sf-bay-bridge-night.png"
        quote="Ship systems people can trust when it matters."
        caption="BAY BRIDGE · SAN FRANCISCO"
      />

      <section className="edSection" id="contact">
        <motion.div {...fadeUp}>
          <SectionLabel>05 · Contact</SectionLabel>
          <h2 className="edTitle">
            Let&apos;s <span className="edGold">talk</span>
          </h2>
          <p className="edSectionLead">
            AI evaluation, GTM, founding, student-led systems — reach out.
          </p>
        </motion.div>
        <motion.div className="edContactRow" {...fadeUp}>
          <a className="edContactLink" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a
            className="edContactLink"
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
          <button type="button" className="edContactLink edContactGalaxy" onClick={onEnterGalaxy}>
            Enter Galaxy ↗
          </button>
        </motion.div>
      </section>

      <motion.footer className="edFooter" {...fadeUp}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <button type="button" className="edFooterOrbit" onClick={onEnterGalaxy}>
          Enter Galaxy ↗
        </button>
      </motion.footer>
    </div>
  );
}
