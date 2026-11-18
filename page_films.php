<?php
/**
 * Template Name: Films
 *
 * @package Shaneshop
 */

get_header();

$post_id = get_the_ID();
$entries = shaneshop_get_entries($post_id);
$items   = shaneshop_normalise_entries($entries);   // single source of truth
$initial = 15;                                        // matches data-first-batch
$bg      = get_post_meta($post_id, 'gallery_page_background', true) ?: '#ffffff';

$total = count($items);
?>

<main class="films-page flex flex-col items-center justify-center min-h-screen"
      id="films-gallery"
      data-endpoint="<?php echo esc_url(rest_url('shaneshop/v1/films/' . $post_id)); ?>"
      data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>"
      data-batch-size="5"
      data-first-batch="<?php echo esc_attr($initial); ?>"
      data-total="<?php echo esc_attr($total); ?>">

    <button data-text="BACK TO SLIDESHOW" id="load-more-thumbnails"
            class="fixed block border-0 top-3 right-4 z-[6000] cursor-pointer text-[0.7rem] font-extrabold">SHOW ALL</button>

    <div id="swiper-outer" class="film">
        <div id="swiper" class="swiper film flex justify-center items-center mx-auto relative visible">
            <div id="swiper-wrapper" class="swiper-wrapper items-center">
                <?php render_gallery_slide($items); ?>
            </div>
            <div id="slide-info" class="z-[9999] fixed left-4 bottom-4 max-w-[500px]">
                <div id="gallery-description" class="gallery-description"></div>
                <h2 id="gallery-title" class="text-2xl"></h2>
            </div>
            <div id="gallery-slider-counter" class="gallery-slider-counter">
                <span id="current-slide">1</span>/<span id="total-slides"><?php echo esc_html($total); ?></span>
            </div>
        </div>
        <div id="swiper-button-next" class="swiper-button swiper-button-next text-black text-[10px] z-[5000] absolute"></div>
        <div id="swiper-button-prev" class="swiper-button swiper-button-prev text-black text-[10px] z-[5000] absolute"></div>
    </div>

    <div id="thumbs-outer">
        <ul id="thumbs" class="thumbs video masonry w-full mt-[100px]">
            <?php render_gallery_entries($items, $initial); ?>
        </ul>
    </div>

    <button id="show-slider" style="display:none">SHOW SLIDER</button>
</main>

<?php get_footer(); ?>
