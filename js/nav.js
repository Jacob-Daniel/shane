document.querySelectorAll('.site-nav__toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.closest('.site-nav').classList.toggle('is-open', !open);
  });
});