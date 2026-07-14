/** Shared motion tokens — single source of truth for every timeline. */
export const MOTION = {
  micro: 0.18,
  hover: 0.32,
  normal: 0.62,
  long: 0.95,
  scene: 1.25,

  easeOut: 'power3.out',
  easeInOut: 'power4.inOut',
  easeSoft: 'sine.inOut',
  easeElastic: 'elastic.out(1, 0.55)',
  easeSettle: 'elastic.out(1, 0.75)',
} as const;

export type Scene =
  | 'loading'
  | 'journey'
  | 'journey-to-portfolio'
  | 'portfolio-curved'
  | 'portfolio-grid'
  | 'project-selected'
  | 'fragment-transition'
  | 'work'
  | 'work-gallery';

/** A GSAP-tweenable scalar. */
export type Dial = { value: number };

/**
 * Mutable motion state shared between the orchestrator (GSAP timelines)
 * and the WebGL frame loop. Never read by React render — refs only.
 */
export type MotionState = {
  /** Continuous carousel position — panels derive offset = index - active. */
  active: Dial;
  /** 0 flat → 1 fully curved strip. */
  curvature: Dial;
  /** 0 carousel → 1 flat grid. */
  grid: Dial;
  /** 0 grid → 1 selected tile centered, others gone. */
  select: Dial;
  /** Portfolio entrance: 0 hidden → 1 revealed (sides + reflection). */
  reveal: Dial;
  /** Reflection master opacity multiplier. */
  reflection: Dial;
  /** Hover lift on the active panel, in px (0 → -6). */
  lift: Dial;
  /** Index of the tile being selected (valid while select > 0). */
  selectedIndex: number;
  /** Panel index currently hovered in grid mode, -1 when none. */
  hoverPanel: number;
  /** Pointer uv inside the hovered/active panel. */
  pointerUv: { x: number; y: number };
  /** True while pointer is over the active curved panel. */
  hoverActive: boolean;
  /** Hide the selected panel once the mosaic overlay takes over. */
  panelHidden: boolean;
  /** Dev-tunable values (debug panel). */
  debug: {
    shadowStrength: number;
    reflectionOpacity: number;
    curveAmount: number;
    fragmentCount: number;
  };
};

export function createMotionState(): MotionState {
  return {
    active: { value: 0 },
    curvature: { value: 0 },
    grid: { value: 0 },
    select: { value: 0 },
    reveal: { value: 0 },
    reflection: { value: 0 },
    lift: { value: 0 },
    selectedIndex: 0,
    hoverPanel: -1,
    pointerUv: { x: 0.5, y: 0.5 },
    hoverActive: false,
    panelHidden: false,
    debug: {
      shadowStrength: 1,
      reflectionOpacity: 0.22,
      curveAmount: 1,
      fragmentCount: 54,
    },
  };
}

/** Strip geometry in viewport fractions — shared by WebGL, DOM shadow and overlays. */
export const STRIP = {
  /** Panel width as fraction of viewport width. */
  width: 0.56,
  /** Panel aspect (h = w * aspect). */
  aspect: 9 / 21,
  /** Vertical center of the strip in viewport fractions (from top). */
  centerY: 0.5,
  /** Carousel spread between panels, as fraction of panel width. */
  spread: 0.78,
  /** Max side-panel yaw in radians (~24°). */
  yaw: 0.42,
  /** Total curve angle across the panel, radians (~57°). */
  curve: 1.0,
  /** Gap between panel bottom and reflection top, px. */
  reflectionGap: 14,
  /** Reflection vertical compression. */
  reflectionScale: 0.78,
} as const;

/** Asymmetric editorial grid cells, keyed by wrapped carousel offset. */
export type GridCell = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  pale?: boolean;
};

export const GRID_CELLS: Record<number, GridCell> = {
  0: { cx: 0.5, cy: 0.42, w: 0.4, h: 0.3 },
  [-1]: { cx: 0.15, cy: 0.4, w: 0.19, h: 0.24 },
  1: { cx: 0.85, cy: 0.4, w: 0.19, h: 0.24 },
  [-2]: { cx: 0.31, cy: 0.75, w: 0.23, h: 0.15, pale: true },
  2: { cx: 0.69, cy: 0.75, w: 0.23, h: 0.15, pale: true },
};

/** Centered rect the selected tile settles into before the mosaic breakup. */
export const SELECT_RECT: GridCell = { cx: 0.5, cy: 0.46, w: 0.46, h: 0.34 };

/** Wrap a carousel offset into [-count/2, count/2). */
export function wrapOffset(offset: number, count: number): number {
  let o = offset % count;
  if (o < -count / 2) o += count;
  if (o >= count / 2) o -= count;
  return o;
}
