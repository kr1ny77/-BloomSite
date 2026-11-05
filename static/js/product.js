(() => {
  'use strict';
  const host = document.querySelector('[data-package-viewer]');
  if (!host) return;
  const panel = document.querySelector('#journey-package');
  const menu = document.querySelector('#site-menu');
  const errorMessage = panel.querySelector('[data-viewer-error]');
  const hotspot = host.querySelector('[data-barcode-hotspot]');
  const journey = document.querySelector('[data-journey]');
  const openComposition = () => {
    if (!active()) return;
    journey.dispatchEvent(
      new CustomEvent('bloom:journeyopen', { detail: { index: 1 } }),
    );
  };
  const positionBarcode = ({ visible, x, y }) => {
    hotspot.hidden = !visible;
    if (visible) {
      hotspot.style.left = `${x}px`;
      hotspot.style.top = `${y}px`;
    }
  };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let viewer,
    loading,
    pointer,
    frame = 0,
    previous;
  let yaw = 0,
    pitch = 0,
    velocityX = 0,
    velocityY = 0,
    wheelYaw = 0,
    wheelPitch = 0;
  let visible = false,
    hovered = false,
    focused = false,
    paused = false;
  let homeTimer = 0,
    returning = false,
    returnElapsed = 0,
    homePending = false;
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
    !reduce.matches &&
    !paused &&
    !hovered &&
    !focused &&
    !pointer &&
    !homePending;
  const paint = () => viewer?.rotate(yaw, pitch);
  const cancelHome = () => {
    clearTimeout(homeTimer);
    homeTimer = 0;
    returning = homePending = false;
    host.removeAttribute('data-returning');
    returnElapsed = 0;
  };
  const scheduleHome = () => {
    clearTimeout(homeTimer);
    homePending = true;
    homeTimer = setTimeout(() => {
      homeTimer = 0;
      if (!active()) {
        cancelHome();
        return;
      }
      stop();
      if (reduce.matches) {
        yaw = pitch = 0;
        viewer.reset();
        homePending = false;
        return;
      }
      returning = true;
      host.setAttribute('data-returning', '');
      returnElapsed = 0;
      viewer.beginReturn();
      resume();
    }, 1100);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = undefined;
    velocityX = velocityY = wheelYaw = wheelPitch = 0;
  };
  const tick = (now) => {
    frame = 0;
    if (!active() || reduce.matches) return;
    const dt = Math.min((now - (previous ?? now - 16)) / 1000, 0.032);
    previous = now;
    if (returning) {
      returnElapsed += dt;
      const t = Math.min(1, returnElapsed / 0.8);
      viewer.returnHome(t * t * (3 - 2 * t));
      if (t === 1) {
        yaw = pitch = 0;
        returning = homePending = false;
        host.removeAttribute('data-returning');
      }
    } else {
      velocityX *= Math.exp(-9 * dt);
      velocityY *= Math.exp(-9 * dt);
      const ease = 1 - Math.exp(-14 * dt);
      const wheelStepY = wheelYaw * ease;
      const wheelStepP = wheelPitch * ease;
      wheelYaw -= wheelStepY;
      wheelPitch -= wheelStepP;
      yaw += (velocityX + (auto() ? 0.075 : 0)) * dt + wheelStepY;
      pitch += velocityY * dt + wheelStepP;
      paint();
    }
    if (
      returning ||
      auto() ||
      Math.abs(velocityX) + Math.abs(velocityY) > 0.01 ||
      Math.abs(wheelYaw) + Math.abs(wheelPitch) > 0.0001
    )
      frame = requestAnimationFrame(tick);
    else previous = undefined;
  };
  const resume = () => {
    if (
      !frame &&
      active() &&
      !reduce.matches &&
      (returning ||
        auto() ||
        Math.abs(velocityX) + Math.abs(velocityY) > 0.01 ||
        Math.abs(wheelYaw) + Math.abs(wheelPitch) > 0.0001)
    )
      frame = requestAnimationFrame(tick);
  };
  const cancelDrag = () => {
    cancelHome();
    const id = pointer?.id;
    pointer = null;
    host.removeAttribute('data-dragging');
    if (id !== undefined && host.hasPointerCapture(id))
      host.releasePointerCapture(id);
    stop();
  };
  const park = () => {
    const needsHome = homePending || pointer?.dragging;
    cancelDrag();
    if (needsHome && viewer) {
      yaw = pitch = 0;
      viewer.reset();
    }
  };
  const failed = (error) => {
    cancelDrag();
    viewer?.dispose();
    viewer = undefined;
    host.removeAttribute('data-ready');
    host.removeAttribute('tabindex');
    host.removeAttribute('role');
    host.removeAttribute('aria-label');
    hotspot.hidden = true;
    errorMessage.hidden = false;
    console.error('Bloom 3D unavailable:', error);
  };
  const load = async () => {
    if (loading || disposed) return;
    loading = true;
    try {
      const engine = await import('/static/js/product-viewer.js?v=barcode1');
      const candidate = await engine.mount(host, {
        onBarcode: positionBarcode,
      });
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
      else park();
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
      resume();
    }
  });
  host.addEventListener('pointerleave', () => {
    hovered = false;
    resume();
  });
  host.addEventListener('focus', () => {
    focused = true;
    cancelHome();
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
      const delta = Math.max(-120, Math.min(120, raw * unit)) * -0.0018;
      event.preventDefault();
      const pendingYaw = wheelYaw,
        pendingPitch = wheelPitch;
      cancelDrag();
      if (reduce.matches) {
        if (event.shiftKey) pitch += delta;
        else yaw += delta;
        paint();
      } else {
        wheelYaw = pendingYaw + (event.shiftKey ? 0 : delta);
        wheelPitch = pendingPitch + (event.shiftKey ? delta : 0);
        resume();
      }
      scheduleHome();
    },
    { passive: false },
  );
  host.addEventListener('pointerdown', (event) => {
    if (
      !viewer ||
      panel.hasAttribute('inert') ||
      event.target === hotspot ||
      hotspot.contains(event.target) ||
      !event.isPrimary ||
      event.button !== 0 ||
      pointer ||
      !viewer.hitTest(event.clientX, event.clientY)
    )
      return;
    cancelHome();
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
    pointer.vx = (dx / dt) * 4.5;
    pointer.vy = pointer.touch ? 0 : (dy / dt) * 4.5;
    yaw += dx * 0.0045;
    if (!pointer.touch) pitch += dy * 0.0045;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.time = event.timeStamp;
    paint();
  });
  const release = (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const old = pointer;
    const barcodeTap =
      event.type === 'pointerup' &&
      !old.dragging &&
      Math.hypot(event.clientX - old.startX, event.clientY - old.startY) < 6 &&
      viewer?.hitBarcode(event.clientX, event.clientY);
    cancelDrag();
    if (barcodeTap) {
      openComposition();
      return;
    }
    if (
      event.type === 'pointerup' &&
      event.timeStamp - old.time <= 100 &&
      !reduce.matches
    ) {
      velocityX = Math.max(-1.4, Math.min(1.4, old.vx));
      velocityY = Math.max(-1.4, Math.min(1.4, old.vy));
    }
    if (old.dragging) {
      if (active()) scheduleHome();
      else {
        yaw = pitch = 0;
        viewer?.reset();
      }
    }
    resume();
  };
  host.addEventListener('pointerup', release);
  host.addEventListener('pointercancel', release);
  host.addEventListener('lostpointercapture', release);
  host.addEventListener('keydown', (event) => {
    if (!viewer || panel.hasAttribute('inert') || event.target === hotspot)
      return;
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
    if (event.key === 'Home') {
      yaw = pitch = 0;
      viewer.reset(yaw, pitch);
    }
    if (event.key === 'End') {
      yaw = Math.PI;
      pitch = 0;
      viewer.reset(yaw, pitch);
    }
    paint();
  });
  hotspot.addEventListener('pointerdown', () => {
    cancelHome();
    stop();
  });
  hotspot.addEventListener('pointerenter', () => {
    cancelHome();
    stop();
  });
  hotspot.addEventListener('focus', () => {
    focused = true;
    cancelHome();
    stop();
  });
  hotspot.addEventListener('blur', () => {
    focused = false;
    resume();
  });
  hotspot.addEventListener('click', openComposition);
  reduce.addEventListener('change', () => {
    park();
    resume();
  });
  document.addEventListener('visibilitychange', () => {
    park();
    resume();
  });
  const stateObserver = new MutationObserver(() => {
    if (panel.hasAttribute('inert')) park();
    else resume();
  });
  stateObserver.observe(panel, {
    attributes: true,
    attributeFilter: ['inert'],
  });
  const menuObserver = new MutationObserver(() => {
    if (menu?.open) park();
    else resume();
  });
  if (menu)
    menuObserver.observe(menu, { attributes: true, attributeFilter: ['open'] });
  window.addEventListener('pagehide', (event) => {
    suspended = true;
    park();
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
