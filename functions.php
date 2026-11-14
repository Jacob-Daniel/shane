<?php
if (!defined('ABSPATH')) exit;

define('SHANESHOP_VERSION', '1.0.0');
define('SHANESHOP_DIR', get_template_directory());
define('SHANESHOP_URI', get_template_directory_uri());

require_once SHANESHOP_DIR . '/inc/metaboxes.php';
require_once SHANESHOP_DIR . '/inc/gallery-render.php';

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['style', 'script']);
    add_theme_support('custom-logo');

    register_nav_menus(['primary' => __('Primary Menu', 'shaneshop')]);

    add_image_size('gallery_large', 1600, 0, false);
    add_image_size('gallery_thumb', 300, 300, true);
    add_image_size('small', 500);

    add_theme_support( 'woocommerce' );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );
});

add_filter('document_title_separator', fn() => '–');

add_filter( 'nav_menu_css_class', function ( $classes, $item, $args ) {
    if ( isset( $args->theme_location ) && 'primary' === $args->theme_location ) {
        $classes[] = 'inline-block mb-0 pb-0 text-center';
    }
    return $classes;
}, 10, 3 );

add_action('wp_head', function () {
    if (is_front_page()) {
        echo '<meta name="description" content="' . esc_attr(get_bloginfo('description')) . '">' . "\n";
    }
}, 1);

add_action('wp_enqueue_scripts', function () {
    $films     = is_page_template('page_films.php');
    $portfolio = is_page_template('page_portfolio.php');
    $shop      = is_shop() || is_product_category();

    wp_enqueue_style( 'typekit', 'https://use.typekit.net/lcj8zuc.css', array(), null );
    wp_enqueue_style('shaneshop', SHANESHOP_URI . '/style.css', ['typekit'], SHANESHOP_VERSION);
    wp_enqueue_script('fitvids', SHANESHOP_URI . '/js/fitvids.js', ['jquery'], SHANESHOP_VERSION, true);
    wp_enqueue_script('shaneshop-nav', SHANESHOP_URI . '/js/nav.js', [], SHANESHOP_VERSION, true);
    wp_enqueue_style( 'shaneshop-tailwind', get_stylesheet_directory_uri() . '/dist/style.css', array(), filemtime( get_stylesheet_directory() . '/dist/style.css' ) );

    if ($films || $portfolio) {
        wp_enqueue_style('swiper-style', 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.css');
        wp_enqueue_script('swiper', 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.js', array(), null, true);
        wp_enqueue_script('gsap', 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js', [], null, true);

    }
    if ($films) {
        wp_enqueue_script('masonry-js', 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js', array(), '', true);
        wp_enqueue_script('films', SHANESHOP_URI . '/js/films.js', ['swiper', 'gsap'], SHANESHOP_VERSION, true);
    }
    if ($portfolio) {
        wp_enqueue_script('folio', SHANESHOP_URI . '/js/folio.js', ['swiper', 'gsap'], SHANESHOP_VERSION, true);
    }

    //Woo
    if ($shop) {
        wp_enqueue_style('swiper-style', 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.css');
        wp_enqueue_script('swiper', 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.js', [], null, true);
        wp_enqueue_script('gsap', 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js', [], null, true);
        wp_enqueue_script('shop-slider', SHANESHOP_URI . '/js/shop.js', ['swiper', 'gsap'], SHANESHOP_VERSION, true);
    }

});

//Woo

add_action('wp_enqueue_scripts', function () {
    if ( ! is_woocommerce() && ! is_cart() && ! is_checkout() && ! is_account_page() ) {
        wp_dequeue_style('woocommerce-general');
        wp_dequeue_style('woocommerce-layout');
        wp_dequeue_style('woocommerce-smallscreen');
        wp_dequeue_script('wc-cart-fragments');
        wp_dequeue_script('woocommerce');
    }
    if ( is_product() ) {
        wp_dequeue_style( 'woocommerce-layout' );
    }    
}, 99);

add_action( 'init', function () {
    remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
    remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
    remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );

} );

add_filter( 'woocommerce_product_thumbnails_columns', fn() => 4 ); // gallery thumbs, leave as is

add_action( 'woocommerce_single_product_summary', function () {
    $id   = get_the_ID();
    $rows = [
        'Edition' => get_post_meta( $id, '_print_edition', true ),
        'Paper'   => get_post_meta( $id, '_print_paper', true ),
        'Size'    => get_post_meta( $id, '_print_size', true ),
        'Framing' => get_post_meta( $id, '_print_framed', true ),
        'Year'    => get_post_meta( $id, '_print_year', true ),
    ];
    $rows = array_filter( $rows );

    if ( ! $rows ) return;

    echo '<dl class="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">';
    foreach ( $rows as $label => $value ) {
        printf(
            '<dt class="text-neutral-500">%s</dt><dd class="m-0">%s</dd>',
            esc_html( $label ),
            esc_html( $value )
        );
    }
    echo '</dl>';

    $ships = get_post_meta( $id, '_print_ships', true );
    if ( $ships ) {
        printf( '<p class="mt-4 text-sm text-neutral-500">%s</p>', esc_html( $ships ) );
    }
}, 25 );

add_action( 'woocommerce_single_product_summary', function () {
    $sub = get_post_meta( get_the_ID(), '_print_subtitle', true );
    if ( $sub ) {
        printf( '<p class="mt-1 text-sm italic text-neutral-600">%s</p>', esc_html( $sub ) );
    }
}, 6 );

add_action( 'cmb2_admin_init', function () {
    $box = new_cmb2_box([
        'id'           => 'shane_print_details',
        'title'        => __( 'Print details', 'shaneshop' ),
        'object_types' => [ 'product' ],
        'context'      => 'normal',
        'priority'     => 'high',
    ]);

    foreach ( [
        '_print_subtitle' => 'Subtitle',
        '_print_edition'  => 'Edition',
        '_print_paper'    => 'Paper',
        '_print_size'     => 'Size',
        '_print_framed'   => 'Framing',
        '_print_year'     => 'Year',
        '_print_ships'    => 'Shipping note',
    ] as $key => $label ) {
        $box->add_field([
            'name' => $label,
            'id'   => $key,
            'type' => 'text',
        ]);
    }
} );


// Legacy removed block styles.
add_action('wp_enqueue_scripts', function () {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('global-styles');
}, 100);