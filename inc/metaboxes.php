<?php
/**
 * CMB2 metaboxes.
 *
 * Rebuilt from the live data shape — the original registration was lost
 * with the legacy theme. Field IDs must match exactly, or existing post
 * meta stops resolving.
 *
 * @package Shaneshop
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('cmb2_admin_init', function () {

    // ---- Gallery pages (Films, Portfolio) ----
    $gallery = new_cmb2_box([
        'id'           => 'gallery_metabox',
        'title'        => __('Gallery', 'shaneshop'),
        'object_types' => ['page'],
        'context'      => 'normal',
        'priority'     => 'high',
        'show_on'      => [
            'key'   => 'page-template',
            'value' => ['page_films.php', 'page_portfolio.php'],
        ],
    ]);

    $gallery->add_field([
        'name'    => __('Page Background', 'shaneshop'),
        'id'      => 'gallery_page_background',
        'type'    => 'colorpicker',
        'default' => '#ffffff',
    ]);

    $group = $gallery->add_field([
        'id'         => 'gallery_entry',
        'type'       => 'group',
        'repeatable' => true,
        'options'    => [
            'group_title'   => __('Entry {#}', 'shaneshop'),
            'add_button'    => __('Add Entry', 'shaneshop'),
            'remove_button' => __('Remove Entry', 'shaneshop'),
            'sortable'      => true,
            'closed'        => true,
        ],
    ]);

    $gallery->add_group_field($group, [
        'name' => __('Title', 'shaneshop'),
        'id'   => 'gallery_item_title',
        'type' => 'text',
    ]);

    $gallery->add_group_field($group, [
        'name' => __('Text', 'shaneshop'),
        'id'   => 'gallery_item_text',
        'type' => 'textarea',
    ]);

    $gallery->add_group_field($group, [
        'name'         => __('Image', 'shaneshop'),
        'id'           => 'gallery_item_image',
        'type'         => 'file',
        'options'      => ['url' => false],
        'preview_size' => 'medium',
    ]);

    $gallery->add_group_field($group, [
        'name' => __('Video URL (Vimeo / YouTube)', 'shaneshop'),
        'id'   => 'gallery_item_video',
        'type' => 'text_url',
    ]);

    $gallery->add_group_field($group, [
        'name'         => __('Video Thumbnail', 'shaneshop'),
        'id'           => 'gallery_item_video_thumbnail',
        'type'         => 'file',
        'options'      => ['url' => false],
        'preview_size' => 'medium',
    ]);

    $gallery->add_group_field($group, [
        'name'         => __('Video MP4', 'shaneshop'),
        'id'           => 'gallery_item_video_mp4',
        'type'         => 'file',
        'options'      => ['url' => false],
        'preview_size' => 'medium',
    ]);

    // ---- Landing page (Home, ID 10) ----
    $landing = new_cmb2_box([
        'id'           => 'landing_metabox',
        'title'        => __('Landing Page', 'shaneshop'),
        'object_types' => ['page'],
        'show_on'      => [
            'key'   => 'page-template',
            'value' => 'page_landing.php',
        ],
    ]);

    $landing->add_field([
        'name' => __('Video URL', 'shaneshop'),
        'id'   => 'landing_page_video',
        'type' => 'text_url',
    ]);

    $landing->add_field([
        'name' => __('Video ID', 'shaneshop'),
        'id'   => 'landing_page_video_id',
        'type' => 'text',
    ]);

    $landing->add_field([
        'name' => __('Video Controls', 'shaneshop'),
        'id'   => 'landing_page_video_controls',
        'type' => 'checkbox',
    ]);

    $landing->add_field([
        'name' => __('Autoplay', 'shaneshop'),
        'id'   => 'landing_page_video_auto',
        'type' => 'checkbox',
    ]);

    $landing->add_field([
        'name' => __('Loop', 'shaneshop'),
        'id'   => 'landing_page_video_loop',
        'type' => 'checkbox',
    ]);

    $landing->add_field([
        'name' => __('Muted', 'shaneshop'),
        'id'   => 'landing_page_video_muted',
        'type' => 'checkbox',
    ]);

    $landing->add_field([
        'name' => __('Video Overlay', 'shaneshop'),
        'id'   => 'landing_page_video_overlay',
        'type' => 'colorpicker',
    ]);

    $landing->add_field([
        'name'         => __('GIF', 'shaneshop'),
        'id'           => 'landing_page_gif',
        'type'         => 'file',
        'options'      => ['url' => false],
        'preview_size' => 'medium',
    ]);

    $landing->add_field([
        'name' => __('GIF Overlay', 'shaneshop'),
        'id'   => 'landing_page_gif_overlay',
        'type' => 'colorpicker',
    ]);

    $landing->add_field([
        'name' => __('GIF Repeated', 'shaneshop'),
        'id'   => 'landing_page_gif_repeated',
        'type' => 'checkbox',
    ]);
});
