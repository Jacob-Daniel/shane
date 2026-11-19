<?php
if (!defined('ABSPATH')) exit;

function render_gallery_slide(array $items): void {
    foreach ($items as $item) {
        printf(
            '<div class="swiper-slide relative" data-text="%s" data-title="%s">'
          . '<div class="video-container relative overflow-hidden w-full h-full">'
          . '<div class="video-overlay relative overflow-hidden w-full h-full">%s</div>'
          . '</div></div>',
            esc_attr($item['text']),
            esc_attr($item['title']),
            $item['cover']['html']   // already escaped inside build_video_cover
        );
    }
}

function render_gallery_entries(array $items, int $initial_count): void {
    foreach (array_slice($items, 0, $initial_count) as $item) {
        $index = $item['index'];
        $title = esc_attr($item['title']);
        $mp4   = $item['mp4'];
        $cover = $item['cover'];

        echo '<li class="thumb-item list-none flex items-center justify-center"'
           . ' aria-label="' . ($index - 1) . '" data-index="' . $index . '">';
        echo '<div class="video-overlay relative overflow-hidden w-full h-full">';

        if ($mp4) {
            echo '<span data-id="' . esc_attr($cover['id']) . '" class="' . esc_attr($cover['class']) . '">'
               . '<video class="vid-block lazy-vid" preload="none" playsinline muted loop'
               . ' data-src="' . esc_url($mp4) . '"'
               . ' data-poster="' . esc_url($cover['thumb']) . '"></video>'
               . '<span class="video-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
               . ' grid place-items-center w-12 h-12">' . get_video_play_icon() . '</span>'
               . '</span>';
        } elseif ($cover['thumb']) {
            echo '<span data-id="' . esc_attr($cover['id']) . '" class="' . esc_attr($cover['class']) . '">'
               . '<img class="lazy-thumb" src="' . esc_url($cover['thumb']) . '"'
               . ' alt="' . $title . '" title="' . $title . '"/>'
               . '<span class="video-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
               . ' grid place-items-center w-12 h-12">' . get_video_play_icon() . '</span>'
               . '</span>';
        }

        echo '</div></li>';
    }
}


