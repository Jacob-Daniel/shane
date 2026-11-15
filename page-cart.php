<?php
get_header( 'shop' );
?>
<main class="cart min-h-screen px-5 mt-[100px]">
	<div class="mx-auto w-full max-w-5xl">
		<?php woocommerce_breadcrumb(); ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<?php the_content(); ?>
		<?php endwhile; ?>
	</div>
</main>
<?php
get_footer( 'shop' );
