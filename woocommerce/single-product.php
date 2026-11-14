<?php
if ( ! defined( 'ABSPATH' ) ) exit;

get_header( 'shop' );
?>
<main class="single-product min-h-screen px-5 mt-[100px]">
	<div class="mx-auto w-full max-w-5xl">

		<div class="flex items-center justify-between gap-4 py-4">
			<nav class="breadcrumb text-sm"><?php woocommerce_breadcrumb(); ?></nav>
			<div class="w-full max-w-xs"><?php get_product_search_form(); ?></div>
		</div>

		<?php while ( have_posts() ) : the_post(); ?>
			<?php wc_get_template_part( 'content', 'single-product' ); ?>
		<?php endwhile; ?>

	</div>
</main>
<?php
get_footer( 'shop' );

