<?php
if (!defined('ABSPATH')) exit;

function shaneshop_get_entries($post_id = null) {
    $post_id = $post_id ?: get_the_ID();
    $entries = get_post_meta($post_id, 'gallery_entry', true);
    return is_array($entries) ? $entries : [];
}

/**
 * Normalise raw meta into a flat list of renderable items.
 * Every consumer (slides, thumbs, REST) reads from this — no re-filtering.
 *
 * @return array<int, array{
 *   index:int, title:string, text:string, video:string, mp4:string,
 *   thumbnail:string, cover:array|null
 * }>
 */
function shaneshop_normalise_entries(array $raw): array {
    $out = [];
    $n = 0;

    foreach ($raw as $entry) {
        $video = $entry['gallery_item_video'] ?? '';
        if (!$video) continue;

        $title     = $entry['gallery_item_title'] ?? '';
        $text      = $entry['gallery_item_text'] ?? '';
        $mp4       = ($entry['gallery_item_video_mp4'] ?? '') ? set_url_scheme($entry['gallery_item_video_mp4']) : '';
        $thumbnail = ($entry['gallery_item_video_thumbnail'] ?? '') ? set_url_scheme($entry['gallery_item_video_thumbnail']) : '';

        $cover = build_video_cover($video, $thumbnail, $mp4, $title);
        if (!$cover) continue;   // unsupported provider — skip before numbering

        $n++;
        $out[] = [
            'index'     => $n,           // 1-based, matches swiper slide order
            'title'     => $title,
            'text'      => $text,
            'video'     => $video,
            'mp4'       => $mp4,
            'thumbnail' => $thumbnail,
            'cover'     => $cover,
        ];
    }

    return $out;
}

function shaneshop_normalise_portfolio(array $raw): array {
    $out = [];
    $n = 0;

    foreach ($raw as $entry) {
        $image_id = (int) ($entry['gallery_item_image_id'] ?? 0);
        $mp4       = ($entry['gallery_item_video_mp4'] ?? '') ? set_url_scheme($entry['gallery_item_video_mp4']) : '';
        $thumbnail = ($entry['gallery_item_video_thumbnail'] ?? '') ? set_url_scheme($entry['gallery_item_video_thumbnail']) : '';

        if ($image_id && wp_attachment_is_image($image_id)) {
            $type = 'image';
        } elseif ($mp4) {
            $type = 'video';
        } else {
            continue; // skip before numbering
        }

        $n++;
        $out[] = [
            'index'     => $n, // 1-based
            'type'      => $type,
            'image_id'  => $image_id,
            'title'     => $entry['gallery_item_title'] ?? '',
            'mp4'       => $mp4,
            'thumbnail' => $thumbnail,
            'alt'       => $entry['gallery_item_video_alt'] ?? '',
            'raw'       => $entry,
        ];
    }
    return $out;
}
