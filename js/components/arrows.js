import { gsap } from "../vendor.js";
import { clamp } from "../utils/dom.js";
import { config } from "../config.js";

const { sm, md, lg, xl } = config.breakpoints;

function defaults() {
    const w = window.innerWidth;
    if (w <= sm) return { left: "-9vw", right: "-9vw", top: "50%" };
    if (w <= md) return { left: "-5vw", right: "-5vw", top: "50%" };
    if (w <= lg) return { left: "-5.5vw", right: "-5.5vw", top: "50%" };
    if (w <= xl) return { left: "-2vw", right: "-2vw", top: "50%" };
    return { left: "-1.5vw", right: "-1.5vw", top: "50%" };
}

export function initArrows(root) {
    const prev = root.querySelector(".swiper-button-prev");
    const next = root.querySelector(".swiper-button-next");
    if (!prev || !next) return null;

    function place() {
        const d = defaults();
        prev.style.left = d.left;
        prev.style.top = d.top;
        next.style.right = d.right;
        next.style.top = d.top;
    }
    place();

    // Cache rects once — they were captured inside Swiper's init before.
    let prevRect = prev.getBoundingClientRect();
    let nextRect = next.getBoundingClientRect();

    function refreshRects() {
        prevRect = prev.getBoundingClientRect();
        nextRect = next.getBoundingClientRect();
    }

    function follow(e, node, rect, reverse) {
        const near =
            Math.abs(e.clientX - rect.left) < Math.SQRT2 * 100 &&
            Math.abs(e.clientY - rect.top) < Math.SQRT2 * 100;

        if (near) {
            gsap.to(node, {
                duration: 0.3,
                x: clamp((e.clientX - rect.left) * 0.5, -50, 50),
                y: clamp((e.clientY - rect.top) * 0.5, -50, 50),
            });
            return;
        }

        const d = defaults();
        gsap.to(node, {
            duration: 0.3,
            x: 0,
            y: 0,
            left: reverse ? "auto" : d.left,
            right: reverse ? d.right : "auto",
            top: d.top,
        });
    }

    let queued = false;
    function onMove(e) {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            follow(e, prev, prevRect, false);
            follow(e, next, nextRect, true);
        });
    }

    let moveEvent = null;
    function attach() {
        if (moveEvent) return;
        moveEvent = onMove;
        window.addEventListener("mousemove", moveEvent, { passive: true });
    }
    function detach() {
        if (!moveEvent) return;
        window.removeEventListener("mousemove", moveEvent);
        moveEvent = null;
    }

    function onResize() {
        place();
        refreshRects();
    }
    window.addEventListener("resize", onResize, { passive: true });

    return {
        attach,
        detach,
        refreshRects,
        destroy() {
            detach();
            window.removeEventListener("resize", onResize);
        },
    };
}
