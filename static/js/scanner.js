(() => {
  'use strict';
  const scene = document.querySelector('.scanner-scene');
  if (!scene) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      scene.setAttribute('data-scanned', '');
      observer.disconnect();
    },
    { threshold: 0.5 },
  );
  observer.observe(scene);
})();
