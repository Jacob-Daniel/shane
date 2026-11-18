/**
 * fetch-films.js
 *
 * Films gallery: paginated WP REST fetching, IntersectionObserver video
 * lazy-loading, Swiper slideshow, and Masonry thumbnails.
 *
 * Expects `filmsGallery` from wp_localize_script:
 *   { endpoint: 'https://site/wp-json/films/v1/videos', nonce: '...', total: 42 }
 *
 * Expects markup: #swiper, #swiper-wrapper, #swiper-outer, #thumbs,
 * #thumbs-outer, #load-more-thumbnails, #show-slider, #slide-info,
 * #gallery-description, #total-slides, #current-slide.
 */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        /* ---------------------------------------------------------------
         * Element refs + bail
         * ------------------------------------------------------------- */

        const swiperOuter = document.getElementById("swiper-outer");
        const swiperContainer = document.getElementById("swiper");
        const swiperWrapper = document.getElementById("swiper-wrapper");
        const thumbsOuter = document.getElementById("thumbs-outer");
        const thumbsContainer = document.getElementById("thumbs");
        const showAllBtn = document.getElementById("load-more-thumbnails");
        const showSliderBtn = document.getElementById("show-slider");

        if (!swiperContainer || !thumbsContainer || !showAllBtn) return;

        const config = window.filmsGallery || {};
        const ENDPOINT = config.endpoint;
        const NONCE = config.nonce || "";
        const BATCH_SIZE = 5;
        const FIRST_BATCH_SIZE = 6;

        const urlParams = new URLSearchParams(window.location.search);
        const initialSlide = parseInt(urlParams.get("slide"), 10);

        let msnry = null;
        let isPageLoaded = false;

        /* ---------------------------------------------------------------
         * Fetch layer
         * ------------------------------------------------------------- */

        const api = {
            page: 1,
            perPage: BATCH_SIZE,
            totalPages: null,
            loading: false,
            done: false,
            cache: new Map(),

            async get(page) {
                if (this.cache.has(page)) return this.cache.get(page);
                if (!ENDPOINT) throw new Error("filmsGallery.endpoint missing");

                const url = new URL(ENDPOINT);
                url.searchParams.set("page", page);
                url.searchParams.set("per_page", this.perPage);

                const headers = { Accept: "application/json" };
                if (NONCE) headers["X-WP-Nonce"] = NONCE;

                const res = await fetch(url.toString(), {
                    headers,
                    credentials: "same-origin",
                });
                if (!res.ok) throw new Error("HTTP " + res.status);

                const totalPages = parseInt(
                    res.headers.get("X-WP-TotalPages") || "",
                    10,
                );
                if (!Number.isNaN(totalPages)) this.totalPages = totalPages;

                const data = await res.json();
                const items = Array.isArray(data) ? data : [];
                this.cache.set(page, items);
                return items;
            },

            /** Returns the next page of items, or [] when exhausted. */
            async next() {
                if (this.loading || this.done) return [];
                this.loading = true;
                try {
                    // First request is larger than the rest.
                    this.perPage =
                        this.page === 1 ? FIRST_BATCH_SIZE : BATCH_SIZE;

                    const items = await this.get(this.page);

                    if (
                        this.totalPages !== null &&
                        this.page >= this.totalPages
                    ) {
                        this.done = true;
                    }
                    if (!items.length) this.done = true;

                    this.page += 1;
                    return items;
                } finally {
                    this.loading = false;
                }
            },
        };

        /* ---------------------------------------------------------------
         * Video lazy-loading (single strategy)
         * ------------------------------------------------------------- */

        const videoObserver =
            "IntersectionObserver" in window
                ? new IntersectionObserver(
                      (entries) => {
                          entries.forEach((entry) => {
                              if (!entry.isIntersecting) return;
                              const video = entry.target;
                              videoObserver.unobserve(video);
                              hydrateVideo(video);
                          });
                      },
                      { root: null, rootMargin: "200px 0px", threshold: 0.01 },
                  )
                : null;

        function hydrateVideo(video) {
            const src = video.dataset.src;
            if (!src) return;
            video.removeAttribute("data-src");
            video.src = src;
            video.load();
        }

        function observeVideo(video) {
            if (videoObserver) {
                videoObserver.observe(video);
            } else {
                hydrateVideo(video); // no IO support: load immediately
            }
        }

        function bindHoverPlay(video) {
            if (video.dataset.hoverBound) return;
            video.dataset.hoverBound = "1";

            video.addEventListener("mouseenter", () => {
                if (!video.src && video.dataset.src) hydrateVideo(video);
                video.muted = false;
                const p = video.play();
                if (p && p.catch) p.catch(() => {});
            });

            video.addEventListener("mouseleave", () => {
                video.pause();
                video.muted = true;
                try {
                    video.currentTime = 0;
                } catch (e) {
                    /* not seekable yet */
                }
            });
        }

        /* ---------------------------------------------------------------
         * Responsive arrow positioning
         * ------------------------------------------------------------- */

        function getResponsiveDefaults() {
            const w = window.innerWidth;
            if (w <= 375) return { left: "-9vw", right: "-9vw", top: "50%" };
            if (w <= 768) return { left: "-5vw", right: "-5vw", top: "50%" };
            if (w <= 1024)
                return { left: "-5.5vw", right: "-5.5vw", top: "50%" };
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

        /* ---------------------------------------------------------------
         * Arrow follow
         * ------------------------------------------------------------- */

        function clamp(v, min, max) {
            return Math.min(Math.max(v, min), max);
        }

        function moveArrow(e, selector, originalX, originalY, reverse) {
            const element = document.querySelector(selector);
            if (!element || typeof gsap === "undefined") return;

            const near =
                Math.abs(e.clientX - originalX) < Math.sqrt(2) * 100 &&
                Math.abs(e.clientY - originalY) < Math.sqrt(2) * 100;

            if (near) {
                const relativeX = clamp((e.clientX - originalX) * 0.5, -50, 50);
                const relativeY = clamp((e.clientY - originalY) * 0.5, -50, 50);
                gsap.to(element, { duration: 0.3, x: relativeX, y: relativeY });
            } else {
                const { left, right, top } = getResponsiveDefaults();
                gsap.to(element, {
                    duration: 0.3,
                    x: 0,
                    y: 0,
                    left: reverse ? "auto" : left,
                    right: reverse ? right : "auto",
                    top: top,
                });
            }
        }

        /* ---------------------------------------------------------------
         * Masonry (desktop only)
         * ------------------------------------------------------------- */

        function initMasonry() {
            if (typeof Masonry === "undefined") return;
            if (window.innerWidth < 768) return;
            if (msnry) {
                msnry.layout();
                return;
            }
            msnry = new Masonry(thumbsContainer, {
                itemSelector: ".thumb-item",
                columnWidth: ".thumb-item",
                gutter: 5,
                stagger: 30,
                horizontalOrder: true,
                fitWidth: true,
            });
        }

        initMasonry();

        /* ---------------------------------------------------------------
         * Thumbnail markup
         * ------------------------------------------------------------- */

        function getVideoPlayIcon() {
            return '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true"><path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
        }

        function buildThumb(item, index) {
            const li = document.createElement("li");
            li.className = "thumb-item";
            li.style.listStyle = "none";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.marginBottom = "15px";
            li.dataset.index = String(index);
            li.setAttribute("aria-label", item.title || "Film " + index);

            const overlay = document.createElement("div");
            overlay.className = "video-overlay";

            const playIcon = document.createElement("span");
            playIcon.className = "video-play";
            playIcon.innerHTML = getVideoPlayIcon();
            overlay.appendChild(playIcon);

            const video = document.createElement("video");
            video.className = "vid-block";
            video.preload = "none";
            video.muted = true;
            video.playsInline = true;
            video.loop = true;
            if (item.thumb) video.poster = item.thumb;
            if (item.url) video.dataset.src = item.url;

            overlay.appendChild(video);
            li.appendChild(overlay);

            if (item.url) observeVideo(video);
            bindHoverPlay(video);

            return li;
        }

        function appendThumbs(items) {
            const startIndex = thumbsContainer.children.length + 1;
            const fragment = document.createDocumentFragment();
            const elements = [];

            items.forEach((item, i) => {
                const li = buildThumb(item, startIndex + i);
                fragment.appendChild(li);
                elements.push(li);
            });

            thumbsContainer.appendChild(fragment);

            if (msnry && elements.length) {
                msnry.appended(elements);
                msnry.layout();
            }
        }

        /* ---------------------------------------------------------------
         * Swiper
         * ------------------------------------------------------------- */

        const swiper = new Swiper(".swiper", {
            loop: true,
            preloadImages: false,
            lazy: { loadPrevNext: true },
            slidesPerView: 1,
            spaceBetween: 0,
            observer: true,
            observeParents: true,
            initialSlide: Number.isNaN(initialSlide) ? 0 : initialSlide - 1,
            slideToClickedSlide: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            keyboard: { enabled: true, onlyInViewport: false },
            pagination: { el: ".swiper-pagination", clickable: true },
            on: {
                init: function () {
                    this.update();

                    const totalEl = document.getElementById("total-slides");
                    if (totalEl) totalEl.textContent = this.slides.length;

                    const currentEl = document.getElementById("current-slide");
                    if (currentEl) currentEl.textContent = this.realIndex + 1;

                    bindGalleryInfo();
                    bindArrowFollow();
                    activateSlide(this, this.slides[this.activeIndex]);
                },

                slideChange: function () {
                    const currentEl = document.getElementById("current-slide");
                    if (currentEl) currentEl.textContent = this.realIndex + 1;

                    stopAllVideos();
                    updateSlideInfo();

                    const activeSlide = this.slides[this.activeIndex];
                    if (activeSlide) activateSlide(this, activeSlide);

                    if (isPageLoaded) updateURL(this.realIndex + 1);
                },

                slideChangeTransitionEnd: function () {
                    this.update();
                },

                slideNextTransitionStart: stopAllVideos,
                slidePrevTransitionStart: stopAllVideos,
            },
        });

        window.addEventListener("resize", () => swiper.update());

        function bindGalleryInfo() {
            const galleryInfo = document.getElementById("slide-info");
            const galleryDescription = document.getElementById(
                "gallery-description",
            );
            if (!galleryInfo || !galleryDescription) return;
            if (galleryInfo.dataset.bound) return;
            galleryInfo.dataset.bound = "1";

            galleryInfo.addEventListener("mouseover", () => {
                galleryDescription.style.visibility = "visible";
                galleryDescription.style.opacity = 1;
            });
            galleryInfo.addEventListener("mouseout", () => {
                galleryDescription.style.visibility = "hidden";
                galleryDescription.style.opacity = 0;
            });
        }

        function bindArrowFollow() {
            const prevButton = document.querySelector(".swiper-button-prev");
            const nextButton = document.querySelector(".swiper-button-next");
            if (!prevButton || !nextButton) return;

            const prevRect = prevButton.getBoundingClientRect();
            const nextRect = nextButton.getBoundingClientRect();

            window.addEventListener("mousemove", (e) => {
                moveArrow(
                    e,
                    ".swiper-button-prev",
                    prevRect.left,
                    prevRect.top,
                    false,
                );
                moveArrow(
                    e,
                    ".swiper-button-next",
                    nextRect.left,
                    nextRect.top,
                    true,
                );
            });
        }

        /* ---------------------------------------------------------------
         * Slide activation (video + click-to-embed)
         * ------------------------------------------------------------- */

        function activateSlide(instance, slide) {
            if (!slide) return;

            const video = slide.querySelector("video");
            if (video) {
                if (!video.src && video.dataset.src) hydrateVideo(video);
                video.setAttribute("preload", "auto");
                const p = video.play();
                if (p && p.catch) p.catch(() => {});
            }

            bindVideoClick(slide);
        }

        function bindVideoClick(slide) {
            const videoThumb = slide.querySelector(
                ".video-overlay span[data-id]",
            );
            if (!videoThumb || videoThumb.dataset.bound) return;
            videoThumb.dataset.bound = "1";

            const videoId = videoThumb.getAttribute("data-id");
            const isYouTube = videoThumb.classList.contains("ytb-video");
            const isVimeo = videoThumb.classList.contains("vmeo-video");

            videoThumb.addEventListener("click", function () {
                slide.classList.add("show-video");
                loadVideoIframe(videoId, isYouTube, isVimeo, slide);
            });
        }

        function loadVideoIframe(videoId, isYouTube, isVimeo, slide) {
            if (!videoId) return;

            let videoUrl = "";
            if (isYouTube) {
                videoUrl =
                    "https://www.youtube.com/embed/" +
                    encodeURIComponent(videoId) +
                    "?autoplay=1&mute=0&enablejsapi=1";
            } else if (isVimeo) {
                videoUrl =
                    "https://player.vimeo.com/video/" +
                    encodeURIComponent(videoId) +
                    "?autoplay=1&muted=0";
            } else {
                return;
            }

            const iframe = document.createElement("iframe");
            iframe.src = videoUrl;
            iframe.frameBorder = "0";
            iframe.allow =
                "autoplay; encrypted-media; fullscreen; picture-in-picture";
            iframe.allowFullscreen = true;

            const targetOverlay =
                slide.querySelector(".video-overlay") ||
                (slide.closest ? slide.closest(".video-overlay") : null);
            if (!targetOverlay) return;

            targetOverlay.innerHTML = "";
            targetOverlay.appendChild(iframe);

            iframe.onload = function () {
                const width = iframe.offsetWidth;
                const height = iframe.offsetHeight;
                iframe.classList.add(height > width ? "portrait" : "landscape");
                swiper.update();
            };
        }

        /* ---------------------------------------------------------------
         * Video helpers
         * ------------------------------------------------------------- */

        function stopAllVideos() {
            document
                .querySelectorAll(".swiper-slide .video-overlay iframe")
                .forEach((iframe) => {
                    const src = iframe.src || "";
                    if (src.includes("vimeo.com")) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({ method: "pause" }),
                            "*",
                        );
                    } else if (src.includes("youtube.com")) {
                        iframe.contentWindow.postMessage(
                            JSON.stringify({
                                event: "command",
                                func: "pauseVideo",
                                args: [],
                            }),
                            "*",
                        );
                    }
                });
        }

        function updateSlideInfo() {
            const activeSlide = document.querySelector(".swiper-slide-active");
            const slideInfo = document.getElementById("slide-info");
            if (!activeSlide || !slideInfo) return;

            const heading = slideInfo.querySelector("h2");
            const body = slideInfo.querySelector("div");
            if (heading && activeSlide.dataset.title) {
                heading.textContent = activeSlide.dataset.title;
            }
            if (body && activeSlide.dataset.text) {
                body.innerHTML = activeSlide.dataset.text;
            }
        }

        document.addEventListener("click", function (e) {
            const playBtn = e.target.closest(".video-play");
            if (!playBtn) return;
            const slide = playBtn.closest(".swiper-slide");
            if (!slide) return;
            const video = slide.querySelector("video");
            if (!video) return;

            if (!video.src && video.dataset.src) hydrateVideo(video);
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
            playBtn.style.display = "none";
        });

        /* ---------------------------------------------------------------
         * URL sync
         * ------------------------------------------------------------- */

        function updateURL(index) {
            const url = new URL(window.location.href);
            url.searchParams.set("slide", index);
            window.history.pushState({}, "", url);
        }

        window.addEventListener("load", () => {
            isPageLoaded = true;
            const slide = parseInt(
                new URLSearchParams(window.location.search).get("slide"),
                10,
            );
            if (!Number.isNaN(slide)) swiper.slideTo(slide - 1);
        });

        /* ---------------------------------------------------------------
         * Show all / back to slideshow
         * ------------------------------------------------------------- */

        const BACK_TEXT = "BACK TO SLIDESHOW";

        showAllBtn.addEventListener("click", async () => {
            const goingBack = showAllBtn.textContent.trim() === BACK_TEXT;
            showAllBtn.textContent = goingBack ? "SHOW ALL" : BACK_TEXT;

            swiperContainer.classList.toggle("hidden");
            swiperWrapper.classList.toggle("hide");
            swiperOuter.classList.toggle("hide");
            thumbsContainer.classList.toggle("visible");
            thumbsOuter.classList.toggle("flex");

            // First open: ensure at least one batch exists.
            if (!goingBack && thumbsContainer.children.length === 0) {
                try {
                    const items = await api.next();
                    if (items.length) appendThumbs(items);
                } catch (err) {
                    console.warn(
                        "[films] initial thumb load failed:",
                        err.message,
                    );
                }
            }

            requestAnimationFrame(() => {
                if (window.innerWidth >= 768) initMasonry();
            });
        });

        /* ---------------------------------------------------------------
         * Infinite scroll
         * ------------------------------------------------------------- */

        let scrollQueued = false;
        let scrollFailed = false;

        function handleScroll() {
            if (scrollQueued || scrollFailed) return;
            scrollQueued = true;

            requestAnimationFrame(async () => {
                scrollQueued = false;

                const remaining =
                    document.documentElement.scrollHeight -
                    (window.scrollY + window.innerHeight);

                if (remaining >= 300) return;

                try {
                    const items = await api.next();
                    if (items.length) appendThumbs(items);
                } catch (err) {
                    scrollFailed = true;
                    console.warn("[films] thumb fetch failed:", err.message);
                }
            });
        }

        window.addEventListener("scroll", handleScroll, { passive: true });

        /* ---------------------------------------------------------------
         * Thumbnail clicks (delegated once)
         * ------------------------------------------------------------- */

        thumbsContainer.addEventListener("click", function (e) {
            const thumb = e.target.closest(".thumb-item");
            if (!thumb || !thumbsContainer.contains(thumb)) return;

            const newIndex = parseInt(thumb.dataset.index, 10);
            if (Number.isNaN(newIndex)) return;

            swiper.slideTo(newIndex - 1, 500, false);
            updateURL(newIndex);

            showAllBtn.textContent = "SHOW ALL";
            swiperContainer.classList.remove("hidden");
            swiperWrapper.classList.remove("hide");
            swiperOuter.classList.remove("hide");
            thumbsContainer.classList.remove("visible");
            thumbsOuter.classList.remove("flex");
        });

        /* ---------------------------------------------------------------
         * Show slider button
         * ------------------------------------------------------------- */

        if (showSliderBtn) {
            showSliderBtn.addEventListener("click", function () {
                showSliderBtn.style.display = "none";
                swiperContainer.style.display = "block";
                thumbsContainer.style.display = "none";
                swiperWrapper.classList.toggle("hide");
                swiperOuter.classList.toggle("hide");
            });
        }

        /* ---------------------------------------------------------------
         * Boot
         * ------------------------------------------------------------- */

        updateSlideInfo();
    });
})();
