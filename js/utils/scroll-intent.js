const EVENTS = ["scroll", "wheel", "touchmove"];

/** Calls onNearBottom on user scroll input while isActive() is true. */
export function createScrollIntent({ isActive, onNearBottom, threshold }) {
	let ticking = false;

	function handler() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(async () => {
			const near =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - threshold;
			try {
				if (isActive() && near) await onNearBottom();
			} finally {
				ticking = false;
			}
		});
	}

	EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));

	return {
		stop() {
			EVENTS.forEach((e) => window.removeEventListener(e, handler));
		},
	};
}
