(() => {
  'use strict';
  const root = document.documentElement;
  const menu = document.querySelector('#site-menu');
  const trigger = document.querySelector('.menu-toggle');
  const close = document.querySelector('.menu-close');
  const theme = document.querySelector('.theme-toggle');
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  document.body.classList.add('enhanced');

  const updateThemeLabel = () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : darkScheme.matches;
    theme.setAttribute(
      'aria-label',
      dark ? 'Включить светлую тему' : 'Включить тёмную тему',
    );
  };
  theme.hidden = false;
  updateThemeLabel();
  darkScheme.addEventListener('change', updateThemeLabel);
  theme.addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : darkScheme.matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    updateThemeLabel();
  });

  // Native dialog owns focus containment, Escape, and restoration to its trigger.
  trigger.hidden = false;
  trigger.addEventListener('click', (event) => {
    menu.toggleAttribute('data-instant', event.detail === 0);
    menu.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  close.addEventListener('click', (event) => {
    menu.toggleAttribute('data-instant', event.detail === 0);
    menu.close();
  });
  menu.addEventListener('click', (event) => {
    if (event.target === menu) menu.close();
  });
  menu.addEventListener('cancel', () => menu.setAttribute('data-instant', ''));
  const menuStops = [...menu.querySelectorAll('button, a[href]')];
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const first = menuStops[0];
    const last = menuStops[menuStops.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  let pendingDestination;
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (!pendingDestination) return;
    const { target, hash } = pendingDestination;
    pendingDestination = null;
    // Restore the document's scroll container before navigating out of a pin.
    window.requestAnimationFrame(() => {
      history.pushState(null, '', hash);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'instant' });
      window.dispatchEvent(new CustomEvent('bloom:navigated'));
    });
  });
  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        pendingDestination = { target, hash: link.getAttribute('href') };
      }
      menu.close();
    });
    const preview = () => {
      const image = menu.querySelector('.menu-preview img');
      const assets = {
        choice: [
          '/static/images/everyday-choice-768.webp',
          'Всё начинается с вашего выбора.',
        ],
        path: [
          '/static/images/journey-package-500.webp',
          'От упаковки к понятному объяснению.',
        ],
        app: [
          '/static/images/composition-phone.webp',
          'Демонстрационный экран будущего приложения.',
        ],
        trust: [
          '/static/images/bloom-mark-640.webp',
          'У каждого вывода своё основание.',
        ],
        launch: [
          '/static/images/bloom-mark-640.webp',
          'Bloom. Приложение в разработке.',
        ],
      };
      const [src, caption] = assets[link.dataset.preview];
      image.src = src;
      menu.querySelector('.menu-preview-caption').textContent = caption;
    };
    link.addEventListener('pointerenter', preview);
    link.addEventListener('focus', preview);
  });

  if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('main section[id]')];
    const links = [
      ...document.querySelectorAll('.primary-nav a, .menu-links a'),
    ];
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        const active = sections.find((section) => visible.has(section));
        if (!active) return;
        links.forEach((link) => {
          if (link.hash === `#${active.id === 'inside' ? 'about' : active.id}`)
            link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
  }
})();
