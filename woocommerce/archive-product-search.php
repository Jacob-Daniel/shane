<?php
get_header( 'shop' );
?>
<main class="archive-product-search min-h-screen px-5 mt-[100px]">
	<div class="mx-auto w-full max-w-5xl">

		<div class="flex items-center justify-between gap-4 py-4">
			<?php woocommerce_breadcrumb(); ?>
			<?php get_product_search_form(); ?>
		</div>

		<?php if ( have_posts() ) : ?>

			<p class="mb-6 text-sm text-neutral-500">
				<?php
				printf(
					esc_html( _n( '%s result for', '%s results for', $wp_query->found_posts, 'shaneshop' ) ),
					number_format_i18n( $wp_query->found_posts )
				);
				?>
				<span class="text-neutral-900">&ldquo;<?php echo esc_html( get_search_query() ); ?>&rdquo;</span>
			</p>

			<ul class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 list-none p-0 m-0">
				<?php while ( have_posts() ) : the_post(); ?>
					<?php wc_get_template_part( 'content', 'product' ); ?>
				<?php endwhile; ?>
			</ul>

			<div class="py-10">
				<?php woocommerce_pagination(); ?>
			</div>

		<?php else : ?>

			<div class="py-24 text-center">
				<h1 class="text-2xl font-semibold mb-3">
					<?php esc_html_e( 'No products found', 'shaneshop' ); ?>
				</h1>
				<p class="text-neutral-500 mb-8">
					<?php
					printf(
						esc_html__( 'Nothing matched &ldquo;%s&rdquo;. Try a different term or browse the shop.', 'shaneshop' ),
						esc_html( get_search_query() )
					);
					?>
				</p>
				<a href="<?php echo esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ); ?>"
				   class="inline-block rounded bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-700">
					<?php esc_html_e( 'Back to shop', 'shaneshop' ); ?>
				</a>
			</div>

		<?php endif; ?>

	</div>
</main>
<?php
get_footer( 'shop' );
