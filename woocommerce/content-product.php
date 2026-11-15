<?php
/**
 * @see     https://woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 9.4.0
 */

global $product;

if ( ! is_a( $product, WC_Product::class ) || ! $product->is_visible() ) {
	return;
}
?>
<li <?php wc_product_class( 'group relative overflow-hidden flex flex-col justify-center ', $product ); ?>>
	<div class="relative overflow-hidden w-fit mx-auto">
		<?php do_action( 'woocommerce_before_shop_loop_item' ); ?>
		<?php do_action( 'woocommerce_before_shop_loop_item_title' ); ?>

		<div class="flex flex-col gap-1 pointer-events-none absolute inset-x-0 -bottom-1 translate-y-full bg-black p-4 transition-transform duration-300 ease-out group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
			<?php do_action( 'woocommerce_shop_loop_item_title' ); ?>
			<?php do_action( 'woocommerce_after_shop_loop_item_title' ); ?>
			<?php do_action( 'woocommerce_after_shop_loop_item' ); ?>
		</div>
	</div>
</li>
