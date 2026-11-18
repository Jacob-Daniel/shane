<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header fixed left-0 z-[1000] w-full">
  <div class="header-site-title flex flex-col gap-[0.3rem]">
    <h1 class="site-title">
      <a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
    </h1>
    <p class="site-description text-[#B2B2B2]"><?php bloginfo('description'); ?></p>
  </div>

  <div class="header-navbar group relative w-full grid">
    <button class="menu-toggle col-start-1 row-start-1 home:justify-self-center home:self-center transition-opacity duration-300 group-hover:opacity-0 group-hover:invisible" aria-expanded="false" aria-controls="nav-primary">
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M17.418 6.109c.272-.268.709-.268.979 0 .27.268.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/></svg>
    </button>

    <nav class="h-[30px] nav-primary col-start-1 row-start-1 flex items-center justify-center invisible opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100" id="nav-primary" aria-label="Main">
      <?php wp_nav_menu([
        'theme_location' => 'primary',
        'container'      => false,
        'menu_id'        => 'menu-main-menu',
        'menu_class'     => 'nav-menu flex items-center leading-none',
        'link_before'    => '<span class="text-xs font-medium hover:text-[#B2B2B2]">',
        'link_after'     => '</span>',
        'fallback_cb'    => false,
      ]); ?>
    </nav>
  </div>
</header>
