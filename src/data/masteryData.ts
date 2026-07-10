export type MasteryNode = {
  id: string;
  label: string;
  /** Simple Icons slug, or null for letter / custom mark */
  icon?: string | null;
  /** Built-in mark when CDN has no icon (OpenAI removed from Simple Icons) */
  mark?: 'openai' | 'letter';
  color?: string;
};

/** Hover-only stack — mastery across agentic AI + tools. */
export const masteryNodes: MasteryNode[] = [
  { id: 'claude', label: 'Claude', icon: 'anthropic', color: '#D4A27F' },
  { id: 'chatgpt', label: 'ChatGPT', mark: 'openai', color: '#10A37F' },
  { id: 'grok', label: 'Grok', icon: 'x', color: '#E8E8E8' },
  { id: 'codex', label: 'Codex', mark: 'openai', color: '#74AA9C' },
  { id: 'copilot', label: 'GitHub Copilot', icon: 'githubcopilot', color: '#FFFFFF' },
  { id: 'goose', label: 'Goose', mark: 'letter', color: '#F0A030' },
  { id: 'opencode', label: 'OpenCode', mark: 'letter', color: '#7C9CFF' },
  { id: 'openclaw', label: 'OpenClaw', mark: 'letter', color: '#FF7A59' },
  { id: 'bob', label: 'Bob by IBM', mark: 'letter', color: '#054ADA' },
  { id: 'github', label: 'GitHub', icon: 'github', color: '#FFFFFF' },
  { id: 'xcode', label: 'Xcode', icon: 'xcode', color: '#147EFB' },
  { id: 'androidstudio', label: 'Android Studio', icon: 'androidstudio', color: '#3DDC84' },
  { id: 'applestudio', label: 'Apple Studio', icon: 'apple', color: '#FFFFFF' },
  { id: 'n8n', label: 'n8n', icon: 'n8n', color: '#EA4B71' },
  { id: 'supabase', label: 'Supabase', icon: 'supabase', color: '#3FCF8E' },
  { id: 'granola', label: 'Granola', mark: 'letter', color: '#F5C542' },
  { id: 'notion', label: 'Notion', icon: 'notion', color: '#FFFFFF' },
  { id: 'canva', label: 'Canva', mark: 'letter', color: '#00C4CC' },
];

export function masteryIconUrl(slug: string, color?: string) {
  const hex = (color ?? 'ffffff').replace('#', '');
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}
