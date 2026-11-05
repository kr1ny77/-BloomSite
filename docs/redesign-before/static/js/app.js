(() => {
  'use strict';
  // Scene movement belongs to the browser. Only the reading-step color changes.
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting));
  }, { rootMargin: '-25% 0px -25% 0px', threshold: 0.1 });
  document.querySelectorAll('.method-list li').forEach((step) => observer.observe(step));
})();
