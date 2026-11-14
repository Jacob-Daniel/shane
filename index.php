<?php get_header(); ?>
<main class="content">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
    <article <?php post_class(); ?>>
        <h1><?php the_title(); ?></h1>
        <?php the_content(); ?>
    </article>
<?php endwhile; else : ?>
    <p><?php esc_html_e('Nothing found.', 'shaneshop'); ?></p>
<?php endif; ?>
</main>
<?php get_footer(); ?>

