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

## Design system rules
- Spacing scale governs gaps between things; container tokens govern
  where things start; component tokens govern what things are.
  Never hard-code a value that has a token.
- Type: Inter (placeholder), 6 levels, sizes vary by breakpoint,
  weights/line-heights constant.
- Wireframe-fidelity grayscale for now — no color system yet.

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
