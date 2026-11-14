document.addEventListener("DOMContentLoaded", function () {
    const el = document.getElementById("shop-swiper");
    if (!el || typeof Swiper === "undefined") return;

    const currentSlideEl = document.getElementById("current-slide");
    const totalSlidesEl = document.getElementById("total-slides");

    const swiper = new Swiper(el, {
        loop: false,
        lazy: true,
        preloadImages: false,
        slidesPerView: 1,
        spaceBetween: 0,
        grabCursor: true,
        simulateTouch: true,
        // freeMode: false,
        // freeModeMomentum: false,
        // touchStartPreventDefault: false,
        watchSlidesProgress: true,
        navigation: {
            nextEl: "#swiper-outer .swiper-button-next",
            prevEl: "#swiper-outer .swiper-button-prev",
        },
        keyboard: { enabled: true, onlyInViewport: false },
        on: {
            init: function () {
                this.update();
                if (totalSlidesEl)
                    totalSlidesEl.textContent = this.slides.length;
                if (currentSlideEl)
                    currentSlideEl.textContent = this.realIndex + 1;
            },
            slideChange: function () {
                if (currentSlideEl)
                    currentSlideEl.textContent = this.realIndex + 1;
            },
            click: function (s, e) {
                const slide = e.target.closest(".swiper-slide");
                const link = slide && slide.querySelector("a");
                if (link && s.allowClick) window.location.href = link.href;
            },
        },
    });

    /* Arrow follow — same as folio, scoped to the shop wrapper. */
    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function getResponsiveDefaults() {
        const w = window.innerWidth;
        if (w <= 375) return { left: "-9vw", right: "-9vw", top: "50%" };
        if (w <= 768) return { left: "-5vw", right: "-5vw", top: "50%" };
        if (w <= 1024) return { left: "-5.5vw", right: "-5.5vw", top: "50%" };
        if (w <= 1440) return { left: "-2vw", right: "-2vw", top: "50%" };
        return { left: "-1.5vw", right: "-1.5vw", top: "50%" };
    }

    const prevBtn = document.querySelector("#swiper-outer .swiper-button-prev");
    const nextBtn = document.querySelector("#swiper-outer .swiper-button-next");

    function setButtonPositions() {
        const { left, right, top } = getResponsiveDefaults();
        if (prevBtn) {
            prevBtn.style.left = left;
            prevBtn.style.top = top;
        }
        if (nextBtn) {
            nextBtn.style.right = right;
            nextBtn.style.top = top;
        }
    }
    setButtonPositions();
    window.addEventListener("resize", setButtonPositions);

    function moveArrow(e, element, originalX, originalY, reverse = false) {
        if (!element || typeof gsap === "undefined") return;
        const near =
            Math.abs(e.clientX - originalX) < Math.sqrt(2) * 100 &&
            Math.abs(e.clientY - originalY) < Math.sqrt(2) * 100;

        if (near) {
            gsap.to(element, {
                duration: 0.3,
                x: clamp((e.clientX - originalX) * 0.2, -50, 50),
                y: clamp((e.clientY - originalY) * 0.2, -50, 50),
            });
        } else {
            const { left, right, top } = getResponsiveDefaults();
            gsap.to(element, {
                duration: 0.3,
                x: 0,
                y: 0,
                left: reverse ? "auto" : left,
                right: reverse ? right : "auto",
                top,
            });
        }
    }

    if (prevBtn && nextBtn) {
        const prevRect = prevBtn.getBoundingClientRect();
        const nextRect = nextBtn.getBoundingClientRect();
        window.addEventListener("mousemove", (e) => {
            moveArrow(e, prevBtn, prevRect.left, prevRect.top);
            moveArrow(e, nextBtn, nextRect.left, nextRect.top, true);
        });
    }
});
