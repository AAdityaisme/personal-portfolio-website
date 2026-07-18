# Aikawa Visual Reconstruction

Overnight run, 2026-07-17. Comparison-driven corrections against the live reference.

## Reference access

### Live website
Accessible: **yes** — https://aikawakenichi.com/ driven directly in the browser
(home arc, category rotation, Work detail, gallery scroll, dock states all exercised).
Limitations: the preview pane throttles requestAnimationFrame when unfocused, so the
splash intro could not be captured live frame-by-frame; the intro's structure was
instead taken from the site's own production bundle (splash filmstrip mode →
`splashArc` transition), which is authoritative.

### Reference video
Accessible: **yes**, but it is not a site recording. `~/Downloads/192_raw.MP4`
(3840×2160, 60fps, 82.96s) is classroom footage of Aadi presenting (ICC & ASDVC).
Location: `docs/aikawa-reference-frames/` holds 332 extracted frames (0.25s interval)
and 11 contact sheets proving its contents. A still was repurposed as content
(`public/images/asdvc-speaking.jpg`).
Frame extraction: ffmpeg 8 (installed during the run), fps=4, 640px frames + 5×6 sheets.

### Reference images
Accessible: **yes** — the repository's own content photography in `public/images/`
(used as card textures), plus the site assets downloaded to scratchpad
(`entry.js`, `style.css`, `payload.json`, SSR HTML).

## Opening after loader

### Reference behavior
Loader (name + %, thin ring) → cards appear in **splash mode: a flat filmstrip**
(`x = (index − focus) × panelSpan`) → `splashArc`: the strip wraps onto a full
cylinder with a camera blend → the arc settles with one category front-center →
giant cropped serif PORTFOLIO behind, identity line top-center, dock last.
Home is `data-nav-state="home:arc"` — an overview of ALL categories, not one page.

### Local behavior before correction
Loader → "Journey" scene: one giant Journey title + a single assembled hero photo.
Journey was effectively the homepage; the portfolio world appeared only after a
user click. This inverted the reference's structure.

### Mismatches
1. Homepage was a single category (Journey-first) instead of the full-portfolio arc.
2. No post-loader photographic choreography — a static composition faded in.
3. No flat→cylinder wrap; no orbital sweep.

### Changes
- Deleted the Journey scene entirely (`JourneyScene.tsx` removed).
- New master intro timeline (`startIntro` in `AikawaExperience.tsx`) with labels
  `photosEnter → orbitBegins → categoriesResolve → dockAppears → introComplete`:
  all seven category cards enter as a flat filmstrip, wrap onto the cylinder
  (`ms.wrap` 0→1) while the cylinder rotates just over one full revolution
  (`ms.active` from +1.18 turns → settle, power3.inOut), then reflection, title,
  identity line, embossed category name and dock resolve in order. Replayable,
  scrubbable, pausable and label-jumpable from the debug panel.
- Input locked for the intro's full duration; reduced-motion jumps to the settled state.

### Remaining differences
The reference blends a dedicated splash camera into the scene camera; locally the
camera is fixed and only the geometry animates. Visually close, not identical.

## Circular photographic movement

### Reference behavior (from the production bundle)
True cylinder: `angleStep = 2π/cardCount`, `radius = panelSpan/angleStep`, card at
`{x: 0, y: 0, z: −radius}` rotated by `(index − focus − scrollTurns) × angleStep`;
scrolling rotates the cylinder indefinitely. Card surfaces additionally bend
(`uCurveRadius`), and 16:9 aspect with a 60px gap.

### Local behavior before correction
A flat ribbon: panels translated on x with a fixed yaw (~17°) and z push — a
horizontal slider dressed as a curve. Side panels showed ~20% of their face.

### Mismatches
Not a cylinder; neighbors too visible; no rotational continuity; wrong spacing model.

### Changes
`PortfolioCanvas.tsx` now implements the reference model exactly: full-cylinder
angle step, derived radius, position `(sin θ·R, 0, (cos θ−1)·R)`, rotation `−θ`,
surface bend radius = cylinder radius (the cards read as one continuous drum),
far-side cards fade past ~94° so nothing ghosts through. The inertial wheel/drag
spin (exponential friction, soft snap) rotates this cylinder infinitely.

### Remaining differences
With 7 categories the neighbor slivers show more face than the reference's
4-category arc (51° vs 90° steps) — a consequence of having more worlds, kept.

## Complete category introduction

All seven categories (Jobs, Projects, Space Mode, Work, Life, Leadership,
Credentials) participate in the intro sweep and are reachable by wheel, drag,
arrows, and keyboard immediately after it settles. The "Space Mode" category was
re-titled and re-written to earn its click (a fully explorable 3D galaxy).

## Five-image composition

The overview presents the wrapped card system with focus hierarchy (front card
full and bulging, neighbors receding on the drum, far cards hidden), mirrored
gradient reflections, contact shadow under the front card, and the category name
embossed in large translucent serif ON the photograph (reference treatment),
crossfading on rotation. Grid mode (dock toggle) still unfolds the same panels
into asymmetric editorial cells — no separate mounted grid.

## Glass treatment

Integrated at card level, per the reference's `card:glass:*` params, not pasted
glassmorphism: the panel shader adds a faint edge highlight (`uGlassEdge` ≈ 0.34
scaled), a top sheen, and a pointer-following specular (`uGlassPointer`, hover
only) — the photo stays dominant. The dock keeps its blurred glass; the embossed
label carries the milky translucent look. Restrained by design; no rainbow
chromatic aberration, no frosted panels.

## Image selection and isolation

Click on the front card (or dock pill) → input locks → other cards fade and move
outward (their reflections multiply to zero in the same frame loop), the selected
card centers and flattens → mosaic fragmentation disperses it into tinted pieces
that remain as the detail scene's border → serif title + lead + photo rise. The
non-selected cards' opacity, reflections and glass all reach 0 (verified via the
debug snapshot and by direct uniform reads). The detail dock swaps to
[← back | Category LABEL | mode].

## Scrolling and project detail

The detail scene scrolls through Lenis inside its own scroller (wheel verified to
the gallery bottom). Gallery cards now roll their OWN top edge (reference
`uRollTopBend`): a spring drives the media's elliptical top radius (14→28px on
hover) and a velocity lean, replacing the old white SVG cap. Escape / back circle
return to the overview and re-enter the arc cleanly.

## Verification summary

- `tsc --noEmit` clean; production build clean.
- Desktop flow: loader → intro (verified frozen at 10% flat filmstrip, 45%
  mid-orbit curved, 85% resolve via the debug scrubber) → overview → rotate →
  select → detail → scroll → back.
- Idle test: 66.5s untouched — active/category/labels byte-identical (no autoplay).
- Rapid-input: 5 fast dock clicks → consistent state; locked transitions swallow
  conflicting clicks.
- Mobile 375px: wider card fraction (0.82), intact intro/emboss/dock; identity
  line reflowed to avoid the Galaxy button.
- Reduced motion: intro jumps to the settled overview; selection/scroll unaffected.

## Remaining uncertainty (honest)

- The reference's splash-to-arc camera blend, reflection chroma/noise shader, and
  the exact intro timings could not be frame-timed (no real site recording; pane
  throttling). Geometry and states came from the bundle; timings are tuned by eye.
- The reference's ZOOM cursor chip in detail view exists locally only as the grid
  VIEW badge, not in the detail gallery.
- Phantom duplicate clicks in the test harness occasionally re-trigger controls;
  not reproducible in a real browser session.
