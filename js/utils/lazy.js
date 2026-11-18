/**
 * Observe elements carrying data-src and swap it into src when near viewport.
 * Works for <video> and <img>. Unobserves after firing — never re-loads.
 */
export function createLazyLoader({
    rootMargin = "200px 0px",
    threshold = 0.01,
} = {}) {
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const node = entry.target;
                observer.unobserve(node);

                const src = node.dataset.src;
                if (!src) continue;

                node.src = src;
                delete node.dataset.src;

                if (node.tagName === "VIDEO") node.load();
            }
        },
        { rootMargin, threshold },
    );

    return {
        observe: (node) => observer.observe(node),
        unobserve: (node) => observer.unobserve(node),
        disconnect: () => observer.disconnect(),
    };
}
