# MOTION SPEC — georg.miami rebuild (BINDING, 2026-06-10)

The first build round was rejected: "basic editorial shit with no animation." This spec is the fix. Motion is THE product requirement, not a garnish. A version that reads as a static page with some fade-ins FAILS.

## What gojiberry.ai actually does (observed via Playwright, 18,474px scroll narrative)

1. Hero: badge in corner brackets, organic SVG line art flowing down both sides, soft coral-to-white gradient wash
2. Text sections blur as they scroll out of view (motion-blur exit)
3. Numbered feature scenes (1/4..4/4) where the illustration ASSEMBLES as you scroll: profile avatars fly INTO a box, step by step
4. Constellation/network graphs: coral dots connected by lines, drawing themselves in
5. Corner-bracket framed headlines with a pulsing bullet marker
6. Ghost tabs ("Connect / Prospect / Convert") that activate sequentially on scroll
7. 3D glass-prism renders as section visuals
8. Integration hub: curved bezier connectors fan out from a central node to bracket-framed logo chips, lines draw in
9. Numbered nav (Features 01, Playbooks 02...)
10. The page is a scroll-driven STORY, not stacked sections

## Mandatory animation inventory (EVERY version implements ALL 12)

1. **Hero entrance choreography**: ≥4 elements staggered in (clip-path/translate/opacity), 0.8-1.4s total, feels directed
2. **Ambient background life**: drifting gradient wash and/or floating shapes, continuous, GPU-cheap (transform/opacity only)
3. **≥4 pinned scroll-scrubbed scenes** (`scrub: true` or useScroll), one per flagship: a system diagram or illustration ASSEMBLES progressively with ≥5 sub-steps tied to scroll position (nodes appear, connectors draw, labels type in, data flows)
4. **≥6 distinct SVG path draw-ins** (stroke-dashoffset) beyond the pinned scenes
5. **Data particles flowing along ≥1 SVG path** (small circles animating along a bezier, looping)
6. **Counter roll-ups** on the cred strip numbers (in-view triggered)
7. **Scroll progress indicator**: thin rail/bar + current section number (mono), updates live
8. **Magnetic hover** on primary CTAs (translate toward cursor, spring back) + underline draw-in on text links
9. **Hover physics on cards/rows**: lift, tilt (≤3deg), or scale with shadow response, 150-250ms
10. **Section transitions**: entering sections slide+fade or unblur; leaving hero gets subtle parallax/blur
11. **One infinite marquee/ticker** (tech stack, client logos, or "live products" strip), pausable on hover
12. **prefers-reduced-motion: reduce** kills/instants ALL of the above; content fully readable with JS off

## Hard self-verification (builder runs these on its own output and reports numbers; failing ANY = keep working)

Vanilla versions:
- `grep -c "ScrollTrigger" file` ≥ 15
- `grep -c "scrub" file` ≥ 4
- `grep -c "stroke-dashoffset\|strokeDashoffset" file` ≥ 6
- file size ≥ 60KB (thin output = static page = fail)

React version:
- `grep -rc "useScroll\|useTransform\|whileInView\|animate(" src/ | awk -F: '{s+=$2} END {print s}'` ≥ 25
- ≥4 components using useScroll+useTransform scrubbing
- dist builds clean

## Taste guardrails (motion ≠ chaos)

- Everything eases (power2/power3 out, or springs); nothing linear except marquee and particle loops
- Scroll-scrubbed scenes must feel solid, no jank: transform/opacity/stroke only, will-change used sparingly
- Light/warm palettes per version brief; NO purple, NO gradient text, NO glow shadows
- Type, spacing, and alignment still matter: motion on top of craft, not instead of it
- 60fps target; no layout-thrashing animations (no top/left/width/height tweens)
