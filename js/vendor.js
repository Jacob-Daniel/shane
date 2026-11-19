/**
 * Re-export the UMD globals as ES module bindings.
 *
 * Swiper, GSAP and Masonry are enqueued as classic scripts in functions.php
 * and attach themselves to window. Modules are deferred, so those scripts
 * have already run by the time this file evaluates.
 *
 * If a lib is missing we throw a clear error rather than exporting undefined,
 * which otherwise surfaces as a confusing "X is not a constructor" deep in a
 * component.
 */

function requireGlobal(name) {
	const value = window[name];
	if (!value) {
		throw new Error(
			`[films] window.${name} is missing. Check that the CDN script is ` +
				`enqueued before main.js and that it loaded successfully.`,
		);
	}
	return value;
}

export const Swiper = requireGlobal("Swiper");
export const gsap = requireGlobal("gsap");
export const Masonry = window.Masonry ?? null;
