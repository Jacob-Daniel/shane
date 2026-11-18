import { Masonry } from "../vendor.js";
import { config } from "../config.js";

export function initMasonry(root) {
    const container = root.matches(".thumbs")
        ? root
        : root.querySelector(".thumbs");
    if (!container) return null;

    let instance = null;

    function enabled() {
        return window.innerWidth >= config.breakpoints.md;
    }

    function animateIn(elements) {
        console.log("animateIn", elements.length, typeof gsap);

        gsap.from(elements, {
            opacity: 0,
            scale: 0.92,
            y: 24,
            duration: 0.5,
            stagger: 0.04,
            ease: "power2.out",
            clearProps: "transform,opacity",
        });
    }

    function build() {
        if (!enabled()) return null;
        if (!container.clientWidth) return null;

        container.querySelectorAll("img").forEach((img) => {
            if (!img.complete) {
                img.addEventListener("load", () => instance?.layout(), {
                    once: true,
                });
            }
        });

        const m = new Masonry(container, {
            itemSelector: ".thumb-item",
            columnWidth: ".thumb-item",
            gutter: 10,
            fitWidth: true,
            transitionDuration: 400,
            horizontalOrder: true,
        });

        // Let the browser paint the laid-out grid first, then animate in.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                animateIn(container.querySelectorAll(".thumb-item"));
            });
        });

        return m;
    }

    function ensure() {
        if (!enabled()) return null;
        if (!instance) instance = build();
        return instance;
    }
    function append(elements) {
        if (!elements || !elements.length) return;
        const m = ensure();
        if (!m) {
            container.append(...elements);
            return;
        }
        m.appended(elements);
        animateIn(elements);
    }

    function layout() {
        if (instance) instance.layout();
    }

    let raf = 0;
    function onResize() {
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            if (enabled()) {
                if (!instance) instance = build();
                else instance.layout();
            } else if (instance) {
                instance.destroy();
                instance = null;
                container.querySelectorAll(".thumb-item").forEach((el) => {
                    el.style.position = "";
                    el.style.top = "";
                    el.style.left = "";
                });
            }
        });
    }
    window.addEventListener("resize", onResize, { passive: true });
    console.log("build", container.clientWidth, container.children.length);

    return {
        ensure,
        append,
        layout,
        destroy() {
            window.removeEventListener("resize", onResize);
            if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
            if (instance) instance.destroy();
            instance = null;
        },
    };
}
