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
        body: 'Sources early-stage startups and evaluates market, team, and traction signals for a venture fund. Reading hundreds of decks taught him what separates a narrative from a business — and how investors actually decide.',
        meta: 'Venture',
      },
      {
        id: 'sales',
        title: 'Personal Sales',
        body: 'Over $15k closed through structured demos, outbound, and live objection handling. High-pressure sales work that taught close rates, pacing, and how to hold a narrative under fire.',
        meta: '$15k+ closed',
      },
      {
        id: 'gtmJob',
        title: 'Go-To-Market Operator',
        body: 'Runs go-to-market motions at Corgi — positioning, growth experiments, and learning how markets actually buy instead of how founders wish they would.',
        meta: 'Operator',
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
        body: 'Shipping a stealth AI product with active investor conversations. Building the trust layer for AI — systems people can verify instead of merely believe.',
        meta: 'Founding',
      },
      {
        id: 'eval',
        title: 'AI Evaluation Integrity',
        body: 'Research on gatekeeper systems that pass benchmarks while hiding the errors that matter. If evaluation can be gamed, every downstream decision inherits the lie — this work is about making that impossible.',
        meta: 'Research',
      },
      {
        id: 'yc',
        title: 'YC Startup School 2026',
        body: 'Chase Center, San Francisco — building in public with the YC cohort, July 25–26. Two days of founders, feedback loops, and pressure-testing the stealth product against real operators.',
        meta: 'Jul 25–26 · SF',
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
        body: 'Growth, positioning, and go-to-market inside a venture-backed Bay Area company. Owning experiments end to end: the hypothesis, the outbound, the numbers, and what ships next because of them.',
        meta: 'Go-To-Market',
      },
      {
        id: 'openai',
        title: 'OpenAI Eval Track',
        body: 'Selected into a specialized evaluation track after a four-step screening — a 40-person frontier team probing where model behavior breaks and how to measure it honestly.',
        meta: 'Frontier',
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
        body: 'Chose ownership and shipping speed over a name on a hoodie. The decision that defines the rest of the story: proof and momentum over the brand-name route.',
        meta: 'The Decision',
      },
      {
        id: 'dvc',
        title: 'Diablo Valley College',
        body: 'Data Science and Economics from Pleasant Hill at a 4.0 — running AI evaluation research, startup execution, and honors leadership from a community college campus, on purpose.',
        meta: 'DVC',
      },
      {
        id: 'ags',
        title: 'Alpha Gamma Sigma — President',
        body: 'President of the Gamma Psi chapter of California’s community college honor society — leading campus honors, finance operations, and scholarship infrastructure.',
        meta: 'Campus Leadership',
      },
    ],
  },
];
