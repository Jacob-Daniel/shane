<?php
/**
 * Template Name: Portfolio
 *
 * @package Shaneshop
 */

get_header();

$post_id    = get_the_ID();
$items      = shaneshop_normalise_portfolio(shaneshop_get_entries($post_id));
$initial    = 10;
$batch_size = 15;
$scroll_threshold = 1000;

$remaining_array = array_map(function ($item) {
    if ($item['type'] === 'image') {
        $id = $item['image_id'];
        return [
            'index' => $item['index'],
            'type'  => 'image',
            'url'   => wp_get_attachment_image_url($id, 'medium'),
            'alt'   => get_post_meta($id, '_wp_attachment_image_alt', true) ?: '',
            'title' => $item['title'] ?: get_the_title($id),
        ];
    }
    return [
        'index'     => $item['index'],
        'type'      => 'video',
        'url'       => esc_url($item['mp4']),
        'alt'       => $item['alt'],
        'thumbnail' => $item['thumbnail'] ? esc_url($item['thumbnail']) : '',
    ];
}, array_slice($items, $initial));


?>

<main id="portfolio-gallery"
      class="portfolio-page flex flex-col items-center justify-center min-h-screen"
      data-endpoint="<?php echo esc_url(rest_url('shaneshop/v1/portfolio/' . $post_id)); ?>"
      data-nonce="<?php echo esc_attr(wp_create_nonce('wp_rest')); ?>"
      data-total="<?php echo esc_attr(count($items)); ?>"
      data-first-batch="<?php echo esc_attr($initial); ?>"
      data-batch-size="<?php echo esc_attr($batch_size); ?>"
      data-scroll-threshold="<?php echo esc_attr($scroll_threshold); ?>">

    <button data-text="BACK TO SLIDESHOW" id="load-more-thumbnails"
            class="fixed block border-0 top-3 right-4 z-[6000] cursor-pointer text-[0.7rem] font-extrabold">SHOW ALL</button>

    <div id="swiper-outer" class="w-full flex justify-center">
        <div id="swiper" class="swiper flex justify-center items-center relative visible max-w-fit">

            <div id="swiper-wrapper" class="swiper-wrapper items-center">
                <?php
                foreach ($items as $item) {                
                    if ($item['type'] === 'image') {
                        $id    = $item['image_id'];
                        $alt   = $item['title'] ?: get_the_title($id);
                        $sizes = '(min-width: 1024px) 75vw, 100vw';
                        $eager = ($item['index'] === 1);

                        echo '<div class="swiper-slide relative flex justify-center">';
                        if ($eager) {
                            echo wp_get_attachment_image($id, 'large', false, [
                                'loading' => 'eager', 'fetchpriority' => 'high',
                                'sizes' => $sizes, 'alt' => $alt, 'title' => $alt,
                            ]);
                        } else {
                            $img = wp_get_attachment_image_src($id, 'large');
                            if ($img) {
                                echo '<img data-src="' . esc_url($img[0]) . '"'
                                   . ' data-srcset="' . esc_attr((string) wp_get_attachment_image_srcset($id, 'large')) . '"'
                                   . ' sizes="' . esc_attr($sizes) . '"'
                                   . ' width="' . (int) $img[1] . '" height="' . (int) $img[2] . '"'
                                   . ' alt="' . esc_attr($alt) . '" title="' . esc_attr($alt) . '">';
                            }
                        }
                        echo '</div>';
                    } else {
                        $poster = $item['thumbnail'] ? ' poster="' . esc_url($item['thumbnail']) . '"' : '';
                        echo '<div class="swiper-slide relative flex justify-center">'
                           . '<div class="video-play">'
                           . '<video class="vid-block mx-auto" preload="metadata" playsinline muted loop controls'
                           . $poster . '>'
                           . '<source src="' . esc_url($item['mp4']) . '#t=0.001" type="video/mp4">'
                           . '</video></div></div>';
                    }
                }
                ?>
            </div>
            <div id="gallery-slider-counter" class="gallery-slider-counter">
                <span id="current-slide">1</span>/<span id="total-slides"><?php echo esc_html(count($items)); ?></span>
            </div>
        </div>
        <div id="swiper-button-next" class="swiper-button swiper-button-next text-black text-[10px] z-[5000] absolute"></div>
        <div id="swiper-button-prev" class="swiper-button swiper-button-prev text-black text-[10px] z-[5000] absolute"></div>
    </div>

    <div id="thumbs-outer" class="justify-center items-center relative">
        <ul id="thumbs" class="thumbs portfolio w-full ml-0 mt-[100px]">
            <?php
            foreach (array_slice($items, 0, $initial) as $item) {
                echo '<li class="thumb-item list-none flex" aria-label="' . ($item['index'] - 1) . '" data-index="' . $item['index'] . '">';
                if ($item['type'] === 'image') {
                    echo wp_get_attachment_image($item['image_id'], 'medium', false, [
                        'loading' => 'lazy',
                        'class'   => 'cursor-pointer',
                    ]);
                } else {
                    echo '<div class="video-overlay">'
                       . '<span class="video-play">' . get_video_play_icon() . '</span>'
                       . '<video class="vid-block" preload="auto" autoplay playsinline muted loop>'
                       . '<source src="' . esc_url($item['mp4']) . '" type="video/mp4">'
                       .'</video>'
                       . '</div>';
                }
                echo '</li>';
            }
            ?>
        </ul>
    </div>
</main>

<?php get_footer(); ?>