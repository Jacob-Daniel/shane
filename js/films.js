document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const slideIndex = urlParams.get("slide");

    let offset = 0;
    let indexOffset = 6;
    const batchSize = 5;

    const showAllBtn = document.getElementById("load-more-thumbnails");
    const showSliderBtn = document.getElementById("show-slider");
    const swiperOuter = document.getElementById("swiper-outer");
    const swiperContainer = document.getElementById("swiper");
    const swiperWrapper = document.getElementById("swiper-wrapper");
    const thumbsOuter = document.getElementById("thumbs-outer");
    const thumbsContainer = document.getElementById("thumbs");

    // Bail if the films gallery markup isn't on this page.
    if (!swiperContainer || !thumbsContainer || !showAllBtn) return;

    let msnry;
    const masonryContainer = thumbsContainer;

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

    /* ---------- Arrow follow ---------- */

    function clamp(v, min, max) {
        return Math.min(Math.max(v, min), max);
    }

    function moveArrow(e, selector, originalX, originalY, reverse = false) {
        const element = document.querySelector(selector);
        if (!element) return;

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

    /* ---------- Masonry (desktop only) ---------- */

    if (window.innerWidth >= 768) {
        msnry = new Masonry(masonryContainer, {
            itemSelector: ".thumb-item",
            columnWidth: ".thumb-item",
            gutter: 5,
            stagger: 30,
            horizontalOrder: true,
            fitWidth: true,
        });
    }

    /* ---------- Show all / back to slideshow ---------- */

    showAllBtn.addEventListener("click", () => {
        const text = "BACK TO SLIDESHOW";
        showAllBtn.textContent =
            showAllBtn.textContent == text ? "SHOW ALL" : text;
        swiperContainer.classList.toggle("hidden");
        swiperWrapper.classList.toggle("hide");
        swiperOuter.classList.toggle("hide");
        thumbsContainer.classList.toggle("visible");
        thumbsOuter.classList.toggle("flex");

        document.querySelectorAll(".lazy-thumb").forEach((img) => {
            if (!img.dataset.loaded) {
                img.src = img.dataset.src;
                img.dataset.loaded = true;
            }
        });

        // Wait for the browser to reflow the now-visible container
        requestAnimationFrame(() => {
            if (window.innerWidth >= 768) {
                if (!msnry) {
                    const colWidth = thumbsContainer.clientWidth / 3;
                    msnry = new Masonry(thumbsContainer, {
                        itemSelector: ".thumb-item",
                        columnWidth: colWidth,
                        gutter: 5,
                        stagger: 30,
                        horizontalOrder: true,
                        fitWidth: true,
                    });
                } else {
                    msnry.layout();
                }
            }
        });

        Array.from(document.querySelectorAll(".lazy-vid"))
            .slice(0, 5)
            .forEach((video) => {
                if (!video.dataset.loaded) {
                    video.src = video.dataset.src;
                    video.dataset.loaded = true;
                    video.dataset.src = "";
                    const v = video.closest("video");
                    v.load();
                    v.addEventListener("mouseenter", () => {
                        v.play();
                        v.muted = false;
                    });
                    v.addEventListener("mouseleave", () => {
                        v.pause();
                        v.muted = true;
                        v.currentTime = 0;
                    });
                }
            });
    });

    /* ---------- Infinite scroll ---------- */

    function handleScroll() {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        showAllBtn.style.display = "block";
        if (scrollTop + windowHeight >= scrollHeight - 100) {
            loadMoreVideoThumbs();
        }
    }

    /* ---------- Swiper ---------- */

    let swiper = new Swiper(".swiper", {
        loop: true,
        lazy: true,
        preloadImages: false,
        slidesPerView: 1,
        spaceBetween: 0,
        observer: true,
        initialSlide: slideIndex,
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
                document.getElementById("total-slides").textContent =
                    this.slides.length;
                document.getElementById("current-slide").textContent =
                    this.realIndex + 1;

                const galleryInfo = document.getElementById("slide-info");
                const galleryDescription = document.getElementById(
                    "gallery-description",
                );
                if (galleryInfo && galleryDescription) {
                    galleryInfo.addEventListener("mouseover", () => {
                        galleryDescription.style.visibility = "visible";
                        galleryDescription.style.opacity = 1;
                    });
                    galleryInfo.addEventListener("mouseout", () => {
                        galleryDescription.style.visibility = "hidden";
                        galleryDescription.style.opacity = 0;
                    });
                }

                const firstVideo = this.slides[0].querySelector("video");
                if (firstVideo) {
                    firstVideo.setAttribute("preload", "auto");
                    firstVideo.play();
                }
                addVideoClickListener();

                const prevButton = document.querySelector(
                    ".swiper-button-prev",
                );
                const nextButton = document.querySelector(
                    ".swiper-button-next",
                );
                if (!prevButton || !nextButton) return;

                const prevRect = prevButton.getBoundingClientRect();
                const nextRect = nextButton.getBoundingClientRect();
                window.addEventListener("mousemove", (e) => {
                    moveArrow(
                        e,
                        ".swiper-button-prev",
                        prevRect.left,
                        prevRect.top,
                    );
                    moveArrow(
                        e,
                        ".swiper-button-next",
                        nextRect.left,
                        nextRect.top,
                        true,
                    );
                });
            },
            slideChange: function () {
                document.getElementById("current-slide").textContent =
                    this.realIndex + 1;
                stopAllVideos();
                updateSlideInfo();

                const activeSlide = document.querySelector(
                    ".swiper-slide-active",
                );
                if (!activeSlide) return;

                const activeVideo = activeSlide.querySelector("video");
                if (activeVideo) {
                    activeVideo.setAttribute("preload", "auto");
                    activeVideo.play().catch(() => {});
                }
                addVideoClickListener();
                lazyLoadVideo(this);
            },
            slideChangeTransitionEnd: function () {
                this.update();
            },
            slideNextTransitionStart: function () {
                stopAllVideos();
            },
            slidePrevTransitionStart: function () {
                stopAllVideos();
            },
        },
    });

    window.addEventListener("resize", () => swiper.update());

    if (!isNaN(slideIndex)) swiper.slideTo(slideIndex - 1);

    let isPageLoaded = false;

    function updateURL(index) {
        const url = new URL(window.location);
        url.searchParams.set("slide", index);
        window.history.pushState({}, "", url);
    }

    swiper.on("slideChange", function () {
        if (!isPageLoaded) return;
        updateURL(swiper.activeIndex + 1);
    });

    window.addEventListener("load", () => {
        isPageLoaded = true;
        const slide = new URLSearchParams(window.location.search).get("slide");
        if (slide) swiper.slideTo(slide - 1);
    });

    /* ---------- Video helpers ---------- */

    function stopAllVideos() {
        document
            .querySelectorAll(".swiper-slide .video-overlay iframe")
            .forEach((iframe) => {
                if (iframe.src.includes("vimeo.com")) {
                    iframe.contentWindow.postMessage(
                        JSON.stringify({ method: "pause" }),
                        "*",
                    );
                }
            });
    }

    function updateSlideInfo() {
        const activeSlide = document.querySelector(".swiper-slide-active");
        if (!activeSlide) return;
        const slideInfo = document.getElementById("slide-info");
        if (!slideInfo) return;
        slideInfo.querySelector("h2").textContent = activeSlide.dataset.title;
        if (activeSlide.dataset.text) {
            slideInfo.querySelector("div").innerHTML = activeSlide.dataset.text;
        }
    }
    updateSlideInfo();

    function addVideoClickListener() {
        const activeSlide = document.querySelector(".swiper-slide-active");
        if (!activeSlide) return;
        const videoThumb = activeSlide.querySelector("span[data-id]");
        if (!videoThumb) return;
        const videoId = videoThumb.getAttribute("data-id");
        const isYouTube = videoThumb.classList.contains("ytb-video");
        const isVimeo = videoThumb.classList.contains("vmeo-video");
        videoThumb.addEventListener("click", function () {
            activeSlide.classList.add("show-video");
            loadVideoIframe(videoId, isYouTube, isVimeo, activeSlide);
        });
    }

    function lazyLoadVideo(swiper) {
        const activeSlide = swiper.slides[swiper.activeIndex];
        const videoSpan = activeSlide.querySelector(
            ".video-overlay span[data-id]",
        );
        const videoSource = activeSlide.querySelector("video > source");
        if (videoSource) {
            videoSource.addEventListener("click", function () {
                const videoId = videoSpan
                    ? videoSpan.getAttribute("data-id")
                    : null;
                loadVideoIframe(
                    videoId,
                    videoSpan && videoSpan.classList.contains("ytb-video"),
                    videoSpan && videoSpan.classList.contains("vmeo-video"),
                    activeSlide,
                );
            });
        }
    }

    function loadVideoIframe(videoId, isYouTube, isVimeo, slide) {
        if (!videoId) return;
        let videoUrl = "";
        if (isYouTube)
            videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
        else if (isVimeo)
            videoUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0`;

        const iframe = document.createElement("iframe");
        iframe.src = videoUrl;
        iframe.frameBorder = "0";
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;

        const targetOverlay =
            slide.querySelector(".video-overlay") ||
            slide.closest(".video-overlay");
        if (!targetOverlay) return;
        targetOverlay.innerHTML = "";
        targetOverlay.appendChild(iframe);

        iframe.onload = function () {
            const width = iframe.offsetWidth;
            const height = iframe.offsetHeight;
            iframe.classList.add(height > width ? "portrait" : "landscape");
            if (typeof swiper !== "undefined") swiper.update();
        };
    }

    document.addEventListener("click", function (e) {
        if (e.target.closest(".video-play")) {
            const slide = e.target.closest(".swiper-slide");
            if (slide) {
                const video = slide.querySelector("video");
                if (video) {
                    video.play();
                    e.target.style.display = "none";
                }
            }
        }
    });

    /* ---------- Thumbnail clicks ---------- */

    function bindThumbnailClicks() {
        document.querySelectorAll(".thumbs li").forEach((thumb) => {
            thumb.addEventListener("click", function () {
                const newIndex = parseInt(this.dataset.index, 10);
                if (isNaN(newIndex)) return;
                swiper.slideTo(newIndex - 1, 500, false);
                updateURL(newIndex);

                showAllBtn.textContent = "Show All";
                swiperContainer.classList.remove("hidden");
                swiperWrapper.classList.remove("hide");
                swiperOuter.classList.remove("hide");
                thumbsContainer.classList.remove("visible");
                thumbsOuter.classList.remove("flex");
            });
        });
    }

    /* ---------- Load more thumbs ---------- */

    function loadMoreVideoThumbs() {
        if (typeof remainingImages === "undefined") return; // guard
        const currentBatchSize = offset === 0 ? indexOffset : batchSize;
        if (offset >= remainingImages.length) return;
        const nextBatch = remainingImages.slice(
            offset,
            offset + currentBatchSize,
        );

        const fragment = document.createDocumentFragment();
        const elements = [];

        nextBatch.forEach((video, index) => {
            const li = document.createElement("li");
            li.classList.add("thumb-item");
            li.style.listStyle = "none";
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.marginBottom = "15px";
            li.dataset.index = indexOffset + index;
            li.setAttribute("aria-label", `${indexOffset + index - 1}`);

            const videoElement = document.createElement("video");
            videoElement.classList.add("vid-block");
            videoElement.preload = "none";
            videoElement.playsInline = true;
            videoElement.muted = true;
            videoElement.loop = true;

            const source = document.createElement("source");
            source.src = video.url;
            source.type = "video/mp4";
            source.classList.add("lazy-vid");
            source.dataset.src = "";
            source.dataset.loaded = false;
            videoElement.appendChild(source);

            const overlay = document.createElement("div");
            overlay.classList.add("video-overlay");
            const playIcon = document.createElement("span");
            playIcon.classList.add("video-play");
            playIcon.innerHTML = getVideoPlayIcon();
            overlay.appendChild(playIcon);
            overlay.appendChild(videoElement);
            li.appendChild(overlay);
            fragment.appendChild(li);
            elements.push(li);

            videoElement.addEventListener("mouseenter", () => {
                videoElement.play();
                videoElement.muted = false;
            });
            videoElement.addEventListener("mouseleave", () => {
                videoElement.pause();
                videoElement.muted = true;
                videoElement.currentTime = 0;
            });
        });

        thumbsContainer.appendChild(fragment);
        indexOffset += currentBatchSize;
        offset += currentBatchSize;

        if (msnry && elements.length) {
            Promise.all(
                elements.map(
                    (v) =>
                        new Promise((res) =>
                            v.addEventListener("loadeddata", res, {
                                once: true,
                            }),
                        ),
                ),
            ).then(() => {
                msnry.appended(elements);
                msnry.layout();
            });
        }

        setTimeout(bindThumbnailClicks, offset * 10);
    }

    /* ---------- Show slider button ---------- */

    if (showSliderBtn) {
        showSliderBtn.addEventListener("click", function () {
            showSliderBtn.style.display = "none";
            swiperContainer.style.display = "block";
            thumbsContainer.style.display = "none";
            swiperWrapper.classList.toggle("hide");
            swiperOuter.classList.toggle("hide");
        });
    }

    /* ---------- Scroll ---------- */

    if (thumbsContainer) {
        window.addEventListener("scroll", handleScroll);
    }
    bindThumbnailClicks();
    thumbsContainer.scrollTop = thumbsContainer.scrollHeight;

    /* ---------- Play icon ---------- */

    function getVideoPlayIcon() {
        return '<svg version="1.1" id="Play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
    }
});
