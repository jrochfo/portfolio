# Project: Personal portfolio — jakerochford.com

Brand/motion designer's portfolio, live at https://jakerochford.com.
Originally specified in Figma; now built and maintained here. README.md
covers the structure, hosting, domain and dev tools.

## Architecture
- Astro (minimal template), plain CSS, vanilla JS. GSAP + ScrollTrigger
  is the established motion convention (decided via a spike comparing
  it against CSS `position: sticky`). Any pin/scrub/scroll-driven
  animation must always provide a static, non-pinned/non-animated path
  under `prefers-reduced-motion: reduce` — never skip this.
- NO React, NO Tailwind — deliberate decisions, don't suggest them.
- Design tokens as CSS custom properties in src/styles/global.css,
  defined on :root, mobile values via one media query (max-width: 768px).
- Pages: index (one-page scroll), about, documentation (+ write-ups),
  resume (an HTML hand-off to the PDF so opens count in analytics),
  sitemap.xml (generated from src/pages/).
- Deploys automatically to Cloudflare Pages on push to main.
- Base.astro takes `title` and `description` per page; they feed the
  <title>, meta description and the Open Graph / Twitter link-preview
  tags (shared image: public/og.png). `site` in astro.config.mjs builds
  the canonical URLs (trailing slash, as Pages serves folder pages).

## Homepage architecture
- One component per section, in src/components/: Hero.astro,
  MobileHome.astro (phone mode only), WhatIDo.astro, Rebrand.astro,
  AlsoShipped.astro, Testimonials.astro, OffTheClock.astro,
  Close.astro. index.astro composes them in that order, inside the base layout, as `<main>`
  containing one `<section>` per component (each with a proper
  heading) — nav/footer are already handled by the layout.
- Built one section at a time across sessions; one commit per section.
- Phone mode: phones (detected by device in Base.astro's head script,
  not by width) get `<html class="mobile-view">` — a shorter homepage.
  Hero becomes a vertical ring, MobileHome replaces What I Do /
  Rebrand / Also Shipped, Off the Clock is a swipe deck. Use
  `.mobile-only` / `.desktop-only` and `:root.mobile-view` for phone
  branches. `?mobile=1` / `?mobile=0` force it; PHONE_MODE_AUTO turns
  detection off. Tablets and narrow desktop windows get the responsive
  desktop site (the max-width: 768px media query), which is separate.
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
  (1) full-bleed band sections (testimonials, close, footer) have their own
  padding-block: --space-xl, since their background-color edge is
  part of the boundary, and the gap adjacent to a bleed band drops to
  --space-2xl; Close is one too (an accent-filled sign-off band, the
  one surface the accent fills); (2) Hero is a viewport-height
  composition with its own internal spacing, tuned by eye, exempt
  from the gap system entirely.
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
  (src/components/dev/FontAudition.astro) is still in the codebase,
  disabled via FONT_AUDITION_ENABLED in Base.astro, for testing future
  type changes the same way.
- Color: Butter Ceremonial (chosen via a light/dark palette-duo
  exploration). Each mode picks four values —
  --color-bg (buttery paper), --color-ink (deep forest green),
  --color-title (display/h1/h2), --color-accent — plus --color-tint,
  what the surfaces (--color-panel/panel-well/band/neutral/line) are
  color-mixed from. The tint is a paper brown rather than the ink so
  cards stay papery instead of turning green. --color-ink-muted mixes
  ink toward bg. Dark mode lives in :root[data-theme='dark'] in
  global.css and overrides only the picked values; the mixes follow.
  The nav's round toggle (left of About) sets <html data-theme>, stores
  the choice in localStorage ('theme'), defaults to the system setting,
  and an inline script in Base.astro applies it before first paint.
  Client logos flip light in dark mode (global.css). Roles that are
  only coincidentally the same value today (e.g. a card panel and a
  full-bleed band) still get separate tokens. The duos exploration
  that picked it is kept as a dev tool (src/components/dev/
  PaletteAudition.astro, PALETTE_AUDITION_ENABLED, off).
- Tooltips / transient overlays (e.g. the About page's "Email copied"):
  caption type, --radius-well, solid dark fill (no translucency),
  fade in/out only. No animation under `prefers-reduced-motion: reduce`
  — appear/disappear instantly instead.
- Copy: curly quotes and apostrophes (’ “ ”) in all visible text and
  alt text. Tone is plain and friendly — not salesy, cutesy or
  arrogant.

## Media and performance
- Videos: public/video/<section>/, a WebM (VP9) + MP4 (H.264) pair,
  `preload="none"`, loaded only when they're about to play (in view /
  in front). Never start a below-the-fold video on page load. Always
  add sources with setVideoSources() from src/scripts/lazyMedia.ts —
  it puts the MP4 first on Apple devices (iPhone Safari otherwise
  picked the WebM and showed only the poster). Encode WebMs as 8-bit
  4:2:0 VP9 (profile 0); 10-bit/4:2:2 won't decode on many devices.
- Images: import from src/assets and size with getImage/<Image> at the
  width they're displayed (about 2x for retina).

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
