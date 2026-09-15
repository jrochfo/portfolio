# Project: Personal portfolio — jakerochford.com

Brand/motion designer's portfolio. Fully specified in Figma (wireframe
complete, tokens defined); build phase is transcribing that spec.

## Architecture
- Astro (minimal template), plain CSS, vanilla JS. GSAP + ScrollTrigger
  is the established motion convention (decided via a spike comparing
  it against CSS `position: sticky`). Any pin/scrub/scroll-driven
  animation must always provide a static, non-pinned/non-animated path
  under `prefers-reduced-motion: reduce` — never skip this.
- NO React, NO Tailwind — deliberate decisions, don't suggest them.
- Design tokens as CSS custom properties in src/styles/global.css,
  defined on :root, mobile values via one media query (max-width: 768px).
- Pages: index (one-page scroll), about. More later.
- Deploys automatically to Cloudflare Pages on push to main.

## Homepage architecture
- One component per section, in src/components/: Hero.astro,
  WhatIDo.astro, Rebrand.astro, AlsoShipped.astro,
  Testimonials.astro, OffTheClock.astro, Close.astro. index.astro
  composes them in that order, inside the base layout, as `<main>`
  containing one `<section>` per component (each with a proper
  heading) — nav/footer are already handled by the layout.
- Built one section at a time across sessions; one commit per section.
- A component's own `<script>` must be nested inside its `<section>`
  (before the closing tag), not placed after it. Astro renders
  `<script>` at its literal template position (unlike `<style>`, which
  it always extracts) — a script left after `</section>` becomes a
  sibling of the section inside `<main>`, which breaks the
  `main > section + section` gap selector for whatever section follows
  it. Bit us once already (Rebrand lost its top gap because WhatIDo's
  script sat between the two sections).

## Design system rules
- Spacing scale governs gaps between things; container tokens govern
  where things start; component tokens govern what things are.
  Never hard-code a value that has a token.
- Homepage section gap: owned in ONE place — the `main > section`
  rules in global.css, not per-section padding. Sections carry zero
  vertical padding by default. Default gap is --space-3xl. Exceptions:
  (1) full-bleed band sections (testimonials, footer) have their own
  padding-block: --space-xl, since their background-color edge is
  part of the boundary, and the gap adjacent to a bleed band drops to
  --space-2xl; (2) Hero and Close are viewport-height compositions
  with their own internal spacing, tuned by eye, exempt from the gap
  system entirely.
- Section container pattern (same as nav/footer): the section element
  is full viewport width; its contents sit in a `.container` div
  (max-width + margin-inline: auto + container padding). Bleed
  backgrounds span the viewport; content aligns to the container.
- Design reference grid: layouts in the Figma spec align to a
  12-column grid with 24px gutters, within the 1200px container.
  Implement layouts with modern CSS (grid/flex fractions) that match
  those proportions — no global column framework needed.
  Component-internal image gaps use --space-xs (12px), which is
  deliberately distinct from the 24px layout gutter: packed image
  rows and montages use xs, layout-level column gaps use 24px.
- Type: locked. Fraunces (self-hosted variable, opsz/wght/SOFT/WONK
  axes) for Display and h1; Schibsted Grotesk (self-hosted variable,
  wght) for h2, h3, body, and caption — split as --font-display and
  --font-text in global.css. 6 levels, sizes vary by breakpoint,
  weights/line-heights constant. A dev-only audition panel
  (src/components/FontAudition.astro) is still in the codebase,
  disabled via FONT_AUDITION_ENABLED in Base.astro, for testing future
  type changes the same way.
- Color: mid-exploration. The neutral ramp (--color-bg/panel/band/
  neutral/line/ink/ink-muted) is formula-driven from five control
  variables (--neutral-hue, --neutral-chroma, --compression,
  --ink-lightness, --ink-chroma-mix) in OKLCH, so a small set of
  values determines the whole system — see the Color section of
  global.css for the formulas. A dev-only panel
  (src/components/ColorExploration.astro, enabled via
  COLOR_EXPLORATION_ENABLED in Base.astro) exposes four live controls
  — Temperature, Compression, Ink, Accent — for auditioning palettes;
  land on a favorite there, then commit its values as the literal
  defaults and turn the panel off. --color-accent is the one slot with
  a real color choice pending (candidates: Ochre/Rust/Moss, or "None");
  it currently drives the nav-pill active tab, WhatIDo card icons,
  focus rings, ::selection, link-hover underlines, and button hover
  states. Nothing here is final — it's still the token *layer*, tuned
  further once real content (video, images) is in place. Roles that
  are only coincidentally the same value today (e.g. a card panel and
  a full-bleed section band) still get separate tokens, so the real
  palette can tell them apart later without a find-and-replace.
- Tooltips / transient overlays (e.g. the About page's "Email copied"):
  caption type, --radius-well, solid dark fill (no translucency),
  fade in/out only. No animation under `prefers-reduced-motion: reduce`
  — appear/disappear instantly instead.

## Conventions
- I'm a designer, first web build. Explain non-obvious choices briefly
  as you work. Commit at the end of each session with a clear message.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
