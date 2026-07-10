export type CelestialKind = 'planet' | 'station' | 'earth';

export type NodeLink = {
  label: string;
  href: string;
};

export type GalaxyNode = {
  id: string;
  index: number;
  kind: CelestialKind;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  date?: string;
  impact?: string;
  image?: string;
  logo?: string;
  mediaPlacement?: 'top' | 'side' | 'none';
  bubbleSide: 'left' | 'right';
  accent: string;
  links?: NodeLink[];
  orbitRadius: number;
  size: number;
  orbitSpeed: number;
  hasRing?: boolean;
  model: string;
  meteorHighlight?: string;
};

export const profile = {
  name: 'Aadi Sharma',
  headline: 'Building the trust layer for AI.',
  tagline: 'Turned down Georgia Tech. Built his own orbit from DVC.',
  location: 'San Francisco Bay Area',
  email: 'aadityasharma.ca@gmail.com',
  linkedin: 'https://www.linkedin.com/in/aadi-sharma-founder',
  portrait: './images/aadi-portrait.png',
};

/** Compact orbits around the sun — every body stays in frame and clickable. */
export const galaxyNodes: GalaxyNode[] = [
  {
    id: 'decision',
    index: 0,
    kind: 'planet',
    title: 'Turned Down Georgia Tech',
    subtitle: 'Origin Planet · The Decision',
    body: 'Chose DVC on purpose — proof and momentum over the name-brand route.',
    bullets: [
      'Declined Georgia Tech for ownership speed',
      'Bet on execution from community college',
      'Set the orbit for everything after',
    ],
    date: '2025',
    impact: 'Path chosen with intent',
    logo: './images/forsyth.png',
    mediaPlacement: 'side',
    bubbleSide: 'left',
    accent: '#f0d9a0',
    orbitRadius: 3.6,
    size: 0.72,
    orbitSpeed: 0.085,
    model: './models/planet-serendip.glb',
    meteorHighlight: 'Turned down Georgia Tech',
    links: [{ label: 'LinkedIn', href: profile.linkedin }],
  },
  {
    id: 'dvc',
    index: 1,
    kind: 'planet',
    title: 'DVC · Data Science + Economics',
    subtitle: 'DVC Planet · The Base',
    body: 'Building from Diablo Valley College — AI evaluation, economics, and startup execution at a 4.0.',
    bullets: [
      '4.0 GPA · Data Science + Economics',
      'AI evaluation and systems thinking',
      'Campus leadership while shipping',
    ],
    date: 'Aug 2025 – May 2027',
    impact: '4.0 · Double major',
    logo: './images/dvc-mark.png',
    image: './images/dvc-mark.png',
    mediaPlacement: 'side',
    bubbleSide: 'left',
    accent: '#3d8f6a',
    orbitRadius: 4.4,
    size: 0.95,
    orbitSpeed: 0.12,
    hasRing: true,
    model: './models/planet-stylized.glb',
    meteorHighlight: '4.0 GPA at DVC',
    links: [
      { label: 'Diablo Valley College', href: 'https://www.dvc.edu/' },
      { label: 'LinkedIn', href: profile.linkedin },
    ],
  },
  {
    id: 'research',
    index: 2,
    kind: 'planet',
    title: 'AI Evaluation Integrity',
    subtitle: 'Research Planet · The Trust Layer',
    body: 'Researching how gatekeeper systems pass benchmarks while hiding errors that matter.',
    bullets: [
      'Satellite triage and LLM routing failures',
      'Selection bias in evaluation pipelines',
      'Governance that catches silent errors',
    ],
    date: '2026 – Present',
    impact: 'Independent research',
    mediaPlacement: 'none',
    bubbleSide: 'right',
    accent: '#8aa4ff',
    orbitRadius: 5.2,
    size: 0.88,
    orbitSpeed: 0.095,
    model: './models/planet-alien.glb',
    links: [{ label: 'LinkedIn', href: profile.linkedin }],
  },
  {
    id: 'startup',
    index: 3,
    kind: 'planet',
    title: 'Founder & Lead Engineer',
    subtitle: 'Startup Planet · The Build',
    body: 'Stealth AI product, investor conversations, and YC Startup School in San Francisco.',
    bullets: [
      'YC Startup School · July 25–26 · Chase Center',
      'Stealth AI product in motion',
      'Active investor conversations',
    ],
    date: 'May 2026 – Present',
    impact: 'YC Startup School 2026',
    logo: './images/stealth-mark.png',
    image: './images/yc-ticket.png',
    mediaPlacement: 'top',
    bubbleSide: 'left',
    accent: '#e8a04a',
    orbitRadius: 6.1,
    size: 0.9,
    orbitSpeed: 0.08,
    hasRing: true,
    model: './models/planet-fire.glb',
    meteorHighlight: 'YC Startup School 2026',
    links: [
      { label: 'YC Startup School', href: 'https://www.startupschool.org/' },
      { label: 'LinkedIn', href: profile.linkedin },
    ],
  },
  {
    id: 'corgi',
    index: 4,
    kind: 'station',
    title: 'GTM @ Corgi',
    subtitle: 'GTM Station · The Market',
    body: 'Growth, positioning, and go-to-market for a venture-backed Bay Area startup.',
    bullets: [
      'Venture-backed GTM seat',
      'Positioning and growth systems',
      'Bay Area operator work',
    ],
    date: 'June 2026 – Present',
    impact: 'Venture-backed GTM',
    logo: './images/corgi.png',
    image: './images/corgi.png',
    mediaPlacement: 'top',
    bubbleSide: 'right',
    accent: '#d4a574',
    orbitRadius: 7.0,
    size: 0.78,
    orbitSpeed: 0.11,
    model: './models/spaceship.glb',
    links: [
      { label: 'Email Aadi', href: `mailto:${profile.email}` },
      { label: 'LinkedIn', href: profile.linkedin },
    ],
  },
  {
    id: 'openai',
    index: 5,
    kind: 'planet',
    title: 'AI Evaluation Specialist',
    subtitle: 'OpenAI Planet · Frontier Evaluation',
    body: 'Selected into a specialized evaluation track after four-step screening — 40-person frontier team.',
    bullets: [
      '40-person frontier evaluation team',
      'Four-step screening into the track',
      'Quality at the edge of model capability',
    ],
    date: '2026 – Present',
    impact: 'Frontier model evaluation',
    logo: './images/openai-mark.png',
    image: './images/openai-mark.png',
    mediaPlacement: 'side',
    bubbleSide: 'left',
    accent: '#e8e8e8',
    orbitRadius: 7.9,
    size: 0.82,
    orbitSpeed: 0.075,
    model: './models/planet-nine.glb',
    meteorHighlight: 'OpenAI evaluation track',
    links: [
      { label: 'OpenAI', href: 'https://openai.com/' },
      { label: 'LinkedIn', href: profile.linkedin },
    ],
  },
  {
    id: 'finance',
    index: 6,
    kind: 'planet',
    title: '100+ Student Organizations',
    subtitle: 'Finance Planet · Budget Operator',
    body: 'Funding requests, grants, and scholarship infrastructure across campus orgs.',
    bullets: [
      'ICC · Rotary · AGS finance ops',
      'Grant evaluation and chapter budgets',
      'Scholarship infrastructure for CC students',
    ],
    date: '2025 – Present',
    impact: 'ICC · Rotary · AGS',
    logo: './images/ags.png',
    image: './images/ags.png',
    mediaPlacement: 'side',
    bubbleSide: 'right',
    accent: '#b794f6',
    orbitRadius: 5.65,
    size: 0.86,
    orbitSpeed: 0.1,
    hasRing: true,
    model: './models/planet-ringed.glb',
    links: [
      { label: 'Alpha Gamma Sigma', href: 'https://www.ags.org/' },
      { label: 'LinkedIn', href: profile.linkedin },
    ],
  },
  {
    id: 'venture',
    index: 7,
    kind: 'planet',
    title: 'Mangusta Capital',
    subtitle: 'Venture Planet · Investor Lens',
    body: 'Sources early-stage startups and evaluates market, team, and traction signals.',
    bullets: [
      'Early-stage deal sourcing',
      'Investment thesis development',
      'Market, team, and traction diligence',
    ],
    date: 'June 2026 – Present',
    impact: 'Deal sourcing extern',
    mediaPlacement: 'none',
    bubbleSide: 'left',
    accent: '#6ec6a8',
    orbitRadius: 8.7,
    size: 0.8,
    orbitSpeed: 0.09,
    model: './models/planet-purple.glb',
    links: [{ label: 'LinkedIn', href: profile.linkedin }],
  },
  {
    id: 'sales',
    index: 8,
    kind: 'station',
    title: '$15,000+ Sales in 30 Days',
    subtitle: 'Sales Station · Execution',
    body: 'Personal sales through structured demos, outbound, and objection handling.',
    bullets: [
      '$15,000+ in 30 days',
      'Demos and outbound systems',
      'Top 35% regionally',
    ],
    date: '2024',
    impact: 'Top 35% regionally',
    mediaPlacement: 'none',
    bubbleSide: 'right',
    accent: '#ffb347',
    orbitRadius: 9.5,
    size: 0.74,
    orbitSpeed: 0.07,
    model: './models/planet-fire.glb',
    meteorHighlight: '$15,000+ sales in 30 days',
    links: [{ label: 'LinkedIn', href: profile.linkedin }],
  },
];

export function nodePosition(index: number): [number, number, number] {
  const node = galaxyNodes[index];
  if (!node) return [0, 0, 0];
  const angle = 0.55 + index * 0.72;
  const r = node.orbitRadius;
  return [Math.cos(angle) * r, Math.sin(angle * 0.28) * 0.35, Math.sin(angle) * r];
}

export function liveNodePosition(
  index: number,
  elapsed: number,
  reducedMotion: boolean,
  orbitPaused: boolean
): [number, number, number] {
  const node = galaxyNodes[index];
  if (!node) return nodePosition(index);
  const baseAngle = 0.55 + index * 0.72;
  const r = node.orbitRadius;
  const angle =
    reducedMotion || orbitPaused ? baseAngle : baseAngle + elapsed * node.orbitSpeed;
  return [Math.cos(angle) * r, Math.sin(angle * 0.28) * 0.35, Math.sin(angle) * r];
}

/** Angled overview — fills the screen, whole system visible. */
export const overviewCameraPos: [number, number, number] = [9.5, 5.8, 11.5];
export const overviewLookAt: [number, number, number] = [0, 0.2, 0];

export const sunNode: GalaxyNode = {
  id: 'sun',
  index: -1,
  kind: 'planet',
  title: profile.name,
  subtitle: 'The Core · Contact',
  body: 'The center of the system — reach out for AI evaluation, GTM, founding, or student-led work.',
  bullets: [
    'San Francisco Bay Area',
    'AI evaluation · GTM · founder',
    'Open to the right conversations',
  ],
  date: 'Est. 2025',
  impact: 'Enter the orbit',
  logo: profile.portrait,
  image: profile.portrait,
  mediaPlacement: 'side',
  bubbleSide: 'right',
  accent: '#ffb347',
  orbitRadius: 0,
  size: 1.2,
  orbitSpeed: 0,
  model: './models/sun.glb',
  links: [
    { label: 'Email Aadi', href: `mailto:${profile.email}` },
    { label: 'LinkedIn', href: profile.linkedin },
  ],
};

export function detailLookAt(world: [number, number, number]): [number, number, number] {
  return [world[0], world[1] * 0.9, world[2]];
}

export function detailCameraPos(
  index: number,
  world: [number, number, number]
): [number, number, number] {
  const node = galaxyNodes[index];
  const [x, y, z] = world;
  if (!node) return [6, 2.5, 7];

  const angle = Math.atan2(z, x);
  // Pull in close so the selected planet fills the frame.
  const back = 2.15;
  const side = node.bubbleSide === 'left' ? 0.75 : -0.75;
  const lift = 0.55;

  return [
    x + Math.cos(angle) * back + Math.sin(angle) * side,
    y + lift,
    z + Math.sin(angle) * back - Math.cos(angle) * side,
  ];
}

export const sunDetailCameraPos: [number, number, number] = [4.2, 1.9, 4.6];
export const sunDetailLookAt: [number, number, number] = [0, 0.15, 0];
