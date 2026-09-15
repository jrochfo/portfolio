# jakerochford.com

Jake Rochford's personal portfolio. Astro, plain CSS, vanilla JS — no
React, no Tailwind, by design. Full design-system rules and build
conventions live in [AGENTS.md](./AGENTS.md).

## Structure

```text
/
├── public/
│   └── models/          3D models (OBJ/MTL + textures) for the Hero/About viewers
├── src/
│   ├── assets/           fonts, icons, logos, headshots — imported and optimized by Astro
│   ├── components/       one component per homepage section, plus nav/footer
│   ├── layouts/          Base.astro — the shared <head>, nav, footer shell
│   ├── pages/             index.astro (homepage) and about.astro
│   └── styles/            global.css — design tokens and base styles
└── astro.config.mjs
```

## Commands

Run from the project root:

| Command                | Action                                      |
| :---------------------- | :------------------------------------------- |
| `npm install`            | Install dependencies                         |
| `npx astro dev`           | Start the local dev server at `localhost:4321` (use `--background` — see AGENTS.md) |
| `npx astro build`         | Build the production site to `./dist/`       |
| `npx astro preview`       | Preview the production build locally         |

## Dev-only tools

Two auditioning panels live in the codebase but render only outside
production builds (`import.meta.env.DEV`), gated by flags in
`Base.astro`:

- **FontAudition** — swap type families live, for any future
  typography change
- **ColorExploration** — Temperature/Compression/Ink/Accent controls
  over the OKLCH-based color tokens in `global.css`, with a copyable
  hex/token readout

## Deploy

Cloudflare Pages, automatically on push to `main`.
