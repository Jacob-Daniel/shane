<?php
/**
 * Template Name: Portfolio
 *
 * @package Shaneshop
 */

get_header();

$entries = shaneshop_get_entries();
$initial = 5;
$bg      = get_post_meta(get_the_ID(), 'gallery_page_background', true) ?: '#ffffff';

$total_images     = count($entries);
$remaining_images = array_slice($entries, $initial);

$remaining_array = array_map(function ($img) {
    if (!empty($img['gallery_item_image_id'])) {
        return [
            "type"  => "image",
            "url"   => wp_get_attachment_image_url($img['gallery_item_image_id'], "medium"),
            "alt"   => get_post_meta($img['gallery_item_image_id'], '_wp_attachment_image_alt', true) ?: '',
            "title" => get_the_title($img['gallery_item_image_id']) ?: '',
        ];
    } elseif (!empty($img['gallery_item_video_mp4'])) {
        return [
            "type"      => "video",
            "url"       => esc_url($img['gallery_item_video_mp4']),
            "alt"       => $img['gallery_item_video_alt'] ?? '',
            "thumbnail" => !empty($img['gallery_item_video_thumbnail']) ? esc_url($img['gallery_item_video_thumbnail']) : '',
        ];
    }
    return null;
}, $remaining_images);

$remaining_array = array_values(array_filter($remaining_array));
?>

<main class="portfolio-page flex flex-col items-center justify-center min-h-screen">
    <button data-text="BACK TO SLIDESHOW" id="load-more-thumbnails"
            class="fixed block border-0 top-3 right-4 z-[6000] cursor-pointer text-[0.7rem] font-extrabold">SHOW ALL</button>

    <div id="swiper-outer" class="w-full flex justify-center">
        <div id="swiper" class="swiper flex justify-center items-center relative visible max-w-fit">

            <div id="swiper-wrapper" class="swiper-wrapper items-center">
                <?php
                foreach ((array) $entries as $gallery_entry) {
                    if (!empty($gallery_entry['gallery_item_image_id'])) {
                        $image_id = (int) $gallery_entry['gallery_item_image_id'];
                        $title    = !empty($gallery_entry['gallery_item_title'])
                            ? esc_attr($gallery_entry['gallery_item_title'])
                            : esc_attr(get_the_title($image_id));
                        $src      = wp_get_attachment_image_src($image_id, 'large');

                        if ($src) {
                            echo '<div class="swiper-slide relative flex justify-center">';
                            echo '<img class="swiper-lazy" loading="lazy" src="' . esc_url($src[0]) . '" alt="' . $title . '" title="' . $title . '"/>';
                            echo '</div>';
                        }
                    } elseif (!empty($gallery_entry['gallery_item_video_mp4'])) {
                        render_gallery_slide([$gallery_entry]);
                    }
                }
                ?>
            </div>
            <div id="gallery-slider-counter" class="gallery-slider-counter">
                <span id="current-slide">1</span>/<span id="total-slides"></span>
            </div>
        </div>
        <div id="swiper-button-next" class="swiper-button swiper-button-next text-black text-[10px] z-[5000] absolute"></div>
        <div id="swiper-button-prev" class="swiper-button swiper-button-prev text-black text-[10px] z-[5000] absolute"></div>
    </div>

    <div id="thumbs-outer" class="justify-center items-center relative">
        <ul id="thumbs" class="thumbs portfolio w-full ml-0">
            <?php
            foreach (array_slice($entries, 0, $initial) as $index => $image) {
                echo '<li class="thumb-item list-none flex" aria-label="' . $index . '" data-index="' . ($index + 1) . '">';
                echo wp_get_attachment_image($image['gallery_item_image_id'], "medium", false, ["loading" => "lazy", 'class' => 'cursor-pointer']);
                echo '</li>';
            }
            ?>
        </ul>
    </div>

<?php if ($remaining_array) : ?>
<script>
    window.remainingImages = <?php echo json_encode($remaining_array); ?>;
</script>
<?php endif; ?>
</main>

<?php get_footer(); ?>
