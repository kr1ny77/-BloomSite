(() => {
  'use strict';
  const entrance = document.querySelector('#about');
  if (!entrance) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let armed = true;
  let holding = false;
  let landing = false;
  let idleTimer;
  const release = () => {
    holding = false;
    clearTimeout(idleTimer);
  };
  const cancelLanding = () => {
    if (landing) window.scrollTo({ top: window.scrollY, behavior: 'instant' });
    landing = false;
    armed = true;
    release();
  };
  const finishGesture = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(release, 160);
  };
  window.addEventListener(
    'wheel',
    (event) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        reducedMotion.matches ||
        !event.cancelable
      ) {
        cancelLanding();
        return;
      }
      const boundary = window.scrollY + entrance.getBoundingClientRect().top;
      if (event.deltaY < 0) {
        cancelLanding();
        return;
      }
      if (!event.deltaY) return;
      if (holding) {
        event.preventDefault();
        finishGesture();
        return;
      }
      // Beyond this single entrance the browser owns every pixel of scrolling.
      // A new gesture must not restart an unfinished smooth landing.
      if (!armed || window.scrollY >= boundary - 1) {
        landing = false;
        return;
      }
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1);
      if (window.scrollY + delta < boundary) return;
      event.preventDefault();
      armed = false;
      holding = true;
      landing = true;
      window.scrollTo({ top: boundary, behavior: 'smooth' });
      finishGesture();
    },
    { passive: false },
  );
  ['keydown', 'pointerdown', 'touchstart', 'hashchange', 'resize'].forEach(
    (type) => {
      window.addEventListener(type, cancelLanding, { passive: true });
    },
  );
})();
