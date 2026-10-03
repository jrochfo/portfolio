# jakerochford.com

Jake Rochford's portfolio: brand and motion design. Built with Astro,
plain CSS and vanilla JS, with GSAP for motion. No React and no
Tailwind, by design. The design-system rules and build conventions are
in [AGENTS.md](./AGENTS.md), which `CLAUDE.md` links to.

Live at **https://jakerochford.com**.

## Pages

| Route | What it is |
| :--- | :--- |
| `/` | The homepage, one long scroll. On phones it switches to a shorter phone layout (see below). |
| `/about/` | Bio, photo ring, resume / LinkedIn / email |
| `/documentation/` | Field notes on how the site gets built |
| `/documentation/looping-a-carousel/` | The first write-up |
| `/resume` | Opens the resume PDF. It's an HTML page so the visit shows up in analytics. |
| `/sitemap.xml` | Generated from `src/pages/`, so new pages are picked up automatically |

## Phone mode

Phones get their own shorter homepage instead of the desktop one
squeezed down:
- the hero turns into a vertical ring of photos
- a short work list (`MobileHome.astro`) replaces What I Do, Rebrand
  and Also Shipped
- Off the Clock becomes a swipeable deck

The site decides by device, not window width, so tablets and narrow
desktop windows get the responsive desktop site. To force either
version for one page load, add `?mobile=1` or `?mobile=0` to the URL.
The `PHONE_MODE_AUTO` flag in `src/layouts/Base.astro` turns automatic
detection on or off.

## Structure

```text
/
├── public/
│   ├── video/            looping work videos, WebM (VP9) + MP4 (H.264) pairs, by section
│   ├── og.png            link-preview image (1200×630)
│   ├── jake-rochford-resume.pdf
│   └── robots.txt, favicons
├── src/
│   ├── assets/           fonts, icons, logos, photos and work stills (optimized by Astro at build)
│   │   └── work/         one folder per homepage section
│   ├── components/       one component per homepage section, plus nav, footer and shared pieces
│   │   └── dev/          dev-only tools (never in the built site)
│   ├── data/             testimonials.ts (shared by the desktop and phone layouts)
│   ├── layouts/          Base.astro: <head> (meta, previews, theme), nav, footer, scroll reveals
│   ├── pages/            the routes above
│   ├── scripts/          shared JS (carousel, lazy media loading)
│   └── styles/           global.css: design tokens, type, texture, base styles
└── astro.config.mjs      site URL (used for canonical links, previews and the sitemap)
```

## Commands

Run from the project root:

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npx astro dev --background` | Start the dev server at `localhost:4321` in the background (`astro dev stop`, `status` and `logs` manage it) |
| `npx astro build` | Build the production site to `./dist/` |
| `npx astro preview` | Preview the production build locally |

## Dev-only tools

These are in `src/components/dev/`. They only render on the dev server,
and some are switched on by a flag in `Base.astro`:

- **DevPhonePreview:** a "Phone view" button that shows the phone
  layout in a 390×844 frame. Always on in dev.
- **FontAudition** (`FONT_AUDITION_ENABLED`): swap type families
  live. It needs a Google Fonts link for whatever's being tested.
- **FontVariationTuner** (`FONT_VARIATION_TUNER_ENABLED`): tune
  Fraunces' SOFT and WONK axes.
- **PaletteAudition** (`PALETTE_AUDITION_ENABLED`): the light/dark
  palette pairs that picked Butter Ceremonial.

## Media

- **Images** live in `src/assets/` and are converted to WebP at build
  time. The originals are also copied into `dist/`, but no page links
  to them, so visitors never download them.
- **Videos** live in `public/video/` as a WebM + MP4 pair. Each one
  loads only when it's about to play. ffmpeg is at
  `/opt/homebrew/bin/ffmpeg`, which isn't on the shell PATH. Source
  exports (4K HEVC) get re-encoded to 1080p H.264 + VP9. The
  exception is the 4:3 Off the Clock videos, which are encoded at
  1280×960, the largest they're ever shown (H.264 CRF 22, VP9 CRF 33).
- **Link preview** (`public/og.png`): if it needs updating, rebuild it
  as a 1200×630 page in the site's fonts and screenshot it.

## Hosting

- **Cloudflare Pages** (project `portfolio-3x6.pages.dev`) deploys
  automatically on every push to `main`.
- **Domain:** registered with Squarespace. Cloudflare manages its DNS.
  - Proxied CNAMEs point `jakerochford.com` and `www` to Pages.
  - A Redirect Rule sends `www` to the bare domain (301).
  - The Google Workspace email records (MX, SPF, DKIM) are in
    Cloudflare DNS. Keep them.
- **Analytics:** Cloudflare Web Analytics. No cookies, no banner.
- **Search:** Google Search Console is verified and the sitemap is
  submitted.
