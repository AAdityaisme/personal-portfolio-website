const WORKSPACE = 'aadisharma-portfolio';
const NAME = 'visits';
const HIT_URL = `https://api.counterapi.dev/v1/${WORKSPACE}/${NAME}/up`;

/** Fire-and-forget visit hit. Not shown on the public site UI. */
export function recordVisit() {
  if (typeof window === 'undefined') return;
  // Avoid double-count in React StrictMode remounts within the same load.
  const key = 'aadiVisitHit';
  try {
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage blocked — still attempt one hit
  }
  void fetch(HIT_URL, { method: 'GET', mode: 'cors', cache: 'no-store' }).catch(() => undefined);
}
