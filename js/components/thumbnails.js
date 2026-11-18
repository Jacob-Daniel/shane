import { createLazyLoader } from "../utils/lazy.js";
import { el, PLAY_ICON } from "../utils/dom.js";
import { config } from "../config.js";

export function initThumbnails({ root, api, masonry, player, onSelect }) {
    const container = root.querySelector(".thumbs");
    if (!container) return null;

    const lazy = createLazyLoader({ rootMargin: config.lazyRootMargin });
    let indexOffset = config.firstBatch;
    let offset = config.firstBatch;

    function build(item, position) {
        const index = indexOffset + position;

        const video = el("video", {
            class: "vid-block lazy-vid",
            preload: "none",
            muted: true,
            loop: true,
            playsInline: true,
            dataset: { src: item.url },
        });
        if (item.poster) video.poster = item.poster;

        lazy.observe(video);
        player?.bindThumb(video);

        const play = el("span", { class: "video-play", html: PLAY_ICON });
        const overlay = el("div", { class: "video-overlay" }, [play, video]);

        return el(
            "li",
            {
                class: "thumb-item",
                dataset: { index: String(index) },
                "aria-label": String(index - 1),
            },
            [overlay],
        );
    }

    function append(items) {
        if (!items.length) return [];
        const seen = new Set(
            [...container.querySelectorAll(".thumb-item")].map(
                (li) => li.dataset.index,
            ),
        );
        const fresh = items.filter((it) => !seen.has(String(it.index)));
        if (!fresh.length) return [];

        const nodes = fresh.map((item, i) => build(item, i));
        indexOffset += fresh.length;

        masonry?.append(nodes);

        nodes.forEach((node) => {
            const v = node.querySelector("video");
            if (v && !v.src) {
                v.src = v.dataset.src;
                v.load();
                v.addEventListener("loadedmetadata", () => masonry?.layout(), {
                    once: true,
                });
            }
        });

        return nodes;
    }

    async function loadMore() {
        const items = await api.next();
        return append(items);
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
        container,
        get count() {
            return offset;
        },
        destroy() {
            lazy.disconnect();
        },
    };
}
