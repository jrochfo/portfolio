// Shared drag-to-advance-with-snap engine, extracted from What I Do's
// original card-strip (see git history) so Also Shipped's per-card
// carousels can reuse the exact same tested mechanic instead of a
// second implementation. Fully self-contained per instance (no
// module-level state) so multiple carousels can run independently on
// one page — What I Do has one, Also Shipped has one per project card.
//
// Desktop gets custom mouse-drag (native browsers don't drag-to-scroll
// on mouse input); mobile/touch gets free native touch-scroll +
// scroll-snap, so only the mouse listeners are added here.

export interface CarouselHandle {
	goTo(index: number): void;
	getActive(): number;
	destroy(): void;
}

export interface CarouselOptions {
	strip: HTMLElement;
	items: HTMLElement[];
	/** Left inset (e.g. scroll-padding) to measure snap offsets against. Defaults to 0. */
	inset?: () => number;
	onActiveChange?: (index: number) => void;
	/**
	 * Dragging past the last item scrubs continuously into the first
	 * (and past the first into the last), rather than stopping at the
	 * end. Implemented with a cloned "phantom" slide appended/prepended
	 * to each end — scrollLeft is a real browser API and simply cannot
	 * move past an element's actual boundary, so scrubbing past the end
	 * needs genuine (if throwaway) DOM content there to scroll into, not
	 * just a bigger number. Once the drag settles on a phantom, an
	 * invisible correction snaps scrollLeft to the real slide at the
	 * same visual position (phantom and real slide are pixel-identical
	 * clones, so the swap is imperceptible) and every reported index
	 * stays a real 0..items.length-1 value — callers never know phantoms
	 * exist. Desktop mouse-drag only; native touch-scroll doesn't run
	 * through this module at all, so a real swipe won't loop this way.
	 */
	loop?: boolean;
}

export function createCarousel(options: CarouselOptions): CarouselHandle {
	const { strip, items, onActiveChange } = options;
	const inset = options.inset ?? (() => 0);
	const loop = (options.loop ?? false) && items.length > 1;
	const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

	// Phantom slides: a clone of the last item prepended, a clone of the
	// first item appended. "DOM position" below means an index into
	// allSlides (phantoms included); "real index" means the
	// 0..items.length-1 value everything outside this module deals in.
	let leadPhantom: HTMLElement | null = null;
	let trailPhantom: HTMLElement | null = null;

	if (loop) {
		trailPhantom = items[0].cloneNode(true) as HTMLElement;
		markAsPhantom(trailPhantom);
		strip.appendChild(trailPhantom);

		leadPhantom = items[items.length - 1].cloneNode(true) as HTMLElement;
		markAsPhantom(leadPhantom);
		strip.insertBefore(leadPhantom, items[0]);
	}

	function markAsPhantom(el: HTMLElement) {
		el.setAttribute('aria-hidden', 'true');
		el.removeAttribute('role');
		el.removeAttribute('tabindex');
		el.removeAttribute('aria-label');
		el.removeAttribute('data-slide-index');
		// aria-hidden removes an element from the accessibility tree, but
		// doesn't by itself pull focusable descendants out of the Tab
		// order — cloned interactive children (e.g. a video slide's play
		// button) need tabindex="-1" explicitly, or a keyboard user can
		// still land sighted focus on something screen readers never
		// announced. No click listeners survive the clone either way
		// (cloneNode never copies them, and this runs before this
		// module's own listeners exist), so nothing here was ever wired
		// to do anything — this just closes the keyboard-focus gap.
		el.querySelectorAll<HTMLElement>('button, [href], [tabindex]').forEach((focusable) => {
			focusable.setAttribute('tabindex', '-1');
		});
	}

	const allSlides = leadPhantom && trailPhantom ? [leadPhantom, ...items, trailPhantom] : items;
	const domOffset = leadPhantom ? 1 : 0;

	function toRealIndex(domPos: number): number {
		if (!loop) return domPos;
		if (domPos <= 0) return items.length - 1; // lead phantom
		if (domPos >= allSlides.length - 1) return 0; // trail phantom
		return domPos - domOffset;
	}

	function toDomPos(realIndex: number): number {
		return loop ? realIndex + domOffset : realIndex;
	}

	function isPhantomDomPos(domPos: number): boolean {
		return loop && (domPos === 0 || domPos === allSlides.length - 1);
	}

	let active = 0;
	let suspendActiveTracking = false;
	let ticking = false;
	let isDown = false;
	let startX = 0;
	let lastX = 0;
	let startScrollLeft = 0;
	let dragStartDomPos = 0;
	let destroyed = false;
	let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;

	function setActive(realIndex: number) {
		if (realIndex === active) return;
		active = realIndex;
		onActiveChange?.(realIndex);
	}

	function slideOffsets() {
		const stripLeft = strip.getBoundingClientRect().left;
		const insetValue = inset();
		return allSlides.map((slide) => slide.getBoundingClientRect().left - stripLeft - insetValue);
	}

	function nearestDomPos(offsets: number[]) {
		let bestIndex = 0;
		let bestAbs = Infinity;
		offsets.forEach((offset, i) => {
			const abs = Math.abs(offset);
			if (abs < bestAbs) {
				bestAbs = abs;
				bestIndex = i;
			}
		});
		return bestIndex;
	}

	// After scrolling settles on a phantom (drag-driven or a plain
	// wheel/trackpad scroll that snapped there natively), silently
	// correct scrollLeft to the real slide occupying the same visual
	// position — same content, so nothing appears to move.
	function correctIfOnPhantom(domPos: number) {
		if (!isPhantomDomPos(domPos)) return;
		const realIndex = toRealIndex(domPos);
		const correctedDomPos = toDomPos(realIndex);
		const prevSnap = strip.style.scrollSnapType;
		strip.style.scrollSnapType = 'none';
		strip.scrollLeft = strip.scrollLeft + slideOffsets()[correctedDomPos];
		strip.style.scrollSnapType = prevSnap;
	}

	function updateActiveFromScroll() {
		if (allSlides.length === 0) return;
		const domPos = nearestDomPos(slideOffsets());
		setActive(toRealIndex(domPos));
	}

	function animateScrollTo(target: number, onComplete?: () => void) {
		const start = strip.scrollLeft;
		const change = target - start;

		if (reduceMotionQuery.matches || Math.abs(change) < 1) {
			strip.scrollLeft = target;
			onComplete?.();
			return;
		}

		const duration = 450;
		const startTime = performance.now();
		strip.style.scrollSnapType = 'none';

		function step(now: number) {
			if (destroyed) return;
			const t = Math.min((now - startTime) / duration, 1);
			const eased = 1 - Math.pow(1 - t, 4); // ease-out-quart
			strip.scrollLeft = start + change * eased;
			if (t < 1) {
				requestAnimationFrame(step);
			} else {
				strip.style.scrollSnapType = '';
				onComplete?.();
			}
		}
		requestAnimationFrame(step);
	}

	function goTo(realIndex: number) {
		const clamped = Math.max(0, Math.min(items.length - 1, realIndex));
		setActive(clamped);
		suspendActiveTracking = true;
		const target = strip.scrollLeft + slideOffsets()[toDomPos(clamped)];
		animateScrollTo(target, () => {
			suspendActiveTracking = false;
		});
	}

	const onScroll = () => {
		if (suspendActiveTracking) return;
		if (!ticking) {
			requestAnimationFrame(() => {
				updateActiveFromScroll();
				ticking = false;
			});
			ticking = true;
		}
		// Plain wheel/trackpad scrolling never goes through onMouseUp, so
		// it needs its own "has scrolling actually stopped" signal before
		// checking for a phantom to correct — debounced rather than the
		// native `scrollend` event, which some browsers still lack.
		if (loop) {
			clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => {
				if (!isDown) correctIfOnPhantom(nearestDomPos(slideOffsets()));
			}, 150);
		}
	};

	const onResize = () => updateActiveFromScroll();

	// Any deliberate drag reads as "go to the next/previous card" — users
	// grab-scrolling don't expect to have to drag halfway across a card
	// before it commits, the way a plain nearest-card snap would require.
	const DRAG_ADVANCE_THRESHOLD = 24;

	// A mouseup still fires a synthetic click afterward regardless of how
	// far the mouse moved in between — without this, any consumer with a
	// click handler on a slide (Also Shipped's lightbox trigger) opens
	// immediately after every drag. A small distinct threshold (much
	// smaller than DRAG_ADVANCE_THRESHOLD — even a drag too short to
	// advance the carousel is still not a click) swallows exactly that
	// one synthetic click via a capture-phase listener, which runs
	// before it can reach a child element's own click handler.
	const CLICK_SUPPRESS_THRESHOLD = 5;

	function suppressNextClick() {
		const handler = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			strip.removeEventListener('click', handler, true);
		};
		strip.addEventListener('click', handler, true);
	}

	const onMouseDown = (e: MouseEvent) => {
		isDown = true;
		strip.classList.add('is-dragging');
		// Scroll-snap fights programmatic scrollLeft changes mid-drag (each
		// assignment gets treated as a completed scroll and corrected back
		// toward a snap point) — suspend it until the drag ends, then ease
		// into the target card ourselves instead of letting native snap
		// handle the settle.
		strip.style.scrollSnapType = 'none';
		startX = e.pageX;
		lastX = e.pageX;
		startScrollLeft = strip.scrollLeft;
		dragStartDomPos = nearestDomPos(slideOffsets());
	};

	const onMouseUp = () => {
		if (!isDown) return;
		isDown = false;
		strip.classList.remove('is-dragging');

		// Raw pointer movement, not a scrollLeft delta: scrollLeft is
		// silently clamped by the browser at the strip's real scroll
		// boundary (the outer edge of a phantom, when looping), so a
		// real drag can measure as near-zero there even though the
		// pointer moved a lot — which used to mean neither the
		// advance-threshold nor the click suppression below ever fired
		// right at the edges.
		const dragDistance = startX - lastX;
		let targetDomPos = dragStartDomPos;

		if (Math.abs(dragDistance) > CLICK_SUPPRESS_THRESHOLD) {
			suppressNextClick();
		}

		if (Math.abs(dragDistance) > DRAG_ADVANCE_THRESHOLD) {
			// Snap to whichever slide the drag actually ended nearest to,
			// rather than always advancing by one — a big drag can skip
			// straight to a far slide in one motion instead of overshooting
			// past it and jittering back.
			targetDomPos = nearestDomPos(slideOffsets());
			if (targetDomPos === dragStartDomPos) {
				targetDomPos = dragStartDomPos + Math.sign(dragDistance);
			}
		}
		targetDomPos = Math.max(0, Math.min(allSlides.length - 1, targetDomPos));

		const offsets = slideOffsets();
		setActive(toRealIndex(targetDomPos));
		animateScrollTo(strip.scrollLeft + offsets[targetDomPos], () => {
			correctIfOnPhantom(targetDomPos);
		});
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!isDown) return;
		e.preventDefault();
		lastX = e.pageX;
		// A real drag scrubs into the phantom exactly like any other
		// slide — this is unchanged from the non-looping case; the
		// browser's own scrollLeft clamping now simply has real content
		// to clamp against one slide further in each direction.
		strip.scrollLeft = startScrollLeft - (e.pageX - startX);
	};

	strip.addEventListener('scroll', onScroll);
	window.addEventListener('resize', onResize);
	strip.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mouseup', onMouseUp);
	window.addEventListener('mousemove', onMouseMove);

	if (loop) {
		// Land on the real first slide, not wherever scrollLeft happens
		// to default to relative to the lead phantom now sitting before
		// it. slideOffsets() is always a delta from the *current*
		// scrollLeft (see every other use of it below) — adding rather
		// than assigning matters here in particular because some
		// browsers already auto-adjust scrollLeft on their own when
		// content is inserted before the current viewport (scroll
		// anchoring), so "current" isn't reliably 0 by this point.
		strip.scrollLeft = strip.scrollLeft + slideOffsets()[toDomPos(0)];
	}
	updateActiveFromScroll();

	return {
		goTo,
		getActive: () => active,
		destroy() {
			destroyed = true;
			clearTimeout(scrollEndTimer);
			strip.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			strip.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('mousemove', onMouseMove);
			leadPhantom?.remove();
			trailPhantom?.remove();
		},
	};
}
