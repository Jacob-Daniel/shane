<?php
/**
 * Gallery rendering helpers.
 *
 * Ported from shanewoodward_v2/lib/helper-functions.php (lines ~1106–1230).
 * Markup is byte-compatible with film.js / portfolio.js.
 *
 * @package Shaneshop
 */

if (!defined('ABSPATH')) {
    exit;
}

function shaneshop_get_entries($post_id = null) {
    $post_id = $post_id ?: get_the_ID();
    $entries = get_post_meta($post_id, 'gallery_entry', true);
    return is_array($entries) ? $entries : [];
}

/**
 * Play icon SVG, shared by slides and thumbs.
 */
function get_video_play_icon() {
    return '<svg version="1.1" id="Play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
}

/**
 * Get a Vimeo thumbnail via oEmbed, cached for a week.
 *
 * Replaces the legacy v2 API call (http + unserialize on remote data,
 * and the endpoint has been dead for years).
 */
function getVimeoVideoThumbnailByVideoId($id = '', $thumbType = 'large') {
    $id = trim($id);
    if ($id === '') {
        return false;
    }

    $cache_key = "vimeo_thumbnail_{$id}";
    $cached    = get_transient($cache_key);
    if ($cached !== false) {
        return $cached ?: false;
    }

    $response = wp_remote_get(
        'https://vimeo.com/api/oembed.json?width=1280&url=' . rawurlencode("https://vimeo.com/{$id}"),
        ['timeout' => 5]
    );
    $data  = (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200)
        ? json_decode(wp_remote_retrieve_body($response), true) : [];
    $thumb = $data['thumbnail_url'] ?? '';

    set_transient($cache_key, $thumb, $thumb ? WEEK_IN_SECONDS : HOUR_IN_SECONDS);
    return $thumb ?: false;
}

/**
 * Build the video cover markup for a slide.
 *
 * @param string $video     Video URL (vimeo or youtube).
 * @param string $thumbnail Optional custom thumbnail URL.
 * @param string $mp4       Optional MP4 URL.
 * @param string $title     Title for the img alt/title.
 * @return array{id: string, class: string, html: string}|null
 */
function build_video_cover($video, $thumbnail, $mp4, $title) {
    $video_id = '';
    $class    = '';

    if (strpos($video, 'vimeo') !== false) {
        $parts    = explode('vimeo.com/', $video);
        $video_id = isset($parts[1]) ? $parts[1] : '';
        $class    = 'vmeo-video';
        $fallback = getVimeoVideoThumbnailByVideoId($video_id, 'large');
    } elseif (strpos($video, 'youtube') !== false) {
        $parts    = explode('?v=', $video);
        $video_id = isset($parts[1]) ? $parts[1] : '';
        $class    = 'ytb-video';
        $fallback = 'https://img.youtube.com/vi/' . $video_id . '/maxresdefault.jpg';
    } else {
        return null;
    }

    if (!$video_id) {
        return null;
    }

    $icon = '<span class="video-play">' . get_video_play_icon() . '</span>';

    // MP4 wins, then custom thumbnail, then the provider fallback.
    if ($mp4) {
        $inner = '<video class="vid-block" preload="none" playsinline muted loop>'
               . '<source src="' . esc_url($mp4) . '" type="video/mp4"></video>' . $icon;
    } elseif ($thumbnail) {
        $inner = '<img style="cursor:pointer;" loading="lazy" src="' . esc_url($thumbnail) . '" title="' . $title . '"/>' . $icon;
    } else {
        $inner = '<img style="cursor:pointer;" loading="lazy" src="' . esc_url($fallback) . '" title="' . $title . '"/>' . $icon;
    }

    return [
        'id'    => $video_id,
        'class' => $class,
        'html'  => '<span data-id="' . esc_attr($video_id) . '" class="' . $class . '">' . $inner . '</span>',
        'thumb' => $mp4 ? '' : ($thumbnail ?: $fallback),
    ];
}

/**
 * Render the slides for a films gallery (video entries only).
 */
function render_gallery_slide($gallery_entries) {
    foreach ((array) $gallery_entries as $gallery_entry) {
        $video = isset($gallery_entry['gallery_item_video']) ? $gallery_entry['gallery_item_video'] : '';

        if (!$video) {
            continue;
        }

        $title     = isset($gallery_entry['gallery_item_title']) ? esc_html($gallery_entry['gallery_item_title']) : '';
        $text      = isset($gallery_entry['gallery_item_text']) ? esc_html($gallery_entry['gallery_item_text']) : '';
        $thumbnail = isset($gallery_entry['gallery_item_video_thumbnail']) ? $gallery_entry['gallery_item_video_thumbnail'] : '';
        $mp4       = isset($gallery_entry['gallery_item_video_mp4']) ? $gallery_entry['gallery_item_video_mp4'] : '';

        $cover = build_video_cover($video, $thumbnail, $mp4, $title);

        if (!$cover) {
            continue;
        }

        echo '<div class="swiper-slide relative" data-text="' . $text . '" data-title="' . $title . '">';
        echo '<div class="video-container relative overflow-hidden w-full h-full">';
        echo '<div class="video-overlay relative overflow-hidden w-full h-full">' . $cover['html'] . '</div>';
        echo '</div></div>';
    }
}

/**
 * Render the initial batch of video thumbnails for a films gallery.
 *
 * @param array $gallery_entries All entries.
 * @param int   $initial_count   How many thumbs to render.
 * @param int   $offset          Unused; kept for signature compatibility.
 */
function render_gallery_entries($gallery_entries, $initial_count, $offset = 0) {
    if (empty($gallery_entries) || !is_array($gallery_entries)) {
        return;
    }

    $n = 0; // counts rendered slides so data-index matches swiper, even if entries are skipped
    foreach ($gallery_entries as $entry) {
        if (empty($entry['gallery_item_video'])) {
            continue;
        }
        $n++;
        if ($n > $initial_count) {
            break;
        }

        $title = !empty($entry['gallery_item_title']) ? esc_attr($entry['gallery_item_title']) : '';
        $mp4   = !empty($entry['gallery_item_video_mp4']) ? $entry['gallery_item_video_mp4'] : '';
        $cover = build_video_cover(
            $entry['gallery_item_video'],
            !empty($entry['gallery_item_video_thumbnail']) ? $entry['gallery_item_video_thumbnail'] : '',
            $mp4,
            $title
        );
        if (!$cover) {
            continue;
        }

        echo '<li class="thumb-item list-none flex items-center justify-center" aria-label="' . ($n - 1) . '" data-index="' . $n . '">';
        echo '<div class="video-overlay relative overflow-hidden w-full h-full">';
        if ($mp4) {
            echo '<video class="vid-block" preload="none" playsinline muted loop><source class="lazy-vid" data-src="' . esc_url($mp4) . '" type="video/mp4"></video>';
        } elseif ($cover['thumb']) {
            echo '<img class="lazy-thumb" data-src="' . esc_url($cover['thumb']) . '" title="' . $title . '"/>';
        }
        echo '<span class="video-play absolute">' . get_video_play_icon() . '</span>';
        echo '</div></li>';

    }
}

/**
 * Render image slides (used by the portfolio template's inline branch).
 */
function render_image_slides($gallery_entries) {
    foreach ((array) $gallery_entries as $gallery_entry) {
        $image = isset($gallery_entry['gallery_item_image']) ? $gallery_entry['gallery_item_image'] : '';

        if (!$image) {
            continue;
        }

        $title    = isset($gallery_entry['gallery_item_title']) ? esc_html($gallery_entry['gallery_item_title']) : '';
        $image_id = attachment_url_to_postid($image);

        if (!$image_id) {
            continue;
        }

        $src = wp_get_attachment_image_src($image_id, 'large');

        if (!$src) {
            continue;
        }

        echo '<div class="swiper-slide relative">';
        echo '<img class="swiper-lazy" loading="lazy" src="' . esc_url($src[0]) . '" alt="' . $title . '" title="' . $title . '"/>';
        echo '</div>';

    }
}
