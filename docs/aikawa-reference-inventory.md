# Aikawa Reference Inventory

Compiled 2026-07-17 (overnight visual-reconstruction run).

## Search results

Recursive search of the workspace (`/Users/prestonjaysusanto/aadipersonalweb`) and `~/Downloads`
for `.mov .mp4 .webm .gif .png .jpg .jpeg .webp .heic` and names matching
`aikawa | animation | reference | recording`.

**Honest finding:** no screen recording of aikawakenichi.com exists on disk. The file that was
supplied as the video reference (`192_raw.MP4`) is real-world classroom footage of Aadi
presenting (ICC & ASDVC visible on the blackboard) — verified frame-by-frame below. The motion
reference for this run is therefore the **live site itself** (fully accessible) plus its
**production JS bundle**, which was downloaded and read to extract the exact runtime geometry
and material constants. That is stronger evidence than a video: the numbers below are the
site's actual parameters, not estimates.

| File | Type | Dimensions/Duration | What It Shows | Useful For |
|---|---|---:|---|---|
| `~/Downloads/192_raw.MP4` | video | 3840×2160 · 60fps · 82.96s | Aadi presenting to a classroom; "ICC & ASDVC" on blackboard. NOT a site recording. | Content still for Leadership/ASDVC card |
| `docs/aikawa-reference-frames/f0001–f0332.jpg` | frames | 640w · every 0.25s | Extracted frames of the above (all classroom) | Proof of video contents |
| `docs/aikawa-reference-frames/sheet00–10.jpg` | contact sheets | 1600w · 30 frames each | 7.5s per sheet, full video coverage | Frame-by-frame verification |
| `https://aikawakenichi.com/` | live site | — | The actual reference experience (Work/Fashion/Journey/Mode) | Primary motion reference |
| `scratchpad/entry.js` | JS bundle | 1.8MB | The site's real Three.js/GSAP engine, minified but readable | Exact geometry + material constants |
| `scratchpad/style.css`, `payload.json`, `aikawa.html` | site assets | — | SSR markup, nav states, categories | Structure verification |
| `~/Downloads/Aikawa Video Animation Spec.md` | spec | 27KB · Jul 13 | Written description of the recording's sequences | Timing targets |
| `~/Downloads/Aikawa Motion Recreation Cursor Spec.md` | spec | 29KB · Jul 12 | Earlier written description | Loader timings, layer model |
| `public/images/*.jpg/png` (repo) | images | various | Aadi's own content photography (campus, corgi, AGS, suit, snowboard…) | Card textures |

## Live-site states observed directly (browser session)

- Loader: centered name + `0%`, thin ring (`splash:ring:radius .27, stroke .055, start π, direction −1`).
- Home (`data-nav-state="home:arc"`): giant cropped serif **PORTFOLIO** behind a **full cylinder**
  of category cards; active card bulges toward viewer with a large translucent serif category
  name embossed **on the photograph**; neighbor cards visible only as few-px slivers at the
  viewport edges; tall prismatic mirror reflection below (chroma smears, mirrored embossed text).
- Identity line top-center: "Kenichi Aikawa is a photographer from Japan." (name underlined → /about).
- Dock: one pill `[thumb | label | ← →]` + separate circular mode button. Hovering → shows
  eyebrow "Next" + next category label/thumb inside the pill.
- Category open (`Work`): serif title, translucent prism **glass shards** scattered at the
  viewport edges, large photo below with "ZOOM" cursor chip, dark glass dock `[← | Category WORK | mode]`.
- Gallery scroll: stacked full-width photos whose **own top edge arches/rolls** (`uRollTopRadius`,
  `uRollTopBend`), "Details GALLERY" dock state with `+`.

## Runtime constants lifted from the production bundle

| Parameter | Value | Meaning |
|---|---:|---|
| `getCardAngle` | `(index − focus − scrollTurns) × angleStep` | cylinder placement |
| `angleStep` | `2π / cardCount × layout:angle(1)` | cards span the full cylinder |
| `getArcRadius` | `panelSpan / angleStep` | adjacent cards nearly touch |
| card position | `{x:0, y:0, z:−radius}` + rotation by angle | cylinder axis behind screen |
| `layout:card:aspect` | 1.77778 | 16:9 cards |
| `layout:gap` | 60 | px between cards on the arc |
| splash mode | `x = (index−focus) × panelSpan` | intro starts as a FLAT filmstrip |
| `splashArc` | tween + camera blend | filmstrip wraps onto the cylinder |
| `card:glass:reflect / edge / absorption` | .3 / .34 / .18 | glass integrated in the card shader |
| `card:glow:strength` | .3 | soft card glow |
| `card:image:parallax / scale` | 1.1 / 1.15 | texture over-scan for pointer parallax |
| `reflect:strength / saturation / gap` | .62 / .74 / 26 | mirror reflection |
| `reflect:chroma:amount / blur` | 8.6 / 6.4 | prismatic chroma in the reflection |
| `uRollTopRadius / uRollTopBend` | uniforms | gallery photo top-edge roll |
| states | `home-start → home-arc → home-details → home-complete`, `home:hover/open/next/prev/toggle/vertical` | state machine |

The video frame sets required by the brief were produced (332 frames + 11 contact sheets) and
retained; they document the supplied video's true contents.
