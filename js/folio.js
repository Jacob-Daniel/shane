document.addEventListener("DOMContentLoaded", function () {
    const loadMoreBtn = document.getElementById("load-more-thumbnails");
    const swiperOuter = document.getElementById("swiper-outer");
    const swiperContainer = document.getElementById("swiper");
    const swiperWrapper = document.getElementById("swiper-wrapper");
    const thumbsOuter = document.getElementById("thumbs-outer");
    const thumbsContainer = document.getElementById("thumbs");

    // Bail if the portfolio gallery markup isn't on this page.
    if (!swiperContainer || !thumbsContainer || !loadMoreBtn) return;

    const TEXT_SHOW_ALL = "SHOW ALL";
    const TEXT_BACK = "BACK TO SLIDESHOW";
    const batchSize = 6; // multiple of 3 keeps the 3-col grid tidy
    const initialCount =
        thumbsContainer.querySelectorAll("li.thumb-item").length;
    let offset = 0;
    let isPageLoaded = false;

    /* ---------- URL helpers (?slide= is 1-based) ---------- */

    function getSlideFromURL() {
        const n = parseInt(
            new URLSearchParams(window.location.search).get("slide"),
            10,
        );
        return Number.isNaN(n) || n < 1 ? 0 : n - 1; // 0-based index
    }

    function updateURL(slideNumber) {
        const url = new URL(window.location);
        url.searchParams.set("slide", slideNumber);
        window.history.pushState({}, "", url);
    }

    /* ---------- Responsive arrow positioning ---------- */

    function getResponsiveDefaults() {
        const w = window.innerWidth;
        if (w <= 375) return { left: "-9vw", right: "-9vw", top: "50%" };
        if (w <= 768) return { left: "-5vw", right: "-5vw", top: "50%" };
        if (w <= 1024) return { left: "-5.5vw", right: "-5.5vw", top: "50%" };
        if (w <= 1440) return { left: "-2vw", right: "-2vw", top: "50%" };
        return { left: "-1.5vw", right: "-1.5vw", top: "50%" };
    }

    function setButtonPositions() {
        const { left, right, top } = getResponsiveDefaults();
        const prev = document.querySelector(".swiper-button-prev");
        const next = document.querySelector(".swiper-button-next");
        if (prev) {
            prev.style.left = left;
            prev.style.top = top;
        }
        if (next) {
            next.style.right = right;
            next.style.top = top;
        }
    }
    setButtonPositions();
    window.addEventListener("resize", setButtonPositions);

    /* ---------- Arrow follow (bound once) ---------- */

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function moveArrow(e, selector, originalX, originalY, reverse = false) {
        const element = document.querySelector(selector);
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

    function bindArrowFollow() {
        const prevButton = document.querySelector(".swiper-button-prev");
        const nextButton = document.querySelector(".swiper-button-next");
        if (!prevButton || !nextButton) return;

        const prevRect = prevButton.getBoundingClientRect();
        const nextRect = nextButton.getBoundingClientRect();

        window.addEventListener("mousemove", (e) => {
            moveArrow(e, ".swiper-button-prev", prevRect.left, prevRect.top);
            moveArrow(
                e,
                ".swiper-button-next",
                nextRect.left,
                nextRect.top,
                true,
            );
        });
    }

    /* ---------- Swiper ---------- */

    const currentSlideEl = document.getElementById("current-slide");
    const totalSlidesEl = document.getElementById("total-slides");

    function createSwiper(initialSlide) {
        return new Swiper(".swiper", {
            loop: false,
            lazy: true,
            preloadImages: false,
            slidesPerView: 1,
            spaceBetween: 0,
            initialSlide,
            observer: true,
            observerParents: true,
            watchSlidesVisibility: true,
            watchSlidesProgress: true,
            navigation: {
                nextEl: "#swiper-button-next",
                prevEl: "#swiper-button-prev",
            },
            keyboard: { enabled: true, onlyInViewport: false },
            pagination: { el: ".swiper-pagination", clickable: true },
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
                    if (isPageLoaded) updateURL(this.activeIndex + 1);
                },
                slideChangeTransitionEnd: function () {
                    this.update();
                },
            },
        });
    }

    let swiper = createSwiper(getSlideFromURL());
    bindArrowFollow();

    window.addEventListener("load", () => {
        isPageLoaded = true;
    });

    window.addEventListener("orientationchange", function () {
        if (!swiper) return;
        const currentIndex = swiper.activeIndex;
        swiper.destroy(true, true);
        requestAnimationFrame(function () {
            swiper = createSwiper(currentIndex);
            setTimeout(() => {
                swiper.update();
                swiper.updateSlides();
                swiper.updateSize();
            }, 100);
        });
    });

    /* ---------- Slideshow <-> grid toggle ---------- */

    /* Keep the grid where it was first centred: as it grows, flex centring
       would otherwise shift it upwards. Pin switches main to top alignment
       and replaces the lost centring offset with a margin. */
    const mainEl = thumbsContainer.closest("main");
    let pinned = false;
    let pinMargin = null; // measured once, reused on every later visit

    function pinGridPosition() {
        if (pinned || !mainEl) return;
        pinned = true;
        const before = thumbsOuter.getBoundingClientRect().top + window.scrollY;
        mainEl.style.justifyContent = "flex-start";
        if (pinMargin === null) {
            const after =
                thumbsOuter.getBoundingClientRect().top + window.scrollY;
            pinMargin = before - after;
        }
        thumbsOuter.style.marginTop = pinMargin + "px";
    }

    function unpinGridPosition() {
        pinned = false;
        if (!mainEl) return;
        mainEl.style.justifyContent = "";
        thumbsOuter.style.marginTop = "";
    }

    function showSlideshow() {
        unpinGridPosition();
        loadMoreBtn.textContent = TEXT_SHOW_ALL;
        swiperContainer.classList.remove("hidden");
        swiperWrapper.classList.remove("hide");
        swiperOuter.classList.remove("hide");
        thumbsContainer.classList.remove("visible");
        thumbsOuter.classList.remove("flex");
        window.scrollTo(0, 0);
        setTimeout(() => swiper.update(), 50);
    }

    function showGrid() {
        loadMoreBtn.textContent = TEXT_BACK;
        swiperContainer.classList.add("hidden");
        swiperWrapper.classList.add("hide");
        swiperOuter.classList.add("hide");
        thumbsContainer.classList.add("visible");
        thumbsOuter.classList.add("flex");
        if (offset > 0) pinGridPosition(); // already extended on a previous visit
    }

    loadMoreBtn.addEventListener("click", () => {
        if (loadMoreBtn.textContent.trim() === TEXT_BACK) showSlideshow();
        else showGrid();
    });

    /* ---------- Thumbnail clicks (delegated) ---------- */

    thumbsContainer.addEventListener("click", (e) => {
        const thumb = e.target.closest("li.thumb-item");
        if (!thumb) return;

        const slideNumber = parseInt(thumb.dataset.index, 10);
        if (Number.isNaN(slideNumber)) return;

        swiper.slideTo(slideNumber - 1, 0, false);
        updateURL(slideNumber);
        showSlideshow();
    });

    /* ---------- Thumb builder ---------- */

    function getVideoPlayIcon() {
        return '<svg version="1.1" id="Play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
    }

    function buildThumb(media, slideNumber) {
        const li = document.createElement("li");
        li.className = "thumb-item fade-in list-none flex";
        li.dataset.index = slideNumber;
        li.setAttribute("aria-label", String(slideNumber - 1));

        if (media.type === "image") {
            const img = document.createElement("img");
            img.className = "pointer";
            img.src = media.url;
            img.loading = "lazy";
            img.alt = media.alt || "";
            img.title = media.title || "";
            li.appendChild(img);
        } else if (media.type === "video") {
            const overlay = document.createElement("div");
            overlay.className = "video-overlay";

            const playIcon = document.createElement("span");
            playIcon.className = "video-play";
            playIcon.innerHTML = getVideoPlayIcon();

            const video = document.createElement("video");
            video.className = "vid-block";
            video.preload = "none";
            video.playsInline = true;
            video.muted = true;
            video.loop = true;
            if (media.thumbnail) video.poster = media.thumbnail;

            const source = document.createElement("source");
            source.src = media.url;
            source.type = "video/mp4";
            video.appendChild(source);

            overlay.append(playIcon, video);
            li.appendChild(overlay);
        }
        return li;
    }

    /* ---------- Infinite scroll (window scroll, user-triggered) ---------- */

    const NEAR_BOTTOM = 400;
    let ticking = false;
    let done = false;

    function gridIsOpen() {
        return thumbsContainer.classList.contains("visible");
    }

    function nearBottom() {
        return (
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - NEAR_BOTTOM
        );
    }

    // Only runs in response to user scroll input, never on open.
    function onScrollIntent() {
        if (ticking || done) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            if (gridIsOpen() && nearBottom()) loadMoreImages();
        });
    }

    // wheel/touchmove also fire when the page is already at the bottom
    // and can't scroll any further, which a scroll event would miss.
    ["scroll", "wheel", "touchmove"].forEach((evt) =>
        window.addEventListener(evt, onScrollIntent, { passive: true }),
    );

    function finishLoading() {
        done = true;
        ["scroll", "wheel", "touchmove"].forEach((evt) =>
            window.removeEventListener(evt, onScrollIntent),
        );
    }

    function loadMoreImages() {
        const items = window.remainingImages;
        if (!Array.isArray(items)) return finishLoading();

        const batch = items.slice(offset, offset + batchSize);
        if (!batch.length) return finishLoading();

        const fragment = document.createDocumentFragment();
        const added = [];

        batch.forEach((media, i) => {
            if (!media.url) return;
            // Thumbs 1..initialCount are server-rendered; continue from there.
            const li = buildThumb(media, initialCount + offset + i + 1);
            added.push(li);
            fragment.appendChild(li);
        });

        pinGridPosition();
        thumbsContainer.appendChild(fragment);
        offset += batch.length;

        requestAnimationFrame(() => {
            added.forEach((el, i) =>
                setTimeout(() => el.classList.add("fade-in-visible"), i * 80),
            );
        });

        if (offset >= items.length) finishLoading();
    }
});
