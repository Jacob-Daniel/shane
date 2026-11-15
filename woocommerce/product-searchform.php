<?php
/**
 * @version 7.0.1
 */
?>
<form role="search" method="get" class="woocommerce-product-search flex items-end gap-2" action="<?= esc_url( home_url( '/shop/' ) ); ?>">
	<label class="screen-reader-text" for="woocommerce-product-search-field-<?= isset( $index ) ? absint( $index ) : 0; ?>"><?php esc_html_e( 'Search for:', 'woocommerce' ); ?></label>
			<input type="search"
       class="search-field border-b"
       value="<?= get_search_query(); ?>"
       name="s"
       title="<?= esc_attr_x( 'Search for:', 'label', 'woocommerce' ); ?>" />

	<button type="submit" value="<?= esc_attr_x( 'Search', 'submit button', 'woocommerce' ); ?>" class="font-extrabold text-[0.7rem] uppercase leading-2 <?= esc_attr( wc_wp_theme_get_element_class_name( 'button' ) ); ?>"><?= esc_html_x( 'Search', 'submit button', 'woocommerce' ); ?></button>
	<input type="hidden" name="post_type" value="product" />
</form>
