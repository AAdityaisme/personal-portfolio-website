import { motion } from 'framer-motion';
import { galaxyNodes, profile } from '../data/aadiData';
import { stackItems } from './StackIcons';

function SectionLabel({ children }: { children: string }) {
  return <p className="mEdLabel glassText">{children}</p>;
}

function StoryCard({ node }: { node: (typeof galaxyNodes)[number] }) {
  return (
    <motion.article
      className="mEdCard"
      style={{ ['--accent' as string]: node.accent }}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mEdCardTop">
        {node.logo ? (
          <img
            src={node.logo}
            alt=""
            className={`mEdLogo ${node.id === 'corgi' ? 'isPhoto' : ''} ${
              node.id === 'finance' ? 'isAgs' : ''
            }`}
          />
        ) : (
          <span className="mEdDot" style={{ background: node.accent }} />
        )}
        <div>
          <p className="mEdKicker glassText">{node.subtitle}</p>
          <h3 className="mEdTitle glassText">{node.title}</h3>
        </div>
      </div>
      {node.date ? <p className="mEdDate glassText">{node.date}</p> : null}
      <p className="mEdBody glassText">{node.body}</p>
      <ul className="mEdBullets">
        {node.bullets.map((b) => (
          <li key={b} className="glassText">
            {b}
          </li>
        ))}
      </ul>
      {node.impact ? <p className="mEdImpact">{node.impact}</p> : null}
      {node.image && node.mediaPlacement === 'top' ? (
        <div
          className={`mEdMedia ${node.id === 'startup' ? 'isTicket' : ''} ${
            node.id === 'corgi' ? 'isCorgi' : ''
          }`}
        >
          <img src={node.image} alt="" loading="lazy" />
        </div>
      ) : null}
      {node.links?.length ? (
        <div className="mEdLinks">
          {node.links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="mEdLink"
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

export function MobileTimeline() {
  return (
    <div className="mEdPage">
      <div className="mEdStarfield" aria-hidden="true" />

      <header className="mEdHero">
        <p className="mEdEyebrow glassText">GTM · AI EVALUATION · FOUNDER</p>
        <h1 className="mEdName glassText">{profile.name}</h1>
        <p className="mEdHeadline glassText">{profile.headline}</p>
        <p className="mEdTagline glassText">{profile.tagline}</p>
        <div className="mEdHeroGrid">
          <motion.img
            className="mEdPortrait"
            src={profile.portrait}
            alt="Aadi Sharma"
            width={240}
            height={300}
            whileHover={{ scale: 1.04, rotate: -1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          />
          <div className="mEdHeroMeta">
            <p className="glassText">San Francisco Bay Area</p>
            <p className="glassText">DVC · Data Science + Economics · 4.0</p>
            <div className="mEdActions">
              <a className="btnPrimary" href="#m-orbit">
                See the path
              </a>
              <a className="btnGhost" href={`mailto:${profile.email}`}>
                Contact Aadi
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="mEdSection" id="m-orbit">
        <SectionLabel>01 — Orbit</SectionLabel>
        <h2 className="mEdSectionTitle glassText">Every stop in the system.</h2>
        <div className="mEdScatter">
          {galaxyNodes.map((node) => (
            <StoryCard key={node.id} node={node} />
          ))}
        </div>
      </section>

      <section className="mEdSection mEdContact">
        <SectionLabel>02 — Contact</SectionLabel>
        <h2 className="mEdSectionTitle glassText">Get in touch</h2>
        <p className="mEdBody glassText">
          Building in AI, evaluation, GTM, or student-led systems? Reach out.
        </p>
        <div className="mEdContactLinks">
          <a className="mEdLinkBig" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <a
            className="mEdLinkBig"
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
      </section>

      <section className="mEdSection mEdStackSection">
        <SectionLabel>03 — Stack</SectionLabel>
        <h2 className="mEdSectionTitle glassText">Tools in orbit</h2>
        <ul className="mEdStack">
          {stackItems.map(({ label, Icon, href, color }) => {
            const inner = (
              <>
                <Icon className="mEdStackIcon" color={color} />
                <span className="glassText">{label}</span>
              </>
            );
            return (
              <motion.li
                key={label}
                whileHover={{ y: -5, scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              >
                {href ? (
                  <a href={href} className="mEdStackItem isLink">
                    {inner}
                  </a>
                ) : (
                  <div className="mEdStackItem">{inner}</div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
