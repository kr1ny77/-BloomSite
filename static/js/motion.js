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
        // The everyday photograph gently opens as the reader enters its context.
        gsap.fromTo(
          '.context-visual img',
          { scale: 1.04 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.context-visual',
              start: 'top bottom',
              end: 'bottom center',
              scrub: 0.5,
            },
          },
        );
        // The frame opens as the reader discovers the detail inside familiar food.
        gsap.fromTo(
          '.inside-visual',
          { scale: 0.94 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.inside',
              start: 'top 85%',
              end: 'top 20%',
              scrub: 0.5,
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
    media.add(
      '(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)',
      () => {
        const journey = document.querySelector('[data-journey][data-enhanced]');
        if (!journey) return;
        const viewport = journey.querySelector('.journey-viewport');
        journey.setAttribute('data-scroll', '');
        let currentStep = -1;
        const showStep = (self) => {
          const index = Math.min(2, Math.floor(self.progress * 3));
          if (index === currentStep) return;
          currentStep = index;
          journey.dispatchEvent(
            new CustomEvent('bloom:journeystep', { detail: { index } }),
          );
        };
        // Explanation: one physical object leads to its ingredients, then its conclusion.
        const story = gsap.timeline({
          scrollTrigger: {
            trigger: viewport,
            start: 'top top',
            end: '+=180%',
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: showStep,
            onRefresh: showStep,
          },
        });
        story.to(journey.querySelectorAll('.journey-object'), {
          y: -18,
          duration: 1,
          ease: 'none',
        });
        const seek = (event) => {
          const trigger = story.scrollTrigger;
          const progress = (event.detail.index + 0.5) / 3;
          // A discrete selection stays on its chosen scene; no animated scroll through others.
          window.scrollTo({
            top: trigger.start + (trigger.end - trigger.start) * progress,
            behavior: 'instant',
          });
        };
        journey.addEventListener('bloom:journeyrequest', seek);
        return () => {
          journey.removeEventListener('bloom:journeyrequest', seek);
          journey.removeAttribute('data-scroll');
        };
      },
    );
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('bloom:navigated', () => ScrollTrigger.update());
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
})();
