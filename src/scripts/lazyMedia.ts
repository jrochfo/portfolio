// Defers image/poster loading until an element is actually near the
// viewport — extracted from Also Shipped's carousel (see git history)
// so Off The Clock's wells can use the exact same technique instead of
// a second implementation. Looks for the same data-* convention in
// both places: img[data-src], source[data-srcset], video[data-poster].
// rootMargin gives it a head start so loading finishes before the
// element is actually scrolled into view, rather than popping in.
export function wireImageLazyLoad(root: HTMLElement, rootMargin = '200px') {
	const images = [...root.querySelectorAll<HTMLImageElement>('img[data-src]')];
	const sources = [...root.querySelectorAll<HTMLSourceElement>('source[data-srcset]')];
	const videosWithPoster = [...root.querySelectorAll<HTMLVideoElement>('video[data-poster]')];

	if (images.length === 0 && sources.length === 0 && videosWithPoster.length === 0) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			sources.forEach((source) => {
				const srcset = source.dataset.srcset;
				if (srcset) source.srcset = srcset;
			});
			images.forEach((img) => {
				const src = img.dataset.src;
				if (src) img.src = src;
			});
			videosWithPoster.forEach((video) => {
				const poster = video.dataset.poster;
				if (poster) video.poster = poster;
			});
			observer.disconnect();
		},
		{ rootMargin },
	);
	observer.observe(root);
}
