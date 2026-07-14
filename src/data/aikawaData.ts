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
  cards: OrbitCard[];
};

export const orbitCategories: OrbitCategory[] = [
  {
    id: 'passion',
    label: 'Passion',
    short: 'Passion',
    image: './images/yc-ticket-hero.png',
    imageFit: 'cover',
    lead: 'Founding, Startup School, ownership speed.',
    cards: [
      {
        id: 'yc',
        title: 'YC Startup School 2026',
        body: 'Chase Center, San Francisco — building in public with the YC cohort.',
        meta: 'Jul 25–26 · SF',
        image: './images/yc-ticket-hero.png',
      },
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
        id: 'trust',
        title: 'Trust Layer for AI',
        body: 'Building systems people can trust past the leaderboard.',
        meta: 'Thesis',
        image: './images/aadi-hero.png',
      },
    ],
  },
  {
    id: 'coCurriculars',
    label: 'Co-curriculars',
    short: 'Campus',
    image: './images/ags-booth.png',
    imageFit: 'cover',
    lead: 'Honors society, student finance, campus leadership.',
    cards: [
      {
        id: 'ags',
        title: 'Alpha Gamma Sigma',
        body: 'California Community College Honors Society — Gamma Psi chapter.',
        meta: 'ΑΓΣ',
        image: './images/ags-seal.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'booth',
        title: 'Recruitment & Presence',
        body: 'Showing up for the booth, the brand, and the people who join.',
        meta: 'AGS',
        image: './images/ags-booth.png',
      },
      {
        id: 'icc',
        title: 'ICC Finance Ops',
        body: 'Funding requests and scholarship infrastructure across campus orgs.',
        meta: '100+ orgs',
        image: './images/ags.png',
      },
      {
        id: 'rotary',
        title: 'Rotary',
        body: 'Community leadership and campus service alongside academic work.',
        meta: 'Service',
        image: './images/dvc-campus.png',
      },
    ],
  },
  {
    id: 'corgiOpenai',
    label: 'Corgi & OpenAI',
    short: 'Work',
    image: './images/corgi-lockup.png',
    imageFit: 'contain',
    imageBg: '#ffffff',
    lead: 'Go-to-market at Corgi. Frontier evaluation at OpenAI.',
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
      {
        id: 'positioning',
        title: 'Positioning Systems',
        body: 'Operator work that turns product truth into market narrative.',
        meta: 'Growth',
        image: './images/corgi-wordmark.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'evalTeam',
        title: '40-Person Frontier Team',
        body: 'Evaluation specialist work where integrity beats vanity metrics.',
        meta: 'OpenAI',
        image: './images/openai-wordmark.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    short: 'Jobs',
    image: './images/mangusta-logo.png',
    imageFit: 'contain',
    imageBg: '#0a0a0a',
    lead: 'Roles that built judgment under real constraint.',
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
      {
        id: 'financeJob',
        title: 'Campus Finance',
        body: 'Grants, budgets, and scholarship systems across student organizations.',
        meta: 'Ops',
        image: './images/ags-seal.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    short: 'Life',
    image: './images/dvc-campus.png',
    imageFit: 'cover',
    lead: 'Turned down Georgia Tech. Chose Diablo Valley College on purpose.',
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
        id: 'gpa',
        title: '4.0 GPA',
        body: 'Double major execution while founding, researching, and leading on campus.',
        meta: 'Academics',
        image: './images/dvc.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'bay',
        title: 'Bay Area',
        body: 'Building from the Bay — SF energy, DVC base, startup gravity.',
        meta: 'Life',
        image: './images/sf-skyline.png',
      },
    ],
  },
];
