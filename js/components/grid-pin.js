/** Keeps the thumb grid where it was first centred as it grows. */
export function createGridPin({ main, outer }) {
	let pinned = false;
	let margin = null; // measured once, reused

	return {
		pin() {
			if (pinned || !main) return;
			pinned = true;
			const before = outer.getBoundingClientRect().top + window.scrollY;
			main.style.justifyContent = "flex-start";
			if (margin === null) {
				const after = outer.getBoundingClientRect().top + window.scrollY;
				margin = before - after;
			}
			outer.style.marginTop = margin + "px";
		},
		unpin() {
			pinned = false;
			if (!main) return;
			main.style.justifyContent = "";
			outer.style.marginTop = "";
		},
	};
}
