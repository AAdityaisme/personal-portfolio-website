export type SkillTag = {
  label: string;
  /** Simple Icons slug, or null for text-only */
  icon?: string | null;
  color?: string;
};

export type SkillGroup = {
  title: string;
  tags: SkillTag[];
};

/** Categorized stack — logos via Simple Icons CDN. */
export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    tags: [
      { label: 'Python', icon: 'python', color: '#3776AB' },
      { label: 'C/C++', icon: 'cplusplus', color: '#00599C' },
      { label: 'TypeScript', icon: 'typescript', color: '#3178C6' },
      { label: 'JavaScript', icon: 'javascript', color: '#F7DF1E' },
      { label: 'SQL', icon: 'postgresql', color: '#4169E1' },
      { label: 'HTML/CSS', icon: 'html5', color: '#E34F26' },
    ],
  },
  {
    title: 'AI / ML',
    tags: [
      { label: 'AI Evaluation', icon: null },
      { label: 'LLM Routing', icon: null },
      { label: 'Selection Bias', icon: null },
      { label: 'Agentic AI', icon: null },
      { label: 'RAG Pipelines', icon: null },
      { label: 'Computer Vision', icon: null },
      { label: 'TensorFlow', icon: 'tensorflow', color: '#FF6F00' },
      { label: 'PyTorch', icon: 'pytorch', color: '#EE4C2C' },
      { label: 'OpenCV', icon: 'opencv', color: '#5C3EE8' },
    ],
  },
  {
    title: 'Web / Cloud',
    tags: [
      { label: 'React', icon: 'react', color: '#61DAFB' },
      { label: 'Next.js', icon: 'nextdotjs', color: '#000000' },
      { label: 'Node.js', icon: 'nodedotjs', color: '#339933' },
      { label: 'Firebase', icon: 'firebase', color: '#FFCA28' },
      { label: 'Supabase', icon: 'supabase', color: '#3FCF8E' },
      { label: 'Vite', icon: 'vite', color: '#646CFF' },
      { label: 'Three.js', icon: 'threedotjs', color: '#000000' },
      { label: 'Docker', icon: 'docker', color: '#2496ED' },
      { label: 'GitHub', icon: 'github', color: '#181717' },
    ],
  },
  {
    title: 'Product / GTM',
    tags: [
      { label: 'GTM Strategy', icon: null },
      { label: 'Deal Sourcing', icon: null },
      { label: 'Investor Narrative', icon: null },
      { label: 'Sales Systems', icon: null },
      { label: 'Fundraising Ops', icon: null },
      { label: 'Campus Leadership', icon: null },
      { label: 'Public Speaking', icon: null },
      { label: 'Figma', icon: 'figma', color: '#F24E1E' },
    ],
  },
];

export function skillIconUrl(slug: string, color?: string) {
  const hex = (color ?? 'ffffff').replace('#', '');
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}
