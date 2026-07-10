import type { ComponentType } from 'react';
import { skillGroups } from '../data/skillsData';

type IconProps = { className?: string; color?: string };

function Dot({ className, color = '#d4af37' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill={color} />
    </svg>
  );
}

export type StackItem = {
  label: string;
  Icon: ComponentType<IconProps>;
  color: string;
  href?: string;
};

/** Flat list kept for any legacy mobile views. */
export const stackItems: StackItem[] = skillGroups.flatMap((g) =>
  g.tags.map((t) => ({
    label: t.label,
    Icon: Dot,
    color: t.color ?? '#d4af37',
  }))
);
