// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	image: {
		// Needed to rasterize the AnimatedLogo ascii/terminal visual
		// (systems-1-scrub-3.svg) to webp — it's flat, hard-edged local
		// design art, not untrusted input, so the usual SVG-processing
		// risk doesn't apply here.
		dangerouslyProcessSVG: true,
	},
	// The dev toolbar's floating bar sat over the bottom of the page in
	// local previews (and the phone-view frame).
	devToolbar: {
		enabled: false,
	},
});
