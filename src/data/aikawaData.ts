import { profile } from './aadiData';

export { profile };

export type OrbitCard = {
  id: string;
  title: string;
  body: string;
  meta?: string;
  image?: string;
  imageFit?: 'cover' | 'contain';
  imageBg?: string;
};

export type OrbitCategory = {
  id: string;
  label: string;
  short: string;
  image: string;
  imageFit: 'cover' | 'contain';
  imageBg?: string;
  lead: string;
  fragmentTint: string;
  enterGalaxy?: boolean;
  cards: OrbitCard[];
};

/** Home cylinder categories — labels sit on the curved band like Work / Journey. */
export const orbitCategories: OrbitCategory[] = [
  {
    id: 'jobs',
    label: 'Jobs',
    short: 'Jobs',
    image: './images/mangusta-logo.png',
    imageFit: 'contain',
    imageBg: '#0a0a0a',
    lead: 'Roles that built judgment under real constraint.',
    fragmentTint: '#c4b5a0',
    cards: [
      {
        id: 'mangusta',
        title: 'Mangusta Capital',
        body: 'Deal sourcing — market, team, and traction signals for early-stage startups.',
        meta: 'Venture',
        image: './images/mangusta-logo.png',
        imageFit: 'contain',
        imageBg: '#0a0a0a',
      },
      {
        id: 'sales',
        title: 'Personal Sales',
        body: 'High-pressure sales work that taught close rates and narrative under fire.',
        meta: '$15k+',
        image: './images/aadi-portrait.png',
      },
      {
        id: 'gtmJob',
        title: 'Go-To-Market Operator',
        body: 'Corgi go-to-market — learning how markets actually buy.',
        meta: 'Operator',
        image: './images/corgi-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    short: 'Projects',
    image: './images/stealth-logo.png',
    imageFit: 'contain',
    imageBg: '#111',
    lead: 'Founding, evaluation integrity, and systems people can trust.',
    fragmentTint: '#a8b8d8',
    cards: [
      {
        id: 'stealth',
        title: 'Stealth AI Founder',
        body: 'Shipping a stealth AI product with active investor conversations.',
        meta: 'Founding',
        image: './images/stealth-logo.png',
        imageFit: 'contain',
        imageBg: '#111',
      },
      {
        id: 'eval',
        title: 'AI Evaluation Integrity',
        body: 'Research on gatekeeper systems that pass benchmarks while hiding real failures.',
        meta: 'Research',
        image: './images/openai-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'yc',
        title: 'YC Startup School 2026',
        body: 'Chase Center, San Francisco — building in public with the YC cohort.',
        meta: 'Jul 25–26 · SF',
        image: './images/yc-ticket-hero.png',
      },
    ],
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    short: 'Galaxy',
    image: './images/galaxy-gate.png',
    imageFit: 'cover',
    imageBg: '#05070f',
    lead: 'Interactive 3D orbit of Aadi’s path — click planets for the full story.',
    fragmentTint: '#d4a574',
    enterGalaxy: true,
    cards: [
      {
        id: 'orbit',
        title: 'Enter the Orbit',
        body: 'Fly through decisions, DVC, research, and work as a living solar system.',
        meta: 'Interactive',
        image: './images/hero-nebula.png',
      },
      {
        id: 'planets',
        title: 'Every Chapter a Planet',
        body: 'Georgia Tech decision, campus, Corgi, OpenAI track, and more.',
        meta: '3D',
        image: './images/galaxy-ref.png',
      },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    short: 'Work',
    image: './images/corgi-lockup.png',
    imageFit: 'contain',
    imageBg: '#ffffff',
    lead: 'Go-to-market at Corgi. Frontier evaluation at OpenAI.',
    fragmentTint: '#e8c4b0',
    cards: [
      {
        id: 'corgi',
        title: 'Go-To-Market @ Corgi',
        body: 'Growth, positioning, and go-to-market inside a Bay Area venture-backed company.',
        meta: 'Go-To-Market',
        image: './images/corgi-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'openai',
        title: 'OpenAI Eval Track',
        body: 'Selected into a specialized evaluation track after four-step screening.',
        meta: 'Frontier',
        image: './images/openai-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
    ],
  },
  {
    id: 'life',
    label: 'Life',
    short: 'Life',
    image: './images/dvc-campus.png',
    imageFit: 'cover',
    lead: 'Turned down Georgia Tech. Chose Diablo Valley College on purpose.',
    fragmentTint: '#9bb8a8',
    cards: [
      {
        id: 'reject',
        title: 'Turned Down Georgia Tech',
        body: 'Ownership and shipping speed over a name on a hoodie.',
        meta: 'The Decision',
        image: './images/forsyth.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'dvc',
        title: 'Diablo Valley College',
        body: 'Data Science + Economics from Pleasant Hill — proof over prestige.',
        meta: 'DVC',
        image: './images/dvc-campus.png',
      },
      {
        id: 'ags',
        title: 'Alpha Gamma Sigma',
        body: 'California Community College Honors Society — Gamma Psi chapter.',
        meta: 'Campus',
        image: './images/ags-booth.png',
      },
    ],
  },
];
