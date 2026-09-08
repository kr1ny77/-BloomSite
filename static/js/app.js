(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  const light = document.querySelector('.app-section');
  const progress = document.querySelector('.progress');
  const steps = [...document.querySelectorAll('.story-step')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;
  let framePending = false;

  function syncHeader() {
    framePending = false;
    header.classList.toggle('scrolled', window.scrollY > 40);
    const rect = light.getBoundingClientRect();
    const midpoint = header.offsetHeight / 2;
    header.classList.toggle('on-light', rect.top <= midpoint && rect.bottom > midpoint);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  function scheduleHeader() {
    if (!framePending) { framePending = true; requestAnimationFrame(syncHeader); }
  }
  window.addEventListener('scroll', scheduleHeader, { passive: true });
  window.addEventListener('resize', scheduleHeader, { passive: true });
  syncHeader();

  document.querySelectorAll('[aria-disabled="true"]').forEach(button => {
    button.addEventListener('click', event => event.preventDefault());
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -header.offsetHeight - 20, duration: .85 });
      else target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', link.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // All content stays visible. Section containers and narrative text never move or fade.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 761px)' }, context => {
    if (!context.conditions.motion) return;
    const desktop = context.conditions.desktop;
    if (window.Lenis) {
      lenis = new Lenis({ duration: .8, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
    }
    const tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.fromTo('.hero-art img', { y: 0, rotation: 0, scale: 1 }, {
      y: desktop ? -34 : -14, rotation: desktop ? -3 : 0, scale: 1.04, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .65 }
    });
    document.querySelectorAll('.section-top').forEach(label => {
      gsap.fromTo(label, { '--line-progress': 0 }, { '--line-progress': 1, ease: 'none',
        scrollTrigger: { trigger: label, start: 'top 90%', end: 'top 48%', scrub: .6 }
      });
    });
    gsap.fromTo('.context-visual > img', { scale: 1.10, clipPath: 'inset(0 4% 0 4%)' }, {
      scale: 1, clipPath: 'inset(0 0% 0 0%)', ease: 'none',
      scrollTrigger: { trigger: '.context-visual', start: 'top 95%', end: 'bottom 35%', scrub: .7 }
    });
    gsap.fromTo('.context-heading .muted', { color: '#aab7af' }, { color: '#f4f5ef', ease: 'none',
      scrollTrigger: { trigger: '.context-heading', start: 'top 80%', end: 'bottom 35%', scrub: .6 }
    });
    document.querySelectorAll('.trust-item').forEach(item => {
      gsap.fromTo(item, { '--line-progress': 0 }, { '--line-progress': 1, ease: 'none',
        scrollTrigger: { trigger: item, start: 'top 88%', end: 'top 48%', scrub: .5 }
      });
    });
    gsap.fromTo('.app-section', { '--line-progress': 0 }, { '--line-progress': 1, ease: 'none',
      scrollTrigger: { trigger: '.app-section', start: 'top 95%', end: 'top 35%', scrub: .5 }
    });
    document.querySelectorAll('.device').forEach((device, index) => {
      const tilt = desktop ? (index - 1) * 2 : 0;
      gsap.fromTo(device, { y: desktop ? 64 : 30, rotation: tilt, rotationY: desktop ? (index - 1) * 7 : 0, scale: .96, transformPerspective: 1200 }, {
        y: 0, rotation: 0, rotationY: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: device, start: 'top 98%', end: 'top 30%', scrub: .65 }
      });
    });
    gsap.fromTo('.phone-score-value', { strokeDasharray: '35 100' }, { strokeDasharray: '92 100', ease: 'none',
      scrollTrigger: { trigger: '.device-one', start: 'top 85%', end: 'top 28%', scrub: .6 }
    });
    gsap.fromTo('.final-art', { y: 20, scale: .94, rotation: -3 }, { y: -10, scale: 1, rotation: 0, ease: 'none',
      scrollTrigger: { trigger: '.final', start: 'top 95%', end: 'bottom bottom', scrub: .7 }
    });
    gsap.fromTo('.final h2 em', { color: '#f4f5ef' }, { color: '#d6ed9d', ease: 'none',
      scrollTrigger: { trigger: '.final-body', start: 'top 85%', end: 'top 38%', scrub: .6 }
    });
    gsap.fromTo('.dial-value', { strokeDasharray: '250 1000' }, {
      strokeDasharray: '690 1000', ease: 'none',
      scrollTrigger: { trigger: '.story-steps', start: 'top 65%', end: 'bottom 55%', scrub: .5 }
    });
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step, start: 'top 60%', end: 'bottom 60%',
        onEnter: () => activate(index), onEnterBack: () => activate(index)
      });
    });
    function activate(index) {
      steps.forEach((step, i) => step.classList.toggle('active', i === index));
    }
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
  });
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target && lenis) lenis.scrollTo(target, { offset: -header.offsetHeight - 20, immediate: true });
    syncHeader();
  });
  window.addEventListener('pageshow', () => { ScrollTrigger.refresh(); syncHeader(); });
})();
