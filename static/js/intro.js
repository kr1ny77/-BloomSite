(() => {
  'use strict';
  const host = document.querySelector('.hero-brand');
  const artwork = document.querySelector('.wordmark-animation');
  const darkSource = document.querySelector('.wordmark-dark-source');
  if (!host || !artwork || !darkSource) return;
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  let timer;
  let finished = false;
  const dark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark' : scheme.matches;
  const updateStatic = () => {
    darkSource.media = dark() ? 'all' : 'not all';
  };
  const showStill = () => {
    finished = true;
    window.clearTimeout(timer);
    host.dataset.introState = 'static';
    artwork.hidden = true;
    artwork.removeAttribute('src');
  };
  const updateTheme = () => {
    updateStatic();
    // Theme changes retain a settled logo rather than replaying its arrival.
    showStill();
  };
  updateStatic();
  new MutationObserver(updateTheme).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  scheme.addEventListener('change', updateTheme);
  motion.addEventListener('change', () => {
    if (motion.matches) showStill();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) showStill();
  });
  if (motion.matches || document.hidden) return;

  const requestedAt = performance.now();
  artwork.addEventListener(
    'load',
    () => {
      // Avoid a delayed blank-to-logo transition on a slow connection.
      if (
        finished ||
        motion.matches ||
        performance.now() - requestedAt > 1200
      ) {
        showStill();
        return;
      }
      artwork.hidden = false;
      host.dataset.introState = 'playing';
      timer = window.setTimeout(showStill, 5000);
    },
    { once: true },
  );
  artwork.addEventListener('error', showStill, { once: true });
  artwork.src = dark() ? artwork.dataset.darkSrc : artwork.dataset.lightSrc;
})();
