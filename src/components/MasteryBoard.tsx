import { useState } from 'react';
import { motion } from 'framer-motion';
import { masteryIconUrl, masteryNodes, type MasteryNode } from '../data/masteryData';

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.15 as const },
  transition: { duration: 0.65, ease: easeOut },
};

const rows: MasteryNode[][] = [
  masteryNodes.filter((n) =>
    ['claude', 'chatgpt', 'grok', 'codex', 'copilot'].includes(n.id)
  ),
  masteryNodes.filter((n) =>
    ['goose', 'opencode', 'openclaw', 'bob'].includes(n.id)
  ),
  masteryNodes.filter((n) =>
    ['github', 'xcode', 'androidstudio', 'applestudio', 'n8n'].includes(n.id)
  ),
  masteryNodes.filter((n) =>
    ['supabase', 'granola', 'notion', 'canva'].includes(n.id)
  ),
];

function OpenAiMark({ color }: { color: string }) {
  return (
    <svg className="masteryLeafIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={color}
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.181a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .516 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.787A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.68zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
      />
    </svg>
  );
}

function MasteryLeaf({
  node,
  delay = 0,
}: {
  node: MasteryNode;
  delay?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = node.color ?? '#d4af37';
  const useOpenAi = node.mark === 'openai';
  const useLetter = node.mark === 'letter' || imgFailed || (!node.icon && !useOpenAi);

  return (
    <motion.div
      className="masteryLeaf"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      whileHover={{ y: -5, scale: 1.07 }}
      aria-label={node.label}
    >
      {useOpenAi ? (
        <OpenAiMark color={color} />
      ) : useLetter ? (
        <span className="masteryLeafFallback" style={{ color }}>
          {node.label.slice(0, 1)}
        </span>
      ) : (
        <img
          src={masteryIconUrl(node.icon!, color)}
          alt=""
          className="masteryLeafIcon"
          width={32}
          height={32}
          loading="lazy"
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      )}
      <span className="masteryLeafLabel">{node.label}</span>
    </motion.div>
  );
}

export function MasteryBoard() {
  return (
    <section className="edSection edMastery" id="mastery">
      <motion.div {...fadeUp}>
        <p className="edLabel">03 · Mastery</p>
        <h2 className="edTitle">
          Mastery in all <span className="edGold">agentic AIs</span>
        </h2>
        <p className="edSectionLead">
          Frontier models, coding agents, and the tools around them — hover a leaf. Nothing here is a
          link.
        </p>
      </motion.div>

      <div className="masteryTree">
        {rows.map((row, ri) => (
          <div key={`row-${ri}`}>
            {ri > 0 ? (
              <div
                className={`masteryBranch ${ri === 1 ? '' : 'masteryBranchWide'}`}
                aria-hidden="true"
              />
            ) : null}
            <div className="masteryRow">
              {row.map((node, i) => (
                <MasteryLeaf key={node.id} node={node} delay={Math.min(ri * 0.06 + i * 0.03, 0.35)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
