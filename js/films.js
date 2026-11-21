import { config } from "./config.js";
import { createGalleryApi } from "./api/gallery.js";
// import { createLazyLoader } from "./utils/lazy.js";
import { initMasonry } from "./components/masonry.js";
import { initArrows } from "./components/arrows.js";
import { initVideoPlayer } from "./components/video-player.js";
import { initThumbnails } from "./components/thumbnails.js";
import { initSwiperGallery } from "./components/swiper-gallery.js";
import { createScrollIntent } from "./utils/scroll-intent.js";

const root = document.getElementById("films-gallery");
if (!root) throw new Error("films-gallery markup missing");

const api = createGalleryApi({ ...config, startOffset: config.firstBatch });

const player = initVideoPlayer();

// Masonry container is #thumbs, not #films-gallery.
const masonryEl = root.querySelector("#thumbs");
let masonry = null;

masonry = masonryEl ? initMasonry(masonryEl) : null;

// Swiper first — arrows need the instance.
const gallery = initSwiperGallery({ root, player, loop: false });

// Arrows after Swiper exists.
const arrows = initArrows(root, gallery);
arrows?.attach();
gallery.swiper.on("init resize", () => arrows?.refreshRects());

gallery.swiper.on("slideChange", (sw) => gallery.syncURL(sw.realIndex + 1)); // 1 based

const thumbs = initThumbnails({
	root,
	api,
	masonry,
	player,
	onSelect: (index) => {
		gallery.slideTo(index);
		gallery.syncURL(index);
		toggleView("slideshow");
	},
});

/* ---------- View toggle ---------- */

const showAllBtn = root.querySelector("#load-more-thumbnails");
const showSlideBtn = root.querySelector("#show-slider");
const swiperOuter = root.querySelector("#swiper-outer");
const swiperWrap = root.querySelector("#swiper-wrapper");
// const thumbsOuter = root.querySelector("#thumbs-outer");

function toggleView(mode) {
	const isSlideshow = mode === "slideshow";

	root.querySelector(".swiper")?.classList.toggle("hidden", !isSlideshow);
	swiperWrap?.classList.toggle("hide", !isSlideshow);
	swiperOuter?.classList.toggle("hide", !isSlideshow);
	thumbs.container.classList.toggle("visible", !isSlideshow);
	// thumbsOuter?.classList.toggle("flex", !isSlideshow);

	if (showAllBtn)
		showAllBtn.textContent = isSlideshow ? "SHOW ALL" : "BACK TO SLIDESHOW";
	if (isSlideshow) gallery.update();

	requestAnimationFrame(() => {
		if (!isSlideshow) {
			thumbs.revealPosters(); // help with loading

			try {
				const m = masonry?.ensure();
				m?.layout();
			} catch (e) {
				console.error("masonry failed", e);
			}
			player.bindThumbs(config.firstBatch);
		}
	});
}

showAllBtn?.addEventListener("click", () => {
	const goingToThumbs = !thumbs.container.classList.contains("visible");
	toggleView(goingToThumbs ? "thumbs" : "slideshow");
});

showSlideBtn?.addEventListener("click", () => {
	showSlideBtn.style.display = "none";
	toggleView("slideshow");
});

/* ---------- Infinite scroll ---------- */

const intent = createScrollIntent({
	isActive: () => thumbs.container.classList.contains("visible"),
	onNearBottom: async () => {
		const h = () => document.documentElement.scrollHeight;
		const before = h();
		console.log("fetch", {
			y: scrollY,
			before,
			left: before - (scrollY + innerHeight),
		});
		await thumbs.loadMore();
		console.log("after", { after: h(), left: h() - (scrollY + innerHeight) });
		if (api.done) intent.stop();
	},
	threshold: Math.min(config.scrollThreshold, window.innerHeight * 0.5),
});

window.addEventListener("resize", () => gallery?.update(), { passive: true });

/* ---------- Slide info hover ---------- */

const slideInfo = document.getElementById("slide-info");
const slideDesc = document.getElementById("gallery-description");
if (slideInfo && slideDesc) {
	slideInfo.addEventListener("mouseover", () => {
		slideDesc.style.visibility = "visible";
		slideDesc.style.opacity = 1;
	});
	slideInfo.addEventListener("mouseout", () => {
		slideDesc.style.visibility = "hidden";
		slideDesc.style.opacity = 0;
	});
}

/* ---------- Global play button ---------- */

document.addEventListener("click", (e) => {
	const btn = e.target.closest(".video-play");
	if (!btn) return;
	const video = btn.closest(".swiper-slide")?.querySelector("video");
	if (!video) return;
	video.play().catch(() => {});
	btn.style.display = "none";
});

gallery?.updateSlideInfo();
