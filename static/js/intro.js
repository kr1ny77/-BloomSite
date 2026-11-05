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
    artwork.pause();
    host.dataset.introState = 'static';
    artwork.hidden = true;
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

  // Use the native video clock and media events, not image animation timers.
  artwork.addEventListener(
    'canplay',
    () => {
      if (finished || motion.matches) return;
      try {
        const playback = artwork.play();
        if (playback) void playback.catch(showStill);
      } catch {
        showStill();
      }
    },
    { once: true },
  );
  artwork.addEventListener('playing', () => {
    if (finished || motion.matches) {
      showStill();
      return;
    }
    window.clearTimeout(timer);
    artwork.hidden = false;
    host.dataset.introState = 'playing';
  });
  artwork.addEventListener('ended', showStill, { once: true });
  artwork.addEventListener('error', showStill, { once: true });
  artwork.addEventListener('waiting', () => {
    // Brief decoder/network stalls may recover; only abandon a sustained stall.
    if (finished || host.dataset.introState !== 'playing') return;
    window.clearTimeout(timer);
    timer = window.setTimeout(showStill, 1800);
  });
  artwork.muted = true;
  artwork.playsInline = true;
  artwork.playbackRate = 1;
  artwork.preload = 'auto';
  for (const source of artwork.querySelectorAll('source')) {
    source.src = dark() ? source.dataset.darkSrc : source.dataset.lightSrc;
  }
  timer = window.setTimeout(showStill, 1800);
  artwork.load();
})();
