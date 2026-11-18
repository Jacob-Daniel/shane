const YT_PAUSE = JSON.stringify({
    event: "command",
    func: "pauseVideo",
    args: [],
});
const VIMEO_PAUSE = JSON.stringify({ method: "pause" });

const EMBEDS = {
    youtube: (id) =>
        `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&enablejsapi=1`,
    vimeo: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&muted=0`,
};

export function initVideoPlayer() {
    const boundSlides = new WeakSet();
    const boundThumbs = new WeakSet();

    /* ---------- Iframe embeds ---------- */

    function loadEmbed(slide, { id, provider }) {
        const src = EMBEDS[provider]?.(id);
        const overlay = slide.querySelector(".video-overlay");
        if (!src || !overlay) return;

        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.frameBorder = "0";
        iframe.allow =
            "autoplay; encrypted-media; fullscreen; picture-in-picture";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";

        overlay.replaceChildren(iframe);

        iframe.addEventListener(
            "load",
            () => {
                const { offsetWidth: w, offsetHeight: h } = iframe;
                iframe.classList.add(h > w ? "portrait" : "landscape");
            },
            { once: true },
        );
    }

    function bindSlide(slide) {
        if (!slide || boundSlides.has(slide)) return;
        const thumb = slide.querySelector(".video-overlay span[data-id]");
        if (!thumb) return;

        boundSlides.add(slide);
        const info = {
            id: thumb.dataset.id,
            provider: thumb.classList.contains("ytb-video")
                ? "youtube"
                : thumb.classList.contains("vmeo-video")
                  ? "vimeo"
                  : null,
        };

        thumb.addEventListener("click", () => {
            slide.classList.add("show-video");
            loadEmbed(slide, info);
        });
    }

    function pauseEmbeds() {
        document
            .querySelectorAll(".swiper-slide .video-overlay iframe")
            .forEach((iframe) => {
                const src = iframe.src || "";
                const msg = src.includes("youtube.com")
                    ? YT_PAUSE
                    : src.includes("vimeo.com")
                      ? VIMEO_PAUSE
                      : null;
                if (!msg) return;
                try {
                    iframe.contentWindow?.postMessage(msg, "*");
                } catch {
                    /* cross-origin: ignore */
                }
            });
    }

    /* ---------- Native <video> ---------- */

    function pauseNative() {
        document
            .querySelectorAll(".swiper-slide video")
            .forEach((v) => v.pause());
    }

    function playNative(slide) {
        const v = slide?.querySelector("video");
        if (!v) return;

        v.setAttribute("preload", "auto");
        v.play().catch(() => {});
    }

    function pauseAll() {
        pauseEmbeds();
        pauseNative();
    }

    /* ---------- Thumbnails: hover-to-play ---------- */

    function hydrate(video) {
        if (video.dataset.loaded === "1" || !video.dataset.src) return;
        video.dataset.loaded = "1";
        video.src = video.dataset.src;
        video.dataset.src = "";
        video.load();
    }

    function bindThumb(video) {
        if (!video || boundThumbs.has(video)) return;
        boundThumbs.add(video);

        video.addEventListener("mouseenter", () => {
            hydrate(video);
            const p = video.play();
            if (p) p.catch(() => {});
            video.muted = false;
        });

        video.addEventListener("mouseleave", () => {
            video.pause();
            video.muted = true;
            video.currentTime = 0;
        });
    }

    /** Bind every thumb video currently in the DOM (or just the first N). */
    function bindThumbs(limit) {
        const all = document.querySelectorAll("#thumbs video.lazy-vid");
        const list = limit ? Array.from(all).slice(0, limit) : all;
        list.forEach(bindThumb);
    }

    return { bindSlide, bindThumb, bindThumbs, pauseAll, playNative };
}
