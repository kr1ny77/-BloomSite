(() => {
  'use strict';
  // The mobile and reduced-motion stories do not download the desktop engine.
  const desktop = window.matchMedia(
    '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  );
  let loading;
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Unable to load ${src}`));
      document.head.append(script);
    });
  const start = async () => {
    await loadScript('/static/js/gsap.min.js');
    await loadScript('/static/js/ScrollTrigger.min.js');
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      () => {
        // Explanation: opening the page moves the large brand gently into the story.
        gsap.to('.hero-brand', {
          y: -45,
          rotation: -3,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
        // Explanation: reveal more of the product as the reader reaches its ingredients.
        gsap.fromTo(
          '.food-scene img',
          { scale: 1.08 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.food-scene',
              start: 'top bottom',
              end: 'bottom center',
              scrub: 0.5,
            },
          },
        );
        // Spatial consistency: a single sticky photograph accompanies the three reading steps.
        gsap.fromTo(
          '.method-picture img',
          { scale: 1.06, xPercent: -2 },
          {
            scale: 1,
            xPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '.method-layout',
              start: 'top center',
              end: 'bottom center',
              scrub: 0.6,
            },
          },
        );
        // The final emblem settles as the future launch comes into view.
        gsap.from('.closing-brand img', {
          y: 45,
          rotation: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.closing',
            start: 'top bottom',
            end: 'center center',
            scrub: 0.6,
          },
        });
      },
    );
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    document
      .querySelectorAll('details')
      .forEach((detail) =>
        detail.addEventListener('toggle', () => ScrollTrigger.refresh()),
      );
    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) media.revert();
    });
  };
  const activate = () => {
    if (!desktop.matches || loading) return;
    // A failed optional asset keeps the complete document and reports its cause.
    loading = start().catch((error) =>
      console.error('Bloom desktop motion unavailable:', error),
    );
  };
  desktop.addEventListener('change', activate);
  activate();
  if ('IntersectionObserver' in window) {
    const steps = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle('is-active', entry.isIntersecting),
        );
      },
      { rootMargin: '-25% 0px -30% 0px', threshold: 0.2 },
    );
    document
      .querySelectorAll('.method-list li')
      .forEach((step) => steps.observe(step));
    window.addEventListener('pagehide', () => steps.disconnect(), {
      once: true,
    });
  }
})();
