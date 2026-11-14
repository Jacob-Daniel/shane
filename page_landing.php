<?php
/**
 * Template Name: Landing
 *
 * @package Shaneshop
 */

get_header();

$video          = get_post_meta(get_the_ID(), 'landing_page_video', true);
$video_auto     = get_post_meta(get_the_ID(), 'landing_page_video_auto', true);
$video_loop     = get_post_meta(get_the_ID(), 'landing_page_video_loop', true);
$video_muted    = get_post_meta(get_the_ID(), 'landing_page_video_muted', true);
$video_controls = get_post_meta(get_the_ID(), 'landing_page_video_controls', true);
$video_overlay  = get_post_meta(get_the_ID(), 'landing_page_video_overlay', true);
$gif            = get_post_meta(get_the_ID(), 'landing_page_gif', true);
$gif_overlay    = get_post_meta(get_the_ID(), 'landing_page_gif_overlay', true);
$gif_repeated   = get_post_meta(get_the_ID(), 'landing_page_gif_repeated', true);

$overlay_color = $gif ? $gif_overlay : $video_overlay;
$bg_size       = $gif_repeated ? 'contain' : 'cover';
?>

<main class="landing-page">
<?php if ($gif) : ?>
    <div class="relative h-screen leading-none bg-cover bg-center"
         style="background-image: url(<?php echo esc_url($gif); ?>); background-size: <?php echo esc_attr($bg_size); ?>;"></div>
<?php elseif ($video) : ?>
    <div class="relative h-screen leading-none">
        <video class="h-full w-full object-cover"
               preload="auto"
               <?php echo $video_auto ? 'autoplay playsinline' : ''; ?>
               <?php echo $video_loop ? 'loop' : ''; ?>
               <?php echo $video_muted ? 'muted' : ''; ?>
               <?php echo $video_controls ? 'controls' : ''; ?>
               src="<?php echo esc_url($video); ?>"></video>
    </div>
<?php endif; ?>

<?php if ($overlay_color) : ?>
    <div class="fixed inset-0 pointer-events-none" style="background-color: <?php echo esc_attr($overlay_color); ?>;"></div>
<?php endif; ?>
</main>

<?php get_footer(); ?>
