(() => {
  'use strict';
  const preview = document.querySelector('.menu-preview');
  if (!preview) return;
  const image = preview.querySelector('img');
  const caption = preview.querySelector('.menu-preview-caption');
  const assets = {
    choice: [
      '/static/images/inside-fruit-768.webp',
      'Загляните в привычные продукты.',
    ],
    path: [
      '/static/images/menu-ingredients.webp',
      'От привычного продукта к понятным фактам.',
    ],
    app: [
      '/static/images/bloom-mark-96.webp',
      'Bloom среди привычных приложений. Концепт.',
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
  let revision = 0;
  const cache = new Map();
  const select = async (key, instant = false) => {
    const current = ++revision;
    const [src, text] = assets[key];
    preview.setAttribute('aria-busy', 'true');
    preview.toggleAttribute('data-instant', instant);
    try {
      if (!cache.has(src)) {
        const candidate = new Image();
        candidate.src = src;
        cache.set(src, candidate.decode());
      }
      await cache.get(src);
      if (current !== revision) return;
      image.src = src;
      caption.textContent = text;
      preview.dataset.preview = key;
      preview.removeAttribute('data-image-error');
    } catch (error) {
      cache.delete(src);
      if (current !== revision) return;
      preview.setAttribute('data-image-error', '');
      caption.textContent = text;
      console.error('Bloom menu preview unavailable:', error);
    } finally {
      if (current === revision) preview.removeAttribute('aria-busy');
    }
  };
  document.querySelectorAll('.menu-links a').forEach((link) => {
    link.addEventListener(
      'pointerenter',
      () => void select(link.dataset.preview),
    );
    link.addEventListener(
      'focus',
      () => void select(link.dataset.preview, true),
    );
  });
})();
