import { el, PLAY_ICON } from "../utils/dom.js";

export function initPortfolioThumbs({
	container,
	api,
	onSelect,
	onBeforeAppend,
}) {
	let loaded = 0;

	function build(media) {
		const li = el("li", {
			class: "thumb-item fade-in list-none flex",
			dataset: { index: String(media.index) },
			"aria-label": String(media.index - 1),
		});

		if (media.type === "image") {
			const img = el("img", { class: "pointer" });
			img.loading = "lazy";
			img.src = media.url;
			img.alt = media.alt || "";
			img.title = media.title || "";
			li.append(img);
		} else {
			const video = el("video", {
				class: "vid-block",
				preload: "none",
				muted: true,
				loop: true,
				playsInline: true,
			});
			video.muted = true; // must be set before play() for autoplay to be allowed
			video.autoplay = true;
			video.src = media.url; // no #t= fragment needed now
			if (media.thumbnail) video.poster = media.thumbnail;
			const play = el("span", { class: "video-play", html: PLAY_ICON });
			li.append(el("div", { class: "video-overlay" }, [play, video]));
		}
		return li;
	}

	/** Returns true while more items remain. */
	async function loadMore() {
		const items = await api.next();

		const seen = new Set(
			[...container.querySelectorAll(".thumb-item")].map(
				(li) => li.dataset.index,
			),
		);
		const nodes = items
			.filter((m) => m.url && !seen.has(String(m.index)))
			.map(build);
		if (!nodes.length) return nodes;

		onBeforeAppend?.();
		container.append(...nodes);
		loaded += nodes.length;

		requestAnimationFrame(() =>
			nodes.forEach((n, i) =>
				setTimeout(() => n.classList.add("fade-in-visible"), i * 80),
			),
		);

		// Resolve once images have a height, so the next scroll check sees the real page size.
		await Promise.all(
			nodes.map((li) => {
				const img = li.querySelector("img");
				return img && !img.complete
					? new Promise((r) => {
							img.onload = img.onerror = r;
						})
					: null;
			}),
		);
		return nodes;
	}

	// Delegated once, survives every append.
	container.addEventListener("click", (e) => {
		const li = e.target.closest("li.thumb-item");
		if (!li || !container.contains(li)) return;
		const index = parseInt(li.dataset.index, 10);
		if (!Number.isNaN(index)) onSelect?.(index);
	});

	return {
		loadMore,
		get loaded() {
			return loaded;
		},
	};
}
