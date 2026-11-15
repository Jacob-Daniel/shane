<?php

get_header( 'shop' );

$term = get_queried_object();

$args = [
    'limit'   => -1,
    'status'  => 'publish',
    'orderby' => 'menu_order',
    'order'   => 'ASC',
];

if ( $term instanceof WP_Term && 'product_cat' === $term->taxonomy ) {
    $args['category'] = [ $term->slug ];
}

$products = wc_get_products( $args );

?>
<main class="shop-page flex flex-col items-center justify-center min-h-screen">

	<div id="swiper-outer" class="w-full flex justify-center relative">
		<div id="shop-swiper" class="swiper flex justify-center items-center relative visible max-w-fit">

			<div class="swiper-wrapper items-center">
				<?php foreach ( $products as $product ) :
					$image_id = $product->get_image_id();
					if ( ! $image_id ) continue;
					$src = wp_get_attachment_image_src( $image_id, 'large' );
					if ( ! $src ) continue;
					?>
					<div class="swiper-slide">
						<a href="<?php echo esc_url( $product->get_permalink() ); ?>"
						   class="block group relative w-fit mx-auto">
						   <div class="relative overflow-hidden w-fit">		   	
								<img class="swiper-lazy block h-full w-auto max-h-[70vh] object-contain"
								     loading="lazy"
								     src="<?php echo esc_url( $src[0] ); ?>"
								     alt="<?php echo esc_attr( $product->get_name() ); ?>"/>

								<div class="w-full absolute inset-x-0 bottom-0 p-4 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<h2 class="m-0 text-white text-lg"><?php echo esc_html( $product->get_name() ); ?></h2>
									<p class="m-0 text-white/80 text-sm"><?php echo wp_kses_post( $product->get_price_html() ); ?></p>
								</div>
						   </div>
						</a>
					</div>
				<?php endforeach; ?>
			</div>

			<div class="gallery-slider-counter">
				<span id="current-slide">1</span>/<span id="total-slides"></span>
			</div>
		</div>
			<div class="swiper-button swiper-button-next text-black text-[10px] z-[5000] absolute"></div>
			<div class="swiper-button swiper-button-prev text-black text-[10px] z-[5000] absolute"></div>

	</div>

</main>
<?php get_footer( 'shop' );
