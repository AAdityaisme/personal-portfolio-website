import { galaxyNodes, profile } from './aadiData';

export { profile };

export type ProjectCard = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  tags: string[];
  image?: string;
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
    links: [
      { label: 'YC Startup School ↗', href: 'https://www.startupschool.org/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
  {
    id: 'research',
    kicker: 'INDEPENDENT RESEARCH',
    title: 'AI Evaluation Integrity',
    body: 'How gatekeeper systems pass benchmarks while hiding the errors that matter in the real world.',
    tags: ['LLM Eval', 'Governance', 'Routing'],
    links: [{ label: 'LinkedIn ↗', href: profile.linkedin }],
  },
  {
    id: 'corgi',
    kicker: 'GTM · VENTURE-BACKED',
    title: 'GTM @ Corgi',
    body: 'Growth, positioning, and go-to-market for a venture-backed Bay Area startup.',
    tags: ['GTM', 'Positioning', 'Growth'],
    image: './images/corgi.png',
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
    image: './images/openai-mark.png',
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
    links: [{ label: 'LinkedIn ↗', href: profile.linkedin }],
  },
  {
    id: 'finance',
    kicker: 'CAMPUS FINANCE',
    title: '100+ Student Organizations',
    body: 'Funding requests, grants, and scholarship infrastructure across ICC, Rotary, and AGS.',
    tags: ['ICC', 'Rotary', 'AGS'],
    image: './images/ags.png',
    links: [
      { label: 'AGS ↗', href: 'https://www.ags.org/' },
      { label: 'LinkedIn ↗', href: profile.linkedin },
    ],
  },
];
