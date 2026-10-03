import type { APIRoute } from 'astro';

// Every public page, for search engines. Built from the pages folder, so
// a new page is picked up automatically; files starting with _ (drafts)
// and the resume redirect are left out.
// Only the file names are used.
const pages = import.meta.glob(['./**/*.astro', '!./**/_*.astro', '!./**/_*/**']);
const SKIP = new Set(['/resume/']);

export const GET: APIRoute = ({ site }) => {
	const paths = Object.keys(pages)
		// Trailing slash, as Cloudflare Pages serves folder pages (and as
		// each page's canonical tag says).
		.map((file) => `${file.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/?index$/, '')}/`.replace(/^\/\/$/, '/'))
		.filter((path) => !SKIP.has(path))
		.sort();
	const urls = paths.map((path) => `\t<url><loc>${new URL(path, site)}</loc></url>`).join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
