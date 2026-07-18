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
  /** Optional outbound link rendered on the card (e.g. a published paper). */
  href?: string;
  linkLabel?: string;
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
    image: './images/aadi-suit.jpg',
    imageFit: 'cover',
    lead: 'Roles that built judgment under real constraint.',
    fragmentTint: '#c4b5a0',
    cards: [
      {
        id: 'gtmJob',
        title: 'Go-To-Market @ Corgi',
        body: 'Built a custom CRM and a stack of workflow improvements and automations — and closed $150M in annual revenue.',
        meta: '$150M ARR',
        image: './images/corgi-office.jpg',
      },
      {
        id: 'rightway',
        title: 'RightWayAI',
        body: 'Marketing intern at an a16z-backed AI company — adapting positioning, tone, and channel strategy for the US market, owning content production end to end.',
        meta: 'a16z-backed',
        image: './images/rightway.png',
        imageFit: 'contain',
        imageBg: '#0d0d12',
      },
      {
        id: 'mangusta',
        title: 'Mangusta Capital',
        body: 'Venture externship — sourcing deals, building investment theses, and evaluating market, team, and traction signals.',
        meta: 'Venture',
        image: './images/mangusta-logo.png',
        imageFit: 'contain',
        imageBg: '#0a0a0a',
      },
      {
        id: 'sales',
        title: 'Personal Sales',
        body: 'Generated $15,000+ in personal sales in the first 30 days — top 35% of regional representatives.',
        meta: '$15k in 30 days',
        image: './images/aadi-portrait.png',
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
        body: 'Applying to Y Combinator. That is all we can say for now.',
        meta: 'Stealth',
        image: './images/stealth-logo.png',
        imageFit: 'contain',
        imageBg: '#111',
      },
      {
        id: 'eval',
        title: 'AI Evaluation Integrity',
        body: 'Core result: once a system irreversibly discards data, its error rate becomes unidentifiable from what survives — and the hidden loss is recoverable, across satellite triage and LLM routing. Targeting NeurIPS, ICLR, ICML.',
        meta: 'Research',
        image: './images/openai-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
        // TODO: paste the published paper URL below to surface the link.
        // href: 'https://…',
        linkLabel: 'Read the paper ↗',
      },
      {
        id: 'freelance',
        title: 'Freelance Developer',
        body: 'Two production React/Firebase sites shipped for paying clients — a restaurant and a photography portfolio — UX through deployment and maintenance.',
        meta: 'Client Work',
        image: './images/berkeley-project.png',
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
    label: 'Space Mode',
    short: 'Space',
    image: './images/galaxy-gate.png',
    imageFit: 'cover',
    imageBg: '#05070f',
    lead: 'A hidden wormhole in the portfolio: fly through a real, fully explorable 3D galaxy where every planet is a chapter of the story. Enter if you dare.',
    fragmentTint: '#d4a574',
    enterGalaxy: true,
    cards: [
      {
        id: 'orbit',
        title: 'Enter the Wormhole',
        body: 'A real-time 3D solar system you can fly through — drag to look around, scroll to warp, click a glowing planet and it tells you its chapter of the story.',
        meta: 'Playable',
        image: './images/hero-nebula.png',
      },
      {
        id: 'planets',
        title: 'Every Planet Is a Chapter',
        body: 'The Georgia Tech decision, the campus, Corgi, the OpenAI track — each one orbiting a sun with the whole story at its core.',
        meta: 'Explore',
        image: './images/galaxy-ref.png',
      },
    ],
  },
  {
    id: 'work',
    label: 'Work',
    short: 'Work',
    image: './images/corgi-office-2.jpg',
    imageFit: 'cover',
    lead: 'Go-to-market at Corgi. Frontier evaluation at OpenAI.',
    fragmentTint: '#e8c4b0',
    cards: [
      {
        id: 'corgi',
        title: 'Go-To-Market @ Corgi',
        body: 'Created a custom CRM and a stack of workflow improvements and automations — closed $150M in annual revenue.',
        meta: '$150M ARR',
        image: './images/corgi-lockup.png',
        imageFit: 'contain',
        imageBg: '#fff',
      },
      {
        id: 'openai',
        title: 'OpenAI Eval Track',
        body: 'Selected into a 40-person frontier evaluation team after a four-step screening.',
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
        body: 'Data Science + Economics double major at a 4.0 — proof over prestige, transferring 2027.',
        meta: '4.0 GPA',
        image: './images/dvc-campus.png',
      },
      {
        id: 'ags',
        title: 'Alpha Gamma Sigma',
        body: 'California Community College Honor Society — Gamma Psi chapter, where all are welcome.',
        meta: 'Campus',
        image: './images/ags-table.jpg',
      },
      {
        id: 'offduty',
        title: 'Between Board Meetings',
        body: 'Snowboarding, national parks, and long drives — the reset button.',
        meta: 'Off Duty',
        image: './images/aadi-snowboard.jpg',
      },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    short: 'Lead',
    image: './images/ags-table.jpg',
    imageFit: 'cover',
    lead: 'Treasurer for 300,000+ students. Finance across 100+ campus orgs.',
    fragmentTint: '#d8b48a',
    cards: [
      {
        id: 'sscc',
        title: 'SSCCC Region III Treasurer',
        body: 'Won a contested election speaking before 1,000+ delegates — representing 300,000+ Bay Area community-college students across all 15 colleges in the region.',
        meta: 'Student Senate',
        image: './images/asdvc-speaking.jpg',
      },
      {
        id: 'icc',
        title: 'ICC Commissioner of Finance',
        body: 'Oversee funding requests and disbursement across 100+ DVC student organizations, plus a district committee overseeing $1M+ in student funds.',
        meta: '$1M+ Oversight',
        imageBg: '#ece9e3',
      },
      {
        id: 'agsPres',
        title: 'President · Alpha Gamma Sigma',
        body: 'Rebuilt a drifting chapter into a working honor society — a Notion + Slack operating system, a 100+ member roster, and primary host of the statewide AGS Convention, Spring 2027.',
        meta: 'President',
        image: './images/ags-table.jpg',
      },
      {
        id: 'olympics',
        title: 'Club Olympics',
        body: 'Planned and ran the campus-wide Club Olympics — 20+ student organizations, 200+ participants, logistics end to end.',
        meta: '200+ Participants',
        image: './images/ags-booth.png',
      },
      {
        id: 'rotary',
        title: 'Rotary Treasurer · District 5160',
        body: 'Building a community-college scholarship fund from scratch — designing the endowment structure so future students have a funding path.',
        meta: 'Scholarship Fund',
        image: './images/aadi-service.jpg',
      },
    ],
  },
  {
    id: 'credentials',
    label: 'Credentials',
    short: 'Creds',
    image: './images/sf-skyline.png',
    imageFit: 'cover',
    lead: 'Licenses, safety coursework, and certificates that back the work.',
    fragmentTint: '#c9b8e8',
    cards: [
      {
        id: 'bluedot',
        title: 'BlueDot AI Safety Fundamentals',
        body: 'Alignment and governance coursework from BlueDot Impact.',
        meta: 'AI Safety',
        imageBg: '#eef2fb',
      },
      {
        id: 'pnc',
        title: 'P&C Licensed · AB 1–4',
        body: 'Property & Casualty insurance licensed — the substrate under the Corgi market.',
        meta: 'Licensed',
        imageBg: '#fbf3e8',
      },
      {
        id: 'ethics',
        title: 'Public Ethics Education',
        body: 'Certified public-ethics coursework.',
        meta: 'Ethics',
        imageBg: '#eef7ef',
      },
      {
        id: 'aiCerts',
        title: 'Anthropic & Google Certificates',
        body: 'A stack of Claude and Google AI certificates across building, prompting, and tooling.',
        meta: 'AI Tooling',
        imageBg: '#f6eef8',
      },
    ],
  },
];
