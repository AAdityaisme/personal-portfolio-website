/**
 * Centralized scroll-lock. Every component that needs to freeze document
 * scrolling goes through here — nobody sets body styles directly — so a
 * leaked lock is always attributable and visible in dev logs.
 */
const holders = new Set<string>();
let prevOverflow: string | null = null;

function apply() {
  const locked = holders.size > 0;
  if (locked && prevOverflow == null) {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  } else if (!locked && prevOverflow != null) {
    document.body.style.overflow = prevOverflow;
    prevOverflow = null;
  }
  if (import.meta.env.DEV) {
    console.debug(`[scroll-lock] ${locked ? 'LOCKED' : 'free'} — holders: [${[...holders].join(', ')}]`);
  }
}

export function lockScroll(reason: string) {
  holders.add(reason);
  apply();
}

export function unlockScroll(reason: string) {
  holders.delete(reason);
  apply();
}

/** Dev assertion — call after transitions that must leave scrolling free. */
export function assertScrollFree(context: string) {
  if (!import.meta.env.DEV) return;
  if (holders.size > 0) {
    console.warn(`[scroll-lock] expected free after "${context}" but held by: [${[...holders].join(', ')}]`);
  }
}
