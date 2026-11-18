<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('shaneshop/v1', '/films/(?P<id>\d+)', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'args' => [
            'page'     => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 5, 'sanitize_callback' => 'absint'],
        ],
        'callback' => function (WP_REST_Request $req) {
            $post_id = (int) $req['id'];
            if (get_post_status($post_id) !== 'publish') {
                return new WP_Error('not_found', 'Gallery not found', ['status' => 404]);
            }

            $items = shaneshop_normalise_entries(shaneshop_get_entries($post_id));
            $total = count($items);

            $page     = max(1, (int) $req['page']);
            $per_page = min(20, max(1, (int) $req['per_page']));
            $slice    = array_slice($items, ($page - 1) * $per_page, $per_page);

            $payload = array_map(fn($i) => [
                'index' => $i['index'],
                'title' => $i['title'],
                'text'  => $i['text'],
                'url'   => $i['mp4'],          // '' when it's an iframe-only entry
                'thumb' => $i['cover']['thumb'] ?? '',
                'id'    => $i['cover']['id'],
                'type'  => $i['cover']['class'], // 'vmeo-video' | 'ytb-video'
            ], $slice);

            $res = rest_ensure_response($payload);
            $res->header('X-WP-Total', (string) $total);
            $res->header('X-WP-TotalPages', (string) max(1, (int) ceil($total / $per_page)));
            return $res;
        },
    ]);
});
