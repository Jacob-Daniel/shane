<?php
get_header( 'shop' );
?>
<main class="checkout min-h-screen px-5 mt-[100px]">
	<div class="mx-auto w-full max-w-5xl">

		<div class="flex items-center justify-between gap-4 py-4">
			<?php woocommerce_breadcrumb(); ?>
		</div>

		<?php while ( have_posts() ) : the_post(); ?>
			<?php the_content(); ?>
		<?php endwhile; ?>

	</div>
</main>
<?php
get_footer( 'shop' );
