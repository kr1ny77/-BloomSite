(() => {
  'use strict';
  const host = document.querySelector('[data-package-viewer]');
  if (!host) return;
  const panel = document.querySelector('#journey-package');
  const controls = panel.querySelector('.package-tools');
  const status = panel.querySelector('[data-package-status]');
  const scan = panel.querySelector('[data-package-scan]');
  const barcode = panel.querySelector('[data-package-barcode]');
  const front = panel.querySelector('[data-package-front]');
  const next = panel.querySelector('[data-package-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  let viewer;
  let loading;
  let angle = 0;
  let frame = 0;
  let pointer;
  let scanAnimation;
  let scanRevision = 0;
  let disposed = false;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const cancelDrag = () => {
    stop();
    const id = pointer?.id;
    pointer = null;
    host.removeAttribute('data-dragging');
    if (id !== undefined && host.hasPointerCapture(id))
      host.releasePointerCapture(id);
  };
  const normalize = (value) => Math.atan2(Math.sin(value), Math.cos(value));
  const setAngle = (value) => {
    angle = value;
    viewer.rotate(value);
  };
  const resetScan = () => {
    scanRevision++;
    scanAnimation?.cancel();
    scanAnimation = null;
    host.removeAttribute('data-scanning');
    next.hidden = true;
    status.textContent = mouse.matches
      ? 'Наведите на упаковку: колесо мыши или зажатая ЛКМ вращают её.'
      : 'Ведите пальцем влево или вправо, чтобы повернуть упаковку.';
  };
  const turnTo = (target, instant = false) => {
    cancelDrag();
    const destination = angle + normalize(target - angle);
    if (instant || reduce.matches) {
      setAngle(destination);
      return;
    }
    let velocity = 0;
    let previous;
    const tick = (now) => {
      const dt = Math.min((now - (previous ?? now - 16)) / 1000, 0.032);
      previous = now;
      // Critically damped spring; a new pointer press can interrupt any frame.
      const delta = destination - angle;
      velocity += (delta * 220 - velocity * 30) * dt;
      setAngle(angle + velocity * dt);
      if (Math.abs(delta) > 0.001 || Math.abs(velocity) > 0.005)
        frame = requestAnimationFrame(tick);
      else {
        setAngle(destination);
        frame = 0;
      }
    };
    frame = requestAnimationFrame(tick);
  };
  const failed = (error) => {
    cancelDrag();
    resetScan();
    viewer?.dispose();
    viewer = null;
    host.removeAttribute('data-ready');
    controls.hidden = true;
    host.removeAttribute('tabindex');
    host.removeAttribute('role');
    host.removeAttribute('aria-label');
    status.textContent =
      '3D недоступно в этом браузере. Ниже можно посмотреть демонстрационные экраны приложения.';
    console.error('Bloom product viewer unavailable:', error);
  };
  const load = () => {
    if (loading) return loading;
    status.textContent = 'Готовим упаковку для вращения…';
    loading = import('/static/js/product-viewer.js')
      .then((module) => module.mount(host))
      .then((result) => {
        if (disposed) {
          result.dispose();
          return;
        }
        viewer = result;
        host.setAttribute('data-ready', '');
        host.setAttribute('tabindex', '0');
        host.setAttribute('role', 'group');
        host.setAttribute(
          'aria-label',
          'Трёхмерная упаковка йогурта. Стрелки влево и вправо вращают, Home показывает лицевую сторону, End штрихкод.',
        );
        controls.hidden = false;
        resetScan();
      })
      .catch(failed);
    return loading;
  };
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        void load();
      }
    },
    { rootMargin: '160px' },
  );
  observer.observe(host);
  host.addEventListener('bloom:viewererror', () =>
    failed(new Error('WebGL context lost')),
  );
  // Only the actual cup captures wheel input. Empty canvas space keeps page scroll.
  host.addEventListener(
    'wheel',
    (event) => {
      if (
        !viewer ||
        panel.hasAttribute('inert') ||
        event.ctrlKey ||
        event.metaKey ||
        event.cancelable === false
      )
        return;
      if (!viewer.hitTest(event.clientX, event.clientY)) return;
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
      const delta = Math.max(-180, Math.min(180, raw * unit));
      event.preventDefault();
      cancelDrag();
      resetScan();
      setAngle(angle + delta * 0.0045);
    },
    { passive: false },
  );
  host.addEventListener('pointerdown', (event) => {
    if (!viewer || !event.isPrimary || event.button !== 0 || pointer) return;
    if (!viewer.hitTest(event.clientX, event.clientY)) return;
    stop();
    resetScan();
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      startX: event.clientX,
      startY: event.clientY ?? 0,
      dragging: false,
      time: event.timeStamp,
      velocity: 0,
    };
    host.setPointerCapture(event.pointerId);
  });
  host.addEventListener('pointermove', (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (!pointer.dragging) {
      const horizontal = Math.abs(event.clientX - pointer.startX);
      const vertical = Math.abs((event.clientY ?? 0) - pointer.startY);
      if (horizontal < 6 || horizontal < vertical) return;
      pointer.dragging = true;
      host.setAttribute('data-dragging', '');
    }
    const dx = event.clientX - pointer.x;
    const elapsed = Math.max(event.timeStamp - pointer.time, 1);
    pointer.velocity = (dx / elapsed) * 12;
    pointer.x = event.clientX;
    pointer.time = event.timeStamp;
    setAngle(angle + dx * 0.012);
  });
  const release = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    let velocity =
      event.type === 'pointercancel' || event.timeStamp - pointer.time > 100
        ? 0
        : Math.max(-7, Math.min(7, pointer.velocity));
    pointer = null;
    host.removeAttribute('data-dragging');
    if (host.hasPointerCapture(event.pointerId))
      host.releasePointerCapture(event.pointerId);
    if (reduce.matches || !velocity) return;
    let previous;
    const glide = (now) => {
      const dt = Math.min((now - (previous ?? now - 16)) / 1000, 0.032);
      previous = now;
      velocity *= Math.exp(-7 * dt);
      setAngle(angle + velocity * dt);
      if (Math.abs(velocity) > 0.01) frame = requestAnimationFrame(glide);
      else frame = 0;
    };
    frame = requestAnimationFrame(glide);
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', (event) => {
    if (pointer?.id === event.pointerId) {
      pointer = null;
      host.removeAttribute('data-dragging');
      stop();
    }
  });
  host.addEventListener('keydown', (event) => {
    const directions = {
      ArrowLeft: angle - Math.PI / 12,
      ArrowRight: angle + Math.PI / 12,
      Home: 0,
      End: Math.PI,
    };
    if (!(event.key in directions) || !viewer) return;
    event.preventDefault();
    resetScan();
    turnTo(directions[event.key], true);
  });
  barcode.addEventListener('click', (event) => {
    resetScan();
    turnTo(Math.PI, event.detail === 0);
  });
  front.addEventListener('click', (event) => {
    resetScan();
    turnTo(0, event.detail === 0);
  });
  scan.addEventListener('click', async (event) => {
    resetScan();
    const revision = scanRevision;
    turnTo(Math.PI, true);
    status.textContent = 'Пример: приложение считывает штрихкод с упаковки.';
    host.setAttribute('data-scanning', '');
    if (!reduce.matches && event.detail !== 0) {
      scanAnimation = host.querySelector('.package-scan-line').animate(
        [
          { transform: 'translateY(-65px)', opacity: 0 },
          { transform: 'translateY(-55px)', opacity: 1, offset: 0.12 },
          { transform: 'translateY(65px)', opacity: 1, offset: 0.88 },
          { transform: 'translateY(75px)', opacity: 0 },
        ],
        { duration: 900, easing: 'linear' },
      );
      try {
        await scanAnimation.finished;
      } catch {
        return;
      }
    }
    if (revision !== scanRevision) return;
    host.removeAttribute('data-scanning');
    status.textContent =
      'В будущем приложении штрихкод откроет карточку продукта. Посмотрите пример состава.';
    next.hidden = false;
  });
  next.addEventListener('click', () => {
    const destination = document.querySelector('[data-journey-step="1"]');
    destination.focus({ preventScroll: true });
    destination.click();
  });
  reduce.addEventListener('change', () => {
    stop();
    if (viewer) resetScan();
  });
  // Leaving the scene cancels a scan; returning never reveals an old completion.
  const stateObserver = new MutationObserver(() => {
    if (panel.hasAttribute('inert')) {
      cancelDrag();
      if (viewer) resetScan();
    }
  });
  stateObserver.observe(panel, {
    attributes: true,
    attributeFilter: ['inert'],
  });
  window.addEventListener('pagehide', (event) => {
    cancelDrag();
    if (viewer) resetScan();
    if (!event.persisted) {
      disposed = true;
      scanRevision++;
      scanAnimation?.cancel();
      observer.disconnect();
      stateObserver.disconnect();
      viewer?.dispose();
    }
  });
})();
