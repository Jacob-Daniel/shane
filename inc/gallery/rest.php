<?php
if (!defined('ABSPATH')) exit;

/** Portfolio item -> JSON-safe payload. Used by the template and the REST route. */
function shaneshop_portfolio_payload(array $items): array {
    return array_map(function ($item) {
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
            'url'       => esc_url_raw($item['mp4']),
            'alt'       => $item['alt'],
            'thumbnail' => $item['thumbnail'] ? esc_url_raw($item['thumbnail']) : '',
        ];
    }, $items);
}

/** Shared offset/per_page slicing + headers for gallery routes. */
function shaneshop_gallery_response(WP_REST_Request $req, callable $normalise, callable $map) {
    $post_id = (int) $req['id'];
    if (get_post_status($post_id) !== 'publish') {
        return new WP_Error('not_found', 'Gallery not found', ['status' => 404]);
    }

    $items    = $normalise(shaneshop_get_entries($post_id));
    $per_page = min(20, max(1, (int) $req['per_page']));
    $offset   = $req->get_param('offset');
    $offset   = $offset !== null
        ? (int) $offset
        : (max(1, (int) $req['page']) - 1) * $per_page;

    $res = rest_ensure_response($map(array_slice($items, $offset, $per_page)));
    $res->header('X-WP-Total', (string) count($items));
    return $res;
}

add_action('rest_api_init', function () {
    $args = [
        'page'     => ['default' => 1, 'sanitize_callback' => 'absint'],
        'per_page' => ['default' => 5, 'sanitize_callback' => 'absint'],
        'offset'   => ['sanitize_callback' => 'absint'],
    ];

    register_rest_route('shaneshop/v1', '/films/(?P<id>\d+)', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args'                => $args,
        'callback'            => fn(WP_REST_Request $req) => shaneshop_gallery_response(
            $req,
            'shaneshop_normalise_entries',
            fn($slice) => array_map(fn($i) => [
                'index' => $i['index'],
                'title' => $i['title'],
                'text'  => $i['text'],
                'url'   => $i['mp4'],            // '' when it's an iframe-only entry
                'thumb' => $i['cover']['thumb'] ?? '',
                'id'    => $i['cover']['id'],
                'type'  => $i['cover']['class'], // 'vmeo-video' | 'ytb-video'
            ], $slice)
        ),
    ]);

    register_rest_route('shaneshop/v1', '/portfolio/(?P<id>\d+)', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args'                => $args,
        'callback'            => fn(WP_REST_Request $req) => shaneshop_gallery_response(
            $req,
            'shaneshop_normalise_portfolio',
            'shaneshop_portfolio_payload'
        ),
    ]);
});