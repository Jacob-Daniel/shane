<?php
/**
 * Template Name: Films
 *
 * @package Shaneshop
 */

get_header();

$entries = shaneshop_get_entries();
$initial = 5;
$bg      = get_post_meta(get_the_ID(), 'gallery_page_background', true) ?: '#ffffff';

$total_images      = count($entries);
$remaining_images  = array_slice($entries, $initial);
$remaining_array   = array_map(function ($entry) {
    $mp4_url = !empty($entry['gallery_item_video_mp4']) ? esc_url($entry['gallery_item_video_mp4']) : '';
    return $mp4_url ? [
        "type" => "video",
        "id"   => $entry['gallery_item_video_mp4_id'],
        "url"  => $mp4_url,
    ] : null;
}, $remaining_images);
$remaining_array = array_values(array_filter($remaining_array));
?>

<main class="films-page flex flex-col items-center justify-center min-h-screen">
    <button data-text="BACK TO SLIDESHOW" id="load-more-thumbnails"
            class="fixed block border-0 top-3 right-4 z-[6000] cursor-pointer">SHOW ALL</button>

    <div id="swiper-outer" class="film">
        <div id="swiper" class="swiper film flex justify-center items-center mx-auto relative visible">
            <div id="swiper-wrapper" class="swiper-wrapper items-center">
                <?php render_gallery_slide($entries); ?>
            </div>
            <div id="slide-info" class="z-[9999] fixed left-4 bottom-4 max-w-[500px]">
                <div id="gallery-description" class="gallery-description"></div>
                <h2 id="gallery-title" class="text-2xl"></h2>
            </div>
            <div id="gallery-slider-counter" class="gallery-slider-counter">
                <span id="current-slide">1</span>/<span id="total-slides"></span>
            </div>
        </div>
        <div id="swiper-button-next" class="swiper-button swiper-button-next text-black text-[10px] z-[5000] absolute"></div>
        <div id="swiper-button-prev" class="swiper-button swiper-button-prev text-black text-[10px] z-[5000] absolute"></div>
    </div>

    <div id="thumbs-outer">
        <ul id="thumbs" class="thumbs video masonry w-full ml-0">
            <?php render_gallery_entries($entries, $initial); ?>
        </ul>
    </div>

    <?php if ($remaining_array) : ?>
    <script>
        window.remainingImages = <?php echo json_encode($remaining_array); ?>;
    </script>
    <?php endif; ?>
</main>


<?php get_footer(); ?>
