<?php
/**
 * Video cover markup + provider thumbnail helpers.
 *
 * @package Shaneshop
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Play icon SVG, shared by slides and thumbs.
 */
function get_video_play_icon() {
    return '<svg version="1.1" fill="#fff" id="Play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true"><path d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"/></svg>';
}

/**
 * Get a Vimeo thumbnail via oEmbed, cached for a week.
 */
function getVimeoVideoThumbnailByVideoId($id = '', $thumbType = 'large') {
    $id = trim((string) $id);
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

    $data = (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200)
        ? json_decode(wp_remote_retrieve_body($response), true)
        : [];

    $thumb = is_array($data) && !empty($data['thumbnail_url']) ? $data['thumbnail_url'] : '';

    set_transient($cache_key, $thumb, $thumb ? WEEK_IN_SECONDS : HOUR_IN_SECONDS);

    return $thumb ?: false;
}

/**
 * Parse a video URL into provider id + class.
 *
 * @return array{id: string, class: string, fallback: string}|null
 */
function shaneshop_parse_video_url($video) {
    $video = trim((string) $video);
    if ($video === '') {
        return null;
    }

    // YouTube — handles youtu.be/ID, watch?v=ID, embed/ID, shorts/ID.
    if (preg_match('~(?:youtu\.be/|youtube(?:-nocookie)?\.com/(?:watch\?[^#]*v=|embed/|shorts/))([A-Za-z0-9_-]{11})~', $video, $m)) {
        return [
            'id'       => $m[1],
            'class'    => 'ytb-video',
            'fallback' => 'https://img.youtube.com/vi/' . $m[1] . '/maxresdefault.jpg',
        ];
    }

    // Vimeo — handles vimeo.com/ID, player.vimeo.com/video/ID, channel/name/ID.
    if (preg_match('~vimeo\.com/(?:video/)?(?:[^/]+/)*?(\d+)~', $video, $m)) {
        $id = $m[1];
        return [
            'id'       => $id,
            'class'    => 'vmeo-video relative',
            'fallback' => (string) getVimeoVideoThumbnailByVideoId($id, 'large'),
        ];
    }

    return null;
}

/**
 * Build the video cover markup for a slide.
 *
 * @param string $video     Video URL (vimeo or youtube).
 * @param string $thumbnail Optional custom thumbnail URL.
 * @param string $mp4       Optional MP4 URL.
 * @param string $title     Raw title (escaped here).
 * @return array{id: string, class: string, html: string, thumb: string}|null
 */
function build_video_cover($video, $thumbnail, $mp4, $title) {
    $parsed = shaneshop_parse_video_url($video);
    if (!$parsed) {
        return null;
    }

    $video_id = $parsed['id'];
    $class    = $parsed['class'];
    $fallback = $parsed['fallback'];

    $icon  = '<span class="video-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
               grid place-items-center w-24 h-24 cursor-pointer">' . get_video_play_icon() . '</span>';
    $label = esc_attr($title);

    // MP4 wins, then custom thumbnail, then the provider fallback.
    if ($mp4) {
        $inner = '<video class="vid-block" preload="none" playsinline muted loop>'
               . '<source src="' . esc_url($mp4) . '" type="video/mp4"></video>' . $icon;
        $thumb = $thumbnail ?: $fallback;
    } elseif ($thumbnail) {
        $inner = '<img loading="lazy" src="' . esc_url($thumbnail) . '" alt="' . $label . '" title="' . $label . '"/>' . $icon;
        $thumb = $thumbnail;
    } elseif ($fallback) {
        $inner = '<img loading="lazy" src="' . esc_url($fallback) . '" alt="' . $label . '" title="' . $label . '"/>' . $icon;
        $thumb = $fallback;
    } else {
        // No thumbnail available at all — still render the play affordance.
        $inner = '<div class="vid-block vid-block--empty"></div>' . $icon;
        $thumb = '';
    }

    return [
        'id'    => $video_id,
        'class' => $class,
        'html'  => '<span data-id="' . esc_attr($video_id) . '" class="' . esc_attr($class) . '">' . $inner . '</span>',
        'thumb' => $thumb,
    ];
}
