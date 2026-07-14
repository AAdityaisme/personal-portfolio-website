import { galaxyNodes, profile } from './aadiData';

export { profile };

export type ProjectCard = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tags: string[];
  image?: string;
  imageTone?: 'photo' | 'logoLight' | 'logoDark';
  links: { label: string; href: string }[];
};

/** Story stops for the light editorial page (no planet framing). */
export const storyStops = galaxyNodes.map((n) => ({
  id: n.id,
  kicker: n.subtitle.replace(/ · .*$/, ''),
  title: n.title,
  date: n.date,
  body: n.body,
  bullets: n.bullets,
  impact: n.impact,
  logo: n.logo,
  image: n.image,
  links: n.links ?? [],
}));

export const projects: ProjectCard[] = [
  {
    id: 'startup',
    kicker: 'STEALTH · YC STARTUP SCHOOL',
    title: 'Founder & Lead Engineer',
    body: 'Stealth AI product with active investor conversations, and YC Startup School in San Francisco.',
    tags: ['AI Product', 'Founder', 'YC SS 2026'],
    image: './images/yc-ticket.png',
    imageTone: 'logoLight',
    links: [
      { label: 'YC Startup School ↗', href: 'https://www.startupschool.org/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
  {
    id: 'research',
    kicker: 'OPENAI · EVALUATION',
    title: 'AI Evaluation Integrity',
    body: 'How gatekeeper systems pass benchmarks while hiding the errors that matter in the real world — work connected to OpenAI evaluation.',
    tags: ['OpenAI', 'LLM Eval', 'Governance'],
    image: './images/openai-logo.png',
    imageTone: 'logoLight',
    links: [
      { label: 'OpenAI ↗', href: 'https://openai.com/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
  {
    id: 'corgi',
    kicker: 'GO-TO-MARKET · VENTURE-BACKED',
    title: 'Go-To-Market @ Corgi',
    body: 'Growth, positioning, and go-to-market (GTM) for a venture-backed Bay Area startup.',
    tags: ['Go-To-Market', 'Positioning', 'Growth'],
    image: './images/corgi-logo.png',
    imageTone: 'logoLight',
    links: [
      { label: 'Email Aadi ↗', href: `mailto:${profile.email}` },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
  {
    id: 'openai',
    kicker: 'FRONTIER EVALUATION',
    title: 'AI Evaluation Specialist',
    body: 'Selected into a specialized evaluation track after four-step screening — 40-person frontier team.',
    tags: ['OpenAI', 'Evaluation', 'Frontier'],
    image: './images/openai-logo.png',
    imageTone: 'logoLight',
    links: [
      { label: 'OpenAI ↗', href: 'https://openai.com/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
  {
    id: 'venture',
    kicker: 'DEAL SOURCING',
    title: 'Mangusta Capital',
    body: 'Sources early-stage startups and evaluates market, team, and traction signals.',
    tags: ['Venture', 'Diligence', 'Thesis'],
    image: './images/mangusta-logo.png',
    imageTone: 'logoDark',
    links: [{ label: 'LinkedIn ↗', href: profile.linkedin }],
  },
  {
    id: 'finance',
    kicker: 'ALPHA GAMMA SIGMA',
    title: 'President · Alpha Gamma Sigma',
    body: 'President of Alpha Gamma Sigma Honor Society — leading campus honors, finance ops, and scholarship infrastructure across student organizations.',
    tags: ['AGS', 'President', 'Campus Leadership'],
    image: './images/ags-seal.png',
    imageTone: 'logoLight',
    links: [
      { label: 'AGS ↗', href: 'https://www.ags.org/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
];
