import { initArrows } from "./components/arrows.js";
import { initSwiperGallery } from "./components/swiper-gallery.js";
import { initPortfolioThumbs } from "./components/portfolio-thumbs.js";
import { createGridPin } from "./components/grid-pin.js";
import { createScrollIntent } from "./utils/scroll-intent.js";
import { config } from "./config.js";
import { createGalleryApi } from "./api/gallery.js";

const root = document.getElementById("portfolio-gallery");
if (!root) throw new Error("portfolio-gallery markup missing");

const gallery = initSwiperGallery({ root, loop: false });
if (!gallery) throw new Error("portfolio swiper missing");
const { swiper } = gallery;

const arrows = initArrows(root);
arrows?.attach();
swiper.on("resize", () => arrows?.refreshRects());

/* ---------- Load only the active slide ± 1 ---------- */

function loadNear(sw) {
	for (let i = sw.activeIndex - 1; i <= sw.activeIndex + 1; i++) {
		sw.slides[i]?.querySelectorAll("img[data-src]").forEach((img) => {
			if (img.dataset.srcset) img.srcset = img.dataset.srcset;
			img.src = img.dataset.src;
			delete img.dataset.src;
			delete img.dataset.srcset;
		});
	}
}
swiper.on("slideChange", loadNear);
loadNear(swiper);

swiper.on("slideChange", (sw) => gallery.syncURL(sw.realIndex + 1));

/* ---------- View toggle ---------- */

const btn = root.querySelector("#load-more-thumbnails");
const swiperEl = root.querySelector("#swiper");
const swiperWrap = root.querySelector("#swiper-wrapper");
const swiperOuter = root.querySelector("#swiper-outer");
const thumbsOuter = root.querySelector("#thumbs-outer");
const thumbsEl = root.querySelector("#thumbs");

const pin = createGridPin({ main: root, outer: thumbsOuter });
const TEXT_SHOW_ALL = "SHOW ALL";
const TEXT_BACK = "BACK TO SLIDESHOW";

const api = createGalleryApi({ ...config, startOffset: config.firstBatch });

const thumbs = initPortfolioThumbs({
	container: thumbsEl,
	api,
	onBeforeAppend: () => pin.pin(),
	onSelect: (index) => {
		gallery.slideTo(index);
		showSlideshow();
	},
});

function showSlideshow() {
	pin.unpin();
	btn.textContent = TEXT_SHOW_ALL;
	swiperEl.classList.remove("hidden");
	swiperWrap.classList.remove("hide");
	swiperOuter.classList.remove("hide");
	thumbsEl.classList.remove("visible");
	thumbsOuter.classList.remove("flex");
	window.scrollTo(0, 0);
	setTimeout(() => swiper.update(), 50);
}

function showGrid() {
	btn.textContent = TEXT_BACK;
	swiperEl.classList.add("hidden");
	swiperWrap.classList.add("hide");
	swiperOuter.classList.add("hide");
	thumbsEl.classList.add("visible");
	thumbsOuter.classList.add("flex");
	if (thumbs.loaded > 0) pin.pin(); // already extended on a previous visit
}

function playActive(sw) {
	sw.slides.forEach((s) => s.querySelector("video")?.pause());
	sw.slides[sw.activeIndex]
		?.querySelector("video")
		?.play()
		.catch(() => {});
}
swiper.on("slideChange", playActive);
playActive(swiper);

btn.addEventListener("click", () =>
	btn.textContent.trim() === TEXT_BACK ? showSlideshow() : showGrid(),
);

/* ---------- Infinite scroll ---------- */

const intent = createScrollIntent({
	isActive: () => thumbsEl.classList.contains("visible"),
	onNearBottom: () =>
		thumbs
			.loadMore()
			.then(() => api.done && intent.stop())
			.catch(console.error),
	threshold: Math.min(config.scrollThreshold, window.innerHeight),
});
