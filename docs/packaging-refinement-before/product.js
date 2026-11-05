(() => {
  'use strict';
  const host = document.querySelector('[data-package-viewer]');
  if (!host) return;
  const panel = document.querySelector('#journey-package');
  const menu = document.querySelector('#site-menu');
  const errorMessage = panel.querySelector('[data-viewer-error]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let viewer,
    loading,
    pointer,
    frame = 0,
    previous;
  let yaw = 0,
    pitch = 0,
    velocityX = 0,
    velocityY = 0;
  let visible = false,
    hovered = false,
    focused = false,
    paused = false;
  let suspended = false,
    disposed = false;
  const active = () =>
    viewer &&
    visible &&
    !disposed &&
    !suspended &&
    !document.hidden &&
    !menu?.open &&
    !panel.hasAttribute('inert');
  const auto = () =>
    !reduce.matches && !paused && !hovered && !focused && !pointer;
  const paint = () => viewer?.rotate(yaw, pitch);
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = undefined;
    velocityX = velocityY = 0;
  };
  const tick = (now) => {
    frame = 0;
    if (!active() || reduce.matches) return;
    const dt = Math.min((now - (previous ?? now - 16)) / 1000, 0.032);
    previous = now;
    velocityX *= Math.exp(-7 * dt);
    velocityY *= Math.exp(-7 * dt);
    yaw += (velocityX + (auto() ? 0.18 : 0)) * dt;
    pitch += velocityY * dt;
    paint();
    if (auto() || Math.abs(velocityX) + Math.abs(velocityY) > 0.01)
      frame = requestAnimationFrame(tick);
    else previous = undefined;
  };
  const resume = () => {
    if (
      !frame &&
      active() &&
      !reduce.matches &&
      (auto() || Math.abs(velocityX) + Math.abs(velocityY) > 0.01)
    )
      frame = requestAnimationFrame(tick);
  };
  const cancelDrag = () => {
    const id = pointer?.id;
    pointer = null;
    host.removeAttribute('data-dragging');
    if (id !== undefined && host.hasPointerCapture(id))
      host.releasePointerCapture(id);
    stop();
  };
  const failed = (error) => {
    cancelDrag();
    viewer?.dispose();
    viewer = undefined;
    host.removeAttribute('data-ready');
    host.removeAttribute('tabindex');
    host.removeAttribute('role');
    host.removeAttribute('aria-label');
    errorMessage.hidden = false;
    console.error('Bloom 3D unavailable:', error);
  };
  const load = async () => {
    if (loading || disposed) return;
    loading = true;
    try {
      const engine = await import('/static/js/product-viewer.js');
      const candidate = await engine.mount(host);
      if (disposed) {
        candidate.dispose();
        return;
      }
      viewer = candidate;
      host.setAttribute('data-ready', '');
      host.setAttribute('tabindex', '0');
      host.setAttribute('role', 'group');
      host.setAttribute(
        'aria-label',
        'Вращающийся образец йогурта. Перетаскивайте или вращайте колесом. Стрелки поворачивают по двум осям, Home возвращает лицевую сторону, End показывает штрихкод. Пробел: пауза или автовращение.',
      );
      paint();
      resume();
    } catch (error) {
      if (!disposed) failed(error);
    }
  };
  const preloadObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        preloadObserver.disconnect();
        void load();
      }
    },
    { rootMargin: '160px' },
  );
  preloadObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) resume();
      else cancelDrag();
    },
    { threshold: 0.05 },
  );
  visibilityObserver.observe(host);
  host.addEventListener('bloom:viewererror', () =>
    failed(new Error('WebGL context lost')),
  );
  host.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') {
      hovered = true;
      stop();
    }
  });
  host.addEventListener('pointerleave', () => {
    hovered = false;
    resume();
  });
  host.addEventListener('focus', () => {
    focused = true;
    stop();
  });
  host.addEventListener('blur', () => {
    focused = false;
    resume();
  });
  // Empty canvas space and browser zoom never intercept page scrolling.
  host.addEventListener(
    'wheel',
    (event) => {
      if (
        !viewer ||
        panel.hasAttribute('inert') ||
        event.ctrlKey ||
        event.metaKey ||
        event.cancelable === false ||
        !viewer.hitTest(event.clientX, event.clientY)
      )
        return;
      const raw =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      if (!raw) return;
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? host.clientHeight
            : 1;
      const delta = Math.max(-180, Math.min(180, raw * unit)) * 0.0045;
      event.preventDefault();
      cancelDrag();
      if (event.shiftKey) pitch += delta;
      else yaw += delta;
      paint();
    },
    { passive: false },
  );
  host.addEventListener('pointerdown', (event) => {
    if (
      !viewer ||
      panel.hasAttribute('inert') ||
      !event.isPrimary ||
      event.button !== 0 ||
      pointer ||
      !viewer.hitTest(event.clientX, event.clientY)
    )
      return;
    stop();
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      touch: event.pointerType === 'touch',
      dragging: false,
      time: event.timeStamp,
      vx: 0,
      vy: 0,
    };
    host.setPointerCapture(event.pointerId);
  });
  host.addEventListener('pointermove', (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x,
      dy = event.clientY - pointer.y;
    if (!pointer.dragging) {
      const x = Math.abs(event.clientX - pointer.startX),
        y = Math.abs(event.clientY - pointer.startY);
      if (Math.max(x, y) < 6 || (pointer.touch && x < y)) return;
      pointer.dragging = true;
      host.setAttribute('data-dragging', '');
    }
    const dt = Math.max(event.timeStamp - pointer.time, 1);
    pointer.vx = (dx / dt) * 12;
    pointer.vy = pointer.touch ? 0 : (dy / dt) * 12;
    yaw += dx * 0.012;
    if (!pointer.touch) pitch += dy * 0.012;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.time = event.timeStamp;
    paint();
  });
  const release = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const old = pointer;
    cancelDrag();
    if (
      event.type !== 'pointercancel' &&
      event.timeStamp - old.time <= 100 &&
      !reduce.matches
    ) {
      velocityX = Math.max(-7, Math.min(7, old.vx));
      velocityY = Math.max(-7, Math.min(7, old.vy));
    }
    resume();
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', (event) => {
    if (pointer?.id === event.pointerId) {
      cancelDrag();
      resume();
    }
  });
  host.addEventListener('keydown', (event) => {
    if (!viewer || panel.hasAttribute('inert')) return;
    if (
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        ' ',
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    cancelDrag();
    if (event.key === ' ') {
      paused = !(paused || focused);
      // Keyboard users can explicitly resume while keeping focus on the object.
      focused = false;
      resume();
      return;
    }
    focused = true;
    const step = Math.PI / 12;
    if (event.key === 'ArrowLeft') yaw -= step;
    if (event.key === 'ArrowRight') yaw += step;
    if (event.key === 'ArrowUp') pitch -= step;
    if (event.key === 'ArrowDown') pitch += step;
    if (event.key === 'Home') yaw = pitch = 0;
    if (event.key === 'End') {
      yaw = Math.PI;
      pitch = 0;
    }
    paint();
  });
  reduce.addEventListener('change', () => {
    cancelDrag();
    resume();
  });
  document.addEventListener('visibilitychange', () => {
    cancelDrag();
    resume();
  });
  const stateObserver = new MutationObserver(() => {
    if (panel.hasAttribute('inert')) cancelDrag();
    else resume();
  });
  stateObserver.observe(panel, {
    attributes: true,
    attributeFilter: ['inert'],
  });
  const menuObserver = new MutationObserver(() => {
    if (menu?.open) cancelDrag();
    else resume();
  });
  if (menu)
    menuObserver.observe(menu, { attributes: true, attributeFilter: ['open'] });
  window.addEventListener('pagehide', (event) => {
    suspended = true;
    cancelDrag();
    if (!event.persisted) {
      disposed = true;
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      stateObserver.disconnect();
      menuObserver.disconnect();
      viewer?.dispose();
    }
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    resume();
  });
})();
