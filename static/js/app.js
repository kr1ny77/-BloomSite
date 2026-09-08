(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  const light = document.querySelector('.app-section');
  const progress = document.querySelector('.progress');
  const steps = [...document.querySelectorAll('.story-step')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;
  const syncHeader = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    const rect = light.getBoundingClientRect();
    header.classList.toggle('on-light', rect.top <= 75 && rect.bottom > 75);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  window.addEventListener('scroll', syncHeader, { passive: true });
  window.addEventListener('resize', syncHeader, { passive: true });
  syncHeader();
  document.querySelectorAll('[aria-disabled="true"]').forEach(button => {
    button.addEventListener('click', event => event.preventDefault());
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -75, duration: 1.3 });
      else target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', link.getAttribute('href'));
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  if (!window.gsap || !window.ScrollTrigger) {
    steps.forEach(step => step.classList.add('active'));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
      lenis.on('scroll', ScrollTrigger.update);
    }
    const tick = time => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.from('.hero-label, .hero h1 .line, .hero-copy, .hero .stores', { y: 28, opacity: 0, duration: 1.1, stagger: .12, ease: 'power3.out' });
    gsap.to('.hero h1 .line', { yPercent: -35, stagger: .06, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-art img', { scale: 1.12, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    document.querySelectorAll('.line-mask').forEach(line => {
      gsap.from(line.firstElementChild, { yPercent: 105, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none none' } });
    });
    gsap.from('.context-visual', { clipPath: 'inset(12% 5% 12% 5%)', ease: 'none', scrollTrigger: { trigger: '.context-visual', start: 'top 95%', end: 'top 25%', scrub: .8 } });
    gsap.fromTo('.context-visual > img', { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.context-visual', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.question-list p', { y: 20, opacity: 0, stagger: .16, duration: .8, scrollTrigger: { trigger: '.question-list', start: 'top 93%' } });
    gsap.from('.trust-item', { y: 35, opacity: 0, stagger: .2, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: '.trust-chain', start: 'top 85%' } });
    gsap.from('.device', { y: 100, opacity: 0, scale: .95, stagger: .15, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.devices', start: 'top 85%' } });
    gsap.from('.final h2, .final p, .final .stores', { y: 35, opacity: 0, stagger: .12, duration: 1, scrollTrigger: { trigger: '.final-body', start: 'top 80%' } });
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; steps.forEach(step => step.classList.add('active')); };
  });
  media.add({ desktop: '(min-width: 761px) and (min-height: 760px)', mobile: '(max-width: 760px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions.motion) return;
    if (context.conditions.desktop) {
      document.querySelector('.rating-stage').classList.add('story-running');
      const timeline = gsap.timeline({ scrollTrigger: { trigger: '.rating-stage', start: 'top top', end: '+=1900', pin: true, scrub: .65, anticipatePin: 1, onUpdate: self => {
        const index = Math.min(2, Math.floor(self.progress * 3));
        steps.forEach((step, i) => step.classList.toggle('active', i === index));
      } } });
      timeline.fromTo('.dial-value', { strokeDasharray: '250 1000' }, { strokeDasharray: '690 1000', duration: 3, ease: 'none' }, 0)
        .fromTo('.rating-phone', { y: 25, rotation: 9 }, { y: -20, rotation: 4, duration: 3 }, 0)
        .fromTo('.conclusion', { opacity: .35 }, { opacity: 1, duration: .6 }, 2.4);
    } else {
      steps.forEach(step => step.classList.add('active'));
      gsap.fromTo('.dial-value', { strokeDasharray: '250 1000' }, { strokeDasharray: '690 1000', ease: 'none', scrollTrigger: { trigger: '.rating-stage', start: 'top 65%', end: 'center 40%', scrub: .6 } });
    }
    return () => document.querySelector('.rating-stage').classList.remove('story-running');
  });
  window.addEventListener('load', () => { ScrollTrigger.refresh(); syncHeader(); });
})();
