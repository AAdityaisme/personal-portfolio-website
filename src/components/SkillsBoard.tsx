import { motion } from 'framer-motion';
import { skillGroups, skillIconUrl } from '../data/skillsData';

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SkillsBoard() {
  return (
    <section className="edSection edSkills" id="skills">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.65, ease: easeOut }}
      >
        <p className="edLabel">Skills</p>
        <h2 className="edTitle">
          What I <span className="edGold">can do</span>
        </h2>
        <p className="edSectionLead">
          Languages, AI systems, web/cloud tooling, and the GTM work I ship with.
        </p>
      </motion.div>

      <div className="skillBoard">
        {skillGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            className="skillGroup"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.55, delay: Math.min(gi * 0.06, 0.24), ease: easeOut }}
          >
            <h3 className="skillGroupTitle">{group.title}</h3>
            <ul className="skillTags">
              {group.tags.map((tag) => (
                <li key={tag.label} className="skillTag">
                  {tag.icon ? (
                    <img
                      src={skillIconUrl(tag.icon, tag.color)}
                      alt=""
                      className="skillTagIcon"
                      width={18}
                      height={18}
                      loading="lazy"
                    />
                  ) : null}
                  <span>{tag.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
