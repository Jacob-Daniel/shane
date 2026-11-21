import { createLazyLoader } from "../utils/lazy.js";
import { el, PLAY_ICON } from "../utils/dom.js";
import { config } from "../config.js";

export function initThumbnails({ root, api, masonry, player, onSelect }) {
    const container = root.querySelector(".thumbs");
    if (!container) return null;

    const lazy = createLazyLoader({ rootMargin: config.lazyRootMargin });

    function build(item, position) {
        const index = item.index;

        const video = el("video", {
            class: "vid-block lazy-vid",
            preload: "none",
            muted: true,
            loop: true,
            playsInline: true,
            dataset: { src: item.url },
        });
        // if (item.poster) video.poster = item.poster;

        if (item.thumb) {
            video.poster = item.thumb;
            const img = new Image();
            img.onload = () => masonry?.layout();
            img.src = item.thumb;
        }

        lazy.observe(video);
        player?.bindThumb(video);

        const play = el("span", { class: "video-play", html: PLAY_ICON });
        const overlay = el("div", { class: "video-overlay" }, [play, video]);

        return el(
            "li",
            {
                class: "thumb-item",
                dataset: { index: String(index) },
                "aria-label": String(index),
            },
            [overlay],
        );
    }

    function append(items) {
        const seen = new Set(
            [...container.querySelectorAll(".thumb-item")].map(
                (li) => li.dataset.index,
            ),
        );
        const fresh = items.filter((it) => !seen.has(String(it.index)));
        if (!fresh.length) return [];

        const nodes = fresh.map(build);
        masonry?.append(nodes);

        return nodes;
    }

    async function loadMore() {
        const items = await api.next();
        const nodes = append(items);
        await Promise.all(
            nodes.map((li) => {
                const v = li.querySelector("video");
                return new Promise((res) => {
                    if (!v?.poster) return res();
                    const img = new Image();
                    img.onload = img.onerror = res;
                    img.src = v.poster;
                });
            }),
        );
        masonry?.layout();
        return nodes;
    }

    function revealPosters() {
        container.querySelectorAll("video[data-poster]").forEach((v) => {
            const url = v.dataset.poster;
            delete v.dataset.poster;
            const img = new Image();
            img.onload = () => {
                v.poster = url;
                masonry?.layout();
            };
            img.src = url;
        });
    }

    // Delegated once — survives every append.
    container.addEventListener("click", (e) => {
        if (e.target.closest(".video-play")) return;
        const thumb = e.target.closest(".thumbs li");
        if (!thumb || !container.contains(thumb)) return;
        const index = parseInt(thumb.dataset.index, 10);
        if (Number.isNaN(index)) return;
        onSelect?.(index);
    });

    return {
        append,
        loadMore,
        revealPosters,
        container,
        destroy() {
            lazy.disconnect();
        },
    };
}
