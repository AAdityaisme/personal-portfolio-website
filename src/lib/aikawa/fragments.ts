/**
 * Polygon fragment generation for the image assembly / mosaic transitions.
 *
 * Pieces come from a jittered lattice: interior lattice points are displaced
 * once and shared by adjacent cells, so the assembled pieces tile the
 * rectangle with zero gaps — the photograph reads as seamless at rest.
 */

export type Piece = {
  /** CSS clip-path polygon (percent coordinates of the full rect). */
  clipPath: string;
  /** Piece centroid in fractions of the rect (transform-origin + stagger). */
  cx: number;
  cy: number;
  /** Distance of centroid from rect center, 0..~0.71 (stagger key). */
  fromCenter: number;
};

type Rng = () => number;

export function seededRandom(seed: number): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Build `cols × rows` quad pieces (some split into triangle pairs for
 * variety). Total piece count ≈ cols*rows + splits.
 */
export function makePieces(cols: number, rows: number, seed = 7): Piece[] {
  const rand = seededRandom(seed);
  const px: number[][] = [];
  const py: number[][] = [];

  for (let r = 0; r <= rows; r++) {
    px[r] = [];
    py[r] = [];
    for (let c = 0; c <= cols; c++) {
      const interiorX = c > 0 && c < cols;
      const interiorY = r > 0 && r < rows;
      const jx = interiorX ? (rand() - 0.5) * 0.62 : 0;
      const jy = interiorY ? (rand() - 0.5) * 0.62 : 0;
      px[r][c] = ((c + jx) / cols) * 100;
      py[r][c] = ((r + jy) / rows) * 100;
    }
  }

  const pieces: Piece[] = [];
  const push = (pts: [number, number][]) => {
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length / 100;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length / 100;
    pieces.push({
      clipPath: `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`,
      cx,
      cy,
      fromCenter: Math.hypot(cx - 0.5, cy - 0.5),
    });
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a: [number, number] = [px[r][c], py[r][c]];
      const b: [number, number] = [px[r][c + 1], py[r][c + 1]];
      const d: [number, number] = [px[r + 1][c + 1], py[r + 1][c + 1]];
      const e: [number, number] = [px[r + 1][c], py[r + 1][c]];
      if (rand() < 0.34) {
        // Split the quad into two triangles along a random diagonal.
        if (rand() < 0.5) {
          push([a, b, d]);
          push([a, d, e]);
        } else {
          push([a, b, e]);
          push([b, d, e]);
        }
      } else {
        push([a, b, d, e]);
      }
    }
  }
  return pieces;
}

export type ScatterTarget = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
};

/**
 * Scatter start-state for the homepage assembly: pieces begin displaced
 * outward from the rect center with mild rotation/scale noise.
 */
export function scatterFor(piece: Piece, rand: Rng, spreadPx: number): ScatterTarget {
  const angle = Math.atan2(piece.cy - 0.5, (piece.cx - 0.5) * 1.6) + (rand() - 0.5) * 1.1;
  const dist = spreadPx * (0.35 + rand() * 0.95);
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist * 0.8,
    rotation: (rand() - 0.5) * 36,
    scale: 0.92 + rand() * 0.16,
    opacity: 0.35 + rand() * 0.65,
  };
}

/**
 * Dispersal targets for the mosaic breakup: outward 60–280px, extra
 * rotation −12°..12°, opacity 0.2–0.75, scale 0.85–1.08.
 */
export function disperseFor(piece: Piece, rand: Rng): ScatterTarget {
  const angle = Math.atan2(piece.cy - 0.5, (piece.cx - 0.5) * 1.35);
  const dist = 60 + rand() * 220;
  return {
    x: Math.cos(angle) * dist * 1.35,
    y: Math.sin(angle) * dist,
    rotation: (rand() - 0.5) * 24,
    scale: 0.85 + rand() * 0.23,
    opacity: 0.2 + rand() * 0.55,
  };
}

export type DecorFragment = {
  /** Position in viewport fractions. */
  x: number;
  y: number;
  size: number;
  rotation: number;
  clipPath: string;
  color: string;
  opacity: number;
  /** Parallax depth 0 back … 1 front. */
  depth: number;
  /** Drift phase/speed. */
  phase: number;
  speed: number;
};

/** Small decorative polygons around the composition (journey / work edges). */
export function makeDecorFragments(count: number, palette: string[], seed = 11): DecorFragment[] {
  const rand = seededRandom(seed);
  const frags: DecorFragment[] = [];
  for (let i = 0; i < count; i++) {
    // Keep the middle clear — bias positions to an elliptical band.
    const a = rand() * Math.PI * 2;
    const rx = 0.28 + rand() * 0.24;
    const ry = 0.22 + rand() * 0.26;
    const n = 3 + Math.floor(rand() * 3);
    const pts: string[] = [];
    for (let k = 0; k < n; k++) {
      const pa = (k / n) * Math.PI * 2 + rand() * 0.8;
      const pr = 32 + rand() * 46;
      pts.push(`${(50 + Math.cos(pa) * pr).toFixed(1)}% ${(50 + Math.sin(pa) * pr).toFixed(1)}%`);
    }
    frags.push({
      x: 0.5 + Math.cos(a) * rx,
      y: 0.48 + Math.sin(a) * ry,
      size: 16 + rand() * 66,
      rotation: (rand() - 0.5) * 40,
      clipPath: `polygon(${pts.join(', ')})`,
      color: palette[Math.floor(rand() * palette.length)],
      opacity: 0.25 + rand() * 0.55,
      depth: rand(),
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.5,
    });
  }
  return frags;
}
