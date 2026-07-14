# Reference Comparison Log — aikawakenichi.com vs local portfolio

Working method: the local site was driven repeatedly with headless Chromium
(Playwright) through every stage — loader → assembly → curved carousel →
grid morph → selection isolation → fragment transition → Work scroll — with
screenshots and pixel-diffs captured on each pass. Four full passes were run,
plus dedicated passes for drag, click-spam, Escape/back navigation, dock
hover, mobile width (390px), and `prefers-reduced-motion`.

**Environment constraint (honest note):** this remote sandbox's network
policy blocks direct browser access to `https://aikawakenichi.com/` (CONNECT
403 for all non-registry hosts), so the live reference could not be loaded
side-by-side here. Reference behavior was reconstructed from (a) the very
detailed interaction spec supplied with the task, (b) the site's pages
fetched through an external reader (structure, dock vocabulary:
`close / prev / next / view / drag`), and (c) third-party technical
write-ups of the site (WebGL 総本山 analysis: Nuxt + three.js, WebGL-drawn
images, hover brightness lift, geometry deformation + motion-blur on fast
scroll, gradient-placeholder entry choreography; built by Garden Eight).
A final visual pass against the live site on an unrestricted machine is
recommended.

---

## 1. Loader

### Reference behavior
Warm-white viewport, small centered name, percentage underneath, a very thin
circular line draws around the name; ring completes, the center softens and
blurs, the loader dissolves without a directional wipe.

### Current local behavior
Centered name + tabular percentage, 0.8px SVG ring drawing clockwise from the
top, paced against real asset preload; hold on completion, then blur/scale
dissolve of the center followed by an opacity dissolve of the backdrop. No
wipe, no slide.

### Differences
None found across passes at this fidelity.

### Changes made
None needed this round (implementation predates this pass and matched).

### Remaining concerns
Exact ring radius/duration vs the recording can only be confirmed against the
live site.

## 2. Homepage image assembly

### Reference behavior
Large serif title becomes visible; scattered photographic fragments move to
their positions and assemble a seamless central image; decorative glassy
pieces settle around it; navigation dock enters last.

### Current local behavior
"Journey" serif title sharpens from blur; ~60 polygon pieces of the hero
photograph (jittered-lattice clip-paths — zero seams at rest) fly in from
scattered positions with center-out stagger; cyan-tinted decor polygons
settle around; pieces swap to one solid image at completion; dock enters
after assembly begins. Idle pixel-diff over 3s: **zero drift** of the hero.

### Differences
Piece rotations settle to zero and gaps disappear (verified in screenshots).

### Changes made
Added `prefers-reduced-motion` path: solid image immediately, no fragment
flight.

### Remaining concerns
Fragment tint color (cyan) vs recording is unverified against the live site.

## 3. Home-to-portfolio transition

### Reference behavior
Fragments disperse, title exits, hero flies into the strip; curved carousel
reveals with reflection; PORTFOLIO type appears behind; label + shadow enter.

### Current local behavior
Same sequence, GSAP master timeline; hero DOM rect matches the WebGL strip
rect at handoff.

### Differences
PORTFOLIO title previously overflowed the viewport (read "ORTFOLI" at
1440px). **Fixed** — sized to fit (`clamp(90px, 17.5vw, 340px)`, 18vw mobile).

### Changes made
`aikawa.css` title clamps.

### Remaining concerns
Whether the reference crops the giant type at the edges intentionally —
unverifiable from here; current version fits fully.

## 4. Curved carousel

### Reference behavior
A broad image strip wrapped around a shallow horizontal cylinder — center
faces the viewer, sides curve backward; neighbors visible as curved side
portions; no autoplay ever.

### Current local behavior
72×8-subdivided plane bent in the vertex shader around a cylinder
(`mix(flat, curved, uCurvature)`), so the same geometry serves carousel and
grid. Side panels at yaw ±24° receding in z. Navigation only via
prev/next/drag/click/keyboard. **Idle 3s pixel-diff: zero** — no automatic
movement of any kind.

### Differences
None structural.

### Changes made
None this round (geometry system predates pass; verified).

### Remaining concerns
Exact curve depth vs reference (debug slider `curvature` exists for tuning).

## 5. Project hover (curved)

### Reference behavior
Active project rises slightly, tiny pointer-driven rotation, texture shifts
opposite the pointer, near-cursor bulge, label shifts, reflection and shadow
respond; smooth follow, soft return.

### Current local behavior
Lift −5px, yaw/pitch ≤2°, uv-based texture counter-shift, vertex bulge near
pointer, reflection dims, shadow widens/lightens/blurs; exponential smoothing
on all hover values; soft return on leave.

### Differences
None found.

### Changes made
Retuned shadow reaction (below).

### Remaining concerns
Magnitudes are judgment calls without the live site.

## 6. Shadow and reflection

### Reference behavior
Reflection: vertically mirrored, slightly compressed, low opacity,
desaturated, milky, blurred, strongest at the contact line, fades fast, moves
and curves exactly with the strip, disappears during grid morph. Separate
soft contact shadow between project and reflection reacting **inversely** to
project height.

### Current local behavior + changes made
- Reflection was too tall and faded too slowly (read as a milky sheet down to
  the dock). **Fixed:** compression 0.78 → 0.58; shader fade now
  `smoothstep(0.42→1.0)` pow 1.55 (gone before mid-height); mip-blur grows
  toward the bottom; desaturation 0.45, +16% white milkiness.
- Contact shadow was invisible — z-indexed *behind* the WebGL canvas.
  **Fixed:** z-index 6 (above canvas), darker/sharper at rest
  (α 0.32 × 0.5, blur 14px); on hover it lightens (0.3), widens (×1.08) and
  blurs (22px) while the project rises — inverse-height behavior; restored
  exactly on leave/return (verified 0.5 after Escape-back).

### Differences remaining
Contact-line alignment is within a few px; verify against live site.

## 7. Curve-to-grid morph

### Reference behavior
Carousel stops, curvature progressively flattens, sides travel to editorial
grid cells, main project resizes to its cell, reflection and shadow fade,
same objects morph — no swap, no pop.

### Current local behavior
Single `grid` uniform drives flatten + pose interpolation on the same meshes;
reflection multiplied out by grid value; shadow fades on the same timeline;
hover disabled until morph completes (scene lock).

### Differences
None found; screenshots confirm the same textures/objects in both layouts.

### Changes made
None this round.

## 8. Grid (flat gallery)

### Reference behavior
Editorial, asymmetric: one featured center image, narrower sides, varied
ratios, white gutters, cursor-following VIEW label clamped to the hovered
image, non-hovered items dim, no auto movement.

### Current local behavior
5-cell asymmetric layout (featured 40%×30% center, two 19%×24% sides, two
pale 23%×15% lower), lag-following VIEW badge clamped inside cell bounds,
other tiles dim to 0.82, hovered tile brightens/scales 1.8%.

### Differences / changes
VIEW badge previously leaked across scene changes (tween overwrite race —
badge stayed on screen through selection → fragments → Work). **Fixed:**
`killTweensOf` before every badge show/hide + a scene-guard in the follow
loop that kills it anywhere outside grid mode. Verified gone in pass 2–4.

## 9. Selected-project isolation

### Reference behavior
Clicked project stays; every other project leaves/fades; selected travels to
a single centered position; PORTFOLIO type exits upward; grid hover disabled;
no duplicate copy; fragmentation starts only after isolation.

### Current local behavior
Shared-element: the same WebGL tile tweens to the centered rect while
non-selected tiles slide outward and fade to 0; title exits up; scene lock
disables hover; the tile is hidden (`panelHidden`) in the same frame the DOM
mosaic (same image, same rect) takes over — no double image observed across
passes.

### Differences
None found.

## 10. Fragment transition

### Reference behavior
Selected image segments in place → pieces separate gently, move outward,
colors transition, center clears, next section title appears, some pieces
remain as edge atmosphere. Image-mapped pieces, not confetti; no full-screen
explosion.

### Current local behavior + changes made
Pieces are clip-path portions of the selected image (correct mapping). They
previously dispersed edge-to-edge and stayed strong — read as purple confetti
walls. **Fixed:** dispersal distance scaled down and weighted by
distance-from-center; center pieces now dissolve to 0 (scene clears), only
edge pieces persist at 0.18–0.6; tint transition softened (0.62 → 0.45);
resting overlay opacity 0.5 → 0.35; Work decor band pushed outward and
lightened.

### Remaining concerns
Piece color palette vs recording unverified.

## 11. Work introduction

### Reference behavior
"Work" serif title first, colored fragments at edges, main image rises from
below starting pale/blurred and resolving, then scroll opens.

### Current local behavior
Title blur-sharpens → image rises 34vh with blur(12px)/desaturated →
resolves; "Scroll" hint; fragments at edges.

### Differences
None found.

## 12. Vertical scrolling (Work)

### Reference behavior
Natural vertical scrolling; wheel, trackpad and touch; scrollbar reflects
content height; scroll always restored when leaving overlays.

### Current local behavior + changes made
Lenis-smoothed native `overflow-y: auto` scroller with real content height;
wheel scrolling verified headlessly (cards scroll through), mobile
programmatic + touch scrolling verified at 390px. **Changes:** scrollbar was
hidden — now visible (`scrollbar-width: thin`); added centralized
`src/lib/scrollLock.ts` (reason-tagged holders, dev logging, leak assertion)—
the galaxy mode now goes through it instead of poking `body.style`; no other
component touches body overflow anymore.

### Remaining concerns
The experience is a staged scene (document height stays 100svh; the Work
scroller owns the scrollbar). Refresh-on-route is N/A (single route).

## 13. Stacked cards

### Reference behavior (adapted per owner's direction)
Cards with a soft dimensional top cap, shadow beneath the cap, hover lift,
cap deformation, soft spring return, scroll-entry animation, natural
stacking. **Owner's requirement: the dropdown cards are TEXT cards of Aadi's
information — who he is, his experience — not images.**

### Current local behavior + changes made
Rebuilt card body as text-first editorial cards: meta caps + index rule,
large serif title, long-form body copy about Aadi (venture sourcing, $15k+
sales, Corgi GTM, stealth founding, eval-integrity research, OpenAI track,
Georgia Tech decision, DVC 4.0, AGS presidency). Card data bodies expanded
from one-liners to full text. Kept: animated SVG cap with spring physics
(arch on hover, lean with scroll velocity), cap shadow spread, −5px hover
lift with elastic return. Added: IntersectionObserver scroll-entry (rise +
fade, once per card). Removed image bodies and their parallax loop.

### Remaining concerns
None functional; copy can be edited freely in `src/data/aikawaData.ts`.

## 14. Glass dock

### Reference behavior
prev circle / center capsule (thumbnail + label) / next circle / mode circle;
hover rise + brighten + shadow drop, arrow nudges, capsule expands, thumb
scales; pressed contracts; on project change old thumb/label roll up-out,
new roll in from below.

### Current local behavior
All present (CSS hover/active states, `Roll` component for thumb + label
change, mode icon adapts per scene). Verified label rolled to the correct
category after a 6-click spam burst (state stayed consistent, no crash) and
after drag navigation.

### Differences
None found.

## 15. Navigation and state bugs audited

- Click spam during transitions → scene lock held, state consistent ✓
- Stale hover/VIEW after scene change → fixed (see §8) ✓
- Reflection lag vs carousel → same mesh/uniforms, cannot desync ✓
- Scroll locked after transitions → centralized lock, Escape-back verified ✓
- Duplicate selected image → single handoff frame, none observed ✓
- Delayed mosaic fade racing unmount (GSAP "target not found") → fixed with
  element resolution before tween ✓
- WebGL init failure → new `ErrorBoundary` + flat image fallback keeps the
  page usable ✓
- Reduced motion → assembly and fragmentation short-circuit to final states;
  full flow verified with `reducedMotion: 'reduce'`, zero page errors ✓
- Browser back/refresh → single-route app; N/A.

## Verification matrix

| Pass | Scope | Result |
|---|---|---|
| 1 | Full flow, 1440×900, screenshots ×18 | baseline mismatch list |
| 2 | Full flow after fixes | title/reflection/badge/fragments fixed |
| 3 | Drag, click-spam, dock hover, Escape-back, mobile 390px | all pass; 2 mobile CSS bugs found+fixed |
| 4 | Full flow re-run + reduced-motion + `npm run build` | clean; build ✓ |

Known environment artifacts (not site bugs): Google-Fonts fetch fails inside
the sandbox (serif falls back to Times); WebGL runs on SwiftShader.
