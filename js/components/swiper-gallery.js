import { Swiper } from "../vendor.js";
import { config } from "../config.js";

export function initSwiperGallery({ root, player, onSlideChange }) {
    const container = root.querySelector(".swiper");
    if (!container) return null;

    const params = new URLSearchParams(window.location.search);
    const requested = parseInt(params.get("slide"), 10);

    const currentEl = document.getElementById("current-slide");
    const totalEl = document.getElementById("total-slides");

    const swiper = new Swiper(container, {
        loop: true,
        lazy: true,
        preloadImages: false,
        slidesPerView: 1,
        spaceBetween: 0,
        observer: true,
        slideToClickedSlide: true,
        navigation: {
            nextEl: root.querySelector(".swiper-button-next"),
            prevEl: root.querySelector(".swiper-button-prev"),
        },
        keyboard: { enabled: true, onlyInViewport: false },
        pagination: {
            el: root.querySelector(".swiper-pagination"),
            clickable: true,
        },
        on: {
            init(sw) {
                sw.update();
                if (totalEl) totalEl.textContent = sw.slides.length;
                if (currentEl) currentEl.textContent = sw.realIndex + 1;

                if (!Number.isNaN(requested) && requested > 0) {
                    sw.slideTo(requested - 1, 0, false);
                }

                const active = sw.slides[sw.activeIndex];
                if (active) {
                    player.bindSlide(active);
                    player.playNative(active);
                }
            },

            slideChange(sw) {
                if (currentEl) currentEl.textContent = sw.realIndex + 1;
                player.pauseAll();
                updateSlideInfo(sw);
                const active = sw.slides[sw.activeIndex];
                player.bindSlide(active);
                player.playNative(active);
            },

            slideChangeTransitionEnd(sw) {
                sw.update();
            },

            slideNextTransitionStart() {
                player.pauseAll();
            },
            slidePrevTransitionStart() {
                player.pauseAll();
            },
        },
    });

    function updateSlideInfo(sw) {
        const active = sw.slides[sw.activeIndex];
        const info = document.getElementById("slide-info");
        if (!active || !info) return;

        const heading = info.querySelector("h2");
        const body = info.querySelector("div");
        if (heading && active.dataset.title)
            heading.textContent = active.dataset.title;
        if (body && active.dataset.text) body.innerHTML = active.dataset.text;
    }

    function updateURL(index) {
        const url = new URL(window.location);
        url.searchParams.set("slide", index);
        window.history.pushState({}, "", url);
    }

    let ready = false;
    window.addEventListener(
        "load",
        () => {
            ready = true;
        },
        { once: true },
    );

    return {
        swiper,
        slideTo(index) {
            swiper.slideTo(index - 1, 500, false);
        },
        syncURL(index) {
            if (ready) updateURL(index);
        },
        updateSlideInfo: () => updateSlideInfo(swiper),
        update() {
            swiper.update();
        },
    };
}
