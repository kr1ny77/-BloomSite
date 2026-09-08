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

  // All content stays visible: only artwork moves, never text or section containers.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (window.Lenis) {
      lenis = new Lenis({ duration: .8, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
    }
    const tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.fromTo('.context-visual > img', { scale: 1.035 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.context-visual', start: 'top bottom', end: 'bottom top', scrub: .5 }
    });
    gsap.from('.phone', {
      y: 18, duration: .9, stagger: .1, ease: 'power2.out',
      scrollTrigger: { trigger: '.devices', start: 'top 88%', once: true }
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
  window.addEventListener('load', () => { ScrollTrigger.refresh(); syncHeader(); });
  window.addEventListener('pageshow', () => { ScrollTrigger.refresh(); syncHeader(); });
})();
