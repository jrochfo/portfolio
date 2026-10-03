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

// Apple devices — Safari on a Mac, and every browser on iPhone/iPad (they
// all run on Safari's engine) — get the H.264 MP4 first: it's their
// native, hardware-decoded format. Given a WebM first, iPhone Safari
// would sometimes pick it and then fail to play it, leaving just the
// poster. Everyone else gets the (smaller) VP9 WebM first.
const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
export const prefersMp4 = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Android/.test(ua);

// Adds a video's sources in the right order for this device and starts
// loading it. Skips any that are missing.
export function setVideoSources(video: HTMLVideoElement, webm?: string, mp4?: string) {
	const pairs: [string | undefined, string][] = [
		[webm, 'video/webm'],
		[mp4, 'video/mp4'],
	];
	if (prefersMp4) pairs.reverse();
	for (const [src, type] of pairs) {
		if (!src) continue;
		const source = document.createElement('source');
		source.src = src;
		source.type = type;
		video.appendChild(source);
	}
	video.load();
}

// For videos whose <source>s are already in the markup (WebM first):
// moves the MP4 to the front on Apple devices. Call before they load.
export function orderVideoSources(video: HTMLVideoElement) {
	if (!prefersMp4) return;
	const mp4 = video.querySelector('source[type="video/mp4"]');
	if (mp4 && video.firstElementChild !== mp4) video.prepend(mp4);
}
