import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const source = readFileSync(
  new URL('../static/js/product.js', import.meta.url),
  'utf8',
).replace("import('/static/js/product-viewer.js?v=barcode1')", 'loadViewer()');
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function page({ reduced = false, fail = false, pending = false } = {}) {
  const node = () => ({
    listeners: {},
    attrs: {},
    hidden: true,
    clientHeight: 400,
    addEventListener(name, fn) {
      this.listeners[name] = fn;
    },
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
    removeAttribute(name) {
      delete this.attrs[name];
    },
    hasAttribute(name) {
      return Object.hasOwn(this.attrs, name);
    },
  });
  const host = node(),
    panel = node(),
    error = node(),
    document = node(),
    window = node(),
    hotspot = node(),
    journey = node();
  const requests = [];
  hotspot.style = {};
  hotspot.contains = (target) => target === hotspot;
  host.querySelector = () => hotspot;
  journey.dispatchEvent = (event) => requests.push(event);
  document.hidden = false;
  const captures = new Set(),
    frames = new Map(),
    observers = [],
    rotations = [],
    errors = [];
  const timers = new Map();
  const returns = [];
  let timerId = 0,
    resetCount = 0;
  const mutations = [];
  const menu = node();
  let frameId = 0,
    disposals = 0,
    resolveMount;
  host.setPointerCapture = (id) => captures.add(id);
  host.hasPointerCapture = (id) => captures.has(id);
  host.releasePointerCapture = (id) => captures.delete(id);
  panel.querySelector = () => error;
  document.querySelector = (key) =>
    key === '[data-package-viewer]'
      ? host
      : key === '[data-journey]'
        ? journey
        : key === '#site-menu'
          ? menu
          : panel;
  const media = {
    matches: reduced,
    addEventListener(_, fn) {
      this.change = fn;
    },
  };
  window.matchMedia = () => media;
  let onBarcode;
  const renderer = {
    hitBarcode: () => false,
    reset: () => {
      resetCount++;
    },
    beginReturn: () => returns.push(0),
    returnHome: (t) => returns.push(t),
    rotate: (yaw, pitch) => rotations.push([yaw, pitch]),
    hitTest: () => true,
    dispose: () => disposals++,
  };
  runInNewContext(source, {
    document,
    window,
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    setTimeout: (fn) => {
      timers.set(++timerId, fn);
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id),
    console: { error: (...args) => errors.push(args) },
    requestAnimationFrame: (fn) => {
      frames.set(++frameId, fn);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class {
      constructor(fn, options) {
        observers.push({ fn, options });
      }
      observe() {}
      disconnect() {}
    },
    MutationObserver: class {
      constructor(fn) {
        mutations.push(fn);
      }
      observe() {}
      disconnect() {}
    },
    loadViewer: async () => ({
      mount: async (_host, options) => {
        onBarcode = options.onBarcode;
        if (fail) throw new Error('WebGL unavailable');
        if (pending)
          return new Promise((resolve) => {
            resolveMount = resolve;
          });
        return renderer;
      },
    }),
  });
  const fire = (target, name, event = {}) =>
    target.listeners[name]?.({ ...event, type: name });
  return {
    host,
    hotspot,
    requests,
    barcode: (state) => onBarcode(state),
    timers,
    returns,
    resets: () => resetCount,
    idle() {
      const tasks = [...timers.values()];
      timers.clear();
      tasks.forEach((fn) => fn());
    },
    panel,
    error,
    document,
    window,
    media,
    rotations,
    frames,
    captures,
    errors,
    renderer,
    fire,
    mutate: () => mutations[0](),
    menu,
    menuChanged: () => mutations[1](),
    disposals: () => disposals,
    load: () => observers[0].fn([{ isIntersecting: true }]),
    visible: (isIntersecting = true) => observers[1].fn([{ isIntersecting }]),
    resolveMount: () => resolveMount(renderer),
    step(now = 16) {
      const jobs = [...frames];
      frames.clear();
      jobs.forEach(([, fn]) => fn(now));
    },
  };
}
const pointer = (x = 50, y = 50, timeStamp = 0) => ({
  clientX: x,
  clientY: y,
  timeStamp,
  pointerId: 1,
  pointerType: 'mouse',
  isPrimary: true,
  button: 0,
});
const wheel = (extra = {}) => ({
  deltaY: 100,
  deltaX: 0,
  deltaMode: 0,
  clientX: 50,
  clientY: 50,
  preventDefault() {
    this.prevented = true;
  },
  ...extra,
});
test('lazy model starts gentle auto rotation only when visible and pauses on hover or focus', async () => {
  const p = page();
  assert.equal(p.rotations.length, 0);
  p.load();
  await flush();
  assert.equal(p.frames.size, 0);
  p.visible();
  p.step();
  assert.ok(p.rotations.at(-1)[0] > 0);
  assert.equal(p.frames.size, 1);
  p.fire(p.host, 'pointerenter', { pointerType: 'mouse' });
  assert.equal(p.frames.size, 0);
  p.fire(p.host, 'pointerleave');
  assert.equal(p.frames.size, 1);
  p.fire(p.host, 'focus');
  assert.equal(p.frames.size, 0);
  p.fire(p.host, 'keydown', { key: ' ', preventDefault() {} });
  assert.equal(p.frames.size, 1);
  p.fire(p.host, 'keydown', { key: ' ', preventDefault() {} });
  assert.equal(p.frames.size, 0);
});
test('keyboard permits complete rotations on both axes and instant front/barcode resets', async () => {
  const p = page({ reduced: true });
  p.load();
  await flush();
  p.visible();
  for (let i = 0; i < 32; i++) {
    p.fire(p.host, 'keydown', { key: 'ArrowRight', preventDefault() {} });
    p.fire(p.host, 'keydown', { key: 'ArrowDown', preventDefault() {} });
  }
  assert.ok(p.rotations.at(-1).every((a) => a > 2 * Math.PI));
  assert.equal(p.frames.size, 0);
  p.fire(p.host, 'keydown', { key: 'End', preventDefault() {} });
  assert.deepEqual(p.rotations.at(-1), [Math.PI, 0]);
  p.fire(p.host, 'keydown', { key: 'Home', preventDefault() {} });
  assert.deepEqual(p.rotations.at(-1), [0, 0]);
});
test('desktop drag turns freely on two axes, ignores secondary pointers and releases capture', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerdown', pointer());
  p.fire(p.host, 'pointerdown', {
    ...pointer(),
    pointerId: 2,
    isPrimary: false,
  });
  assert.deepEqual([...p.captures], [1]);
  p.fire(p.host, 'pointermove', pointer(1650, 1650, 16));
  assert.ok(p.rotations.at(-1).every((a) => a > 2 * Math.PI));
  p.fire(p.host, 'pointerup', pointer(1650, 1650, 30));
  assert.equal(p.captures.size, 0);
  p.step(32);
  assert.equal(p.frames.size, 1);
  p.visible(false);
  assert.equal(p.frames.size, 0);
});
test('touch vertical intent leaves native scrolling intact; horizontal drag rotates', async () => {
  const p = page({ reduced: true });
  p.load();
  await flush();
  p.fire(p.host, 'pointerdown', { ...pointer(), pointerType: 'touch' });
  const before = p.rotations.length;
  p.fire(p.host, 'pointermove', pointer(52, 100, 16));
  assert.equal(p.rotations.length, before);
  p.fire(p.host, 'pointercancel', pointer(52, 100, 20));
  assert.equal(p.captures.size, 0);
  p.fire(p.host, 'pointerdown', { ...pointer(), pointerType: 'touch' });
  p.fire(p.host, 'pointermove', pointer(150, 55, 40));
  assert.ok(p.rotations.at(-1)[0] > 0);
  assert.equal(p.rotations.at(-1)[1], 0);
});
test('wheel captures geometry only, rotates both ways and supports shifted pitch', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerenter', { pointerType: 'mouse' });
  let captured = 0;
  for (const deltaY of [100, -200])
    p.fire(
      p.host,
      'wheel',
      wheel({
        deltaY,
        preventDefault() {
          captured++;
        },
      }),
    );
  for (let i = 0; i < 40; i++) p.step(i * 16 + 16);
  assert.equal(captured, 2);
  assert.ok(p.rotations.at(-1)[0] > 0);
  p.fire(p.host, 'wheel', wheel({ shiftKey: true }));
  p.step(672);
  assert.ok(p.rotations.at(-1)[1] < 0);
  const before = p.rotations.length;
  for (const event of [
    { ctrlKey: true },
    { metaKey: true },
    { cancelable: false },
    { deltaY: 0 },
  ])
    p.fire(
      p.host,
      'wheel',
      wheel({
        ...event,
        preventDefault() {
          assert.fail('must remain native');
        },
      }),
    );
  p.renderer.hitTest = () => false;
  p.fire(
    p.host,
    'wheel',
    wheel({
      preventDefault() {
        assert.fail('empty canvas must scroll');
      },
    }),
  );
  assert.equal(p.rotations.length, before);
});
test('scene, page visibility and reduced motion cancel drag/momentum and resume safely', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerdown', pointer());
  p.panel.attrs.inert = '';
  p.mutate();
  assert.equal(p.captures.size, 0);
  assert.equal(p.frames.size, 0);
  delete p.panel.attrs.inert;
  p.mutate();
  assert.equal(p.frames.size, 1);
  p.document.hidden = true;
  p.fire(p.document, 'visibilitychange');
  assert.equal(p.frames.size, 0);
  p.document.hidden = false;
  p.fire(p.document, 'visibilitychange');
  assert.equal(p.frames.size, 1);
  p.media.matches = true;
  p.media.change();
  assert.equal(p.frames.size, 0);
  p.media.matches = false;
  p.media.change();
  assert.equal(p.frames.size, 1);
  p.fire(p.window, 'pagehide', { persisted: true });
  assert.equal(p.frames.size, 0);
  assert.equal(p.disposals(), 0);
  p.fire(p.window, 'pageshow');
  assert.equal(p.frames.size, 1);
});
test('context loss releases drag and preserves static poster with a clear error', async () => {
  const p = page();
  p.load();
  await flush();
  p.fire(p.host, 'pointerdown', pointer());
  p.fire(p.host, 'bloom:viewererror');
  assert.equal(p.captures.size, 0);
  assert.equal(p.disposals(), 1);
  assert.equal(p.host.hasAttribute('data-ready'), false);
  assert.equal(p.error.hidden, false);
  const before = p.rotations.length;
  p.fire(p.host, 'pointermove', pointer(150, 100));
  assert.equal(p.rotations.length, before);
  assert.equal(p.errors.length, 1);
});
test('failed engine and mount finishing after page exit cannot enable a broken viewer', async () => {
  const p = page({ fail: true });
  p.load();
  await flush();
  assert.equal(p.error.hidden, false);
  assert.equal(p.host.hasAttribute('tabindex'), false);
  const q = page({ pending: true });
  q.load();
  await flush();
  q.fire(q.window, 'pagehide', { persisted: false });
  q.resolveMount();
  await flush();
  assert.equal(q.disposals(), 1);
  assert.equal(q.host.hasAttribute('data-ready'), false);
});

test('opening the native modal suspends background motion, and closing resumes it', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  assert.equal(p.frames.size, 1);
  p.menu.open = true;
  p.menuChanged();
  assert.equal(p.frames.size, 0);
  p.fire(p.host, 'pointerleave');
  assert.equal(p.frames.size, 0);
  p.menu.open = false;
  p.menuChanged();
  assert.equal(p.frames.size, 1);
});

test('wheel eases toward a smaller turn without an immediate jump and cancels offscreen', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerenter', { pointerType: 'mouse' });
  const before = p.rotations.at(-1)[0];
  p.fire(p.host, 'wheel', wheel());
  assert.equal(p.rotations.at(-1)[0], before);
  p.step(16);
  const first = p.rotations.at(-1)[0];
  assert.ok(first < before && first > -0.06);
  for (let i = 2; i < 45; i++) p.step(i * 16);
  assert.ok(Math.abs(p.rotations.at(-1)[0] + 0.18) < 0.001);
  p.fire(p.host, 'wheel', wheel());
  p.visible(false);
  assert.equal(p.frames.size, 0);
  p.visible();
  p.step(800);
  assert.ok(Math.abs(p.rotations.at(-1)[0] + 0.18) < 0.001);
});

test('manual wheel returns smoothly after idle, repeated input restarts delay and can interrupt return', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerenter', { pointerType: 'mouse' });
  p.fire(p.host, 'wheel', wheel());
  p.step(16);
  assert.equal(p.timers.size, 1);
  p.fire(p.host, 'wheel', wheel());
  assert.equal(p.timers.size, 1);
  p.idle();
  assert.deepEqual(p.returns, [0]);
  for (let i = 0; i < 8; i++) p.step(32 + i * 16);
  assert.ok(p.returns.at(-1) > 0 && p.returns.at(-1) < 1);
  p.fire(p.host, 'pointerdown', pointer());
  const before = p.returns.length;
  p.step(300);
  assert.equal(p.returns.length, before);
  assert.equal(p.timers.size, 0);
  p.fire(p.host, 'pointermove', pointer(150, 70, 320));
  p.fire(p.host, 'pointerup', pointer(150, 70, 330));
  p.idle();
  for (let i = 0; i < 60; i++) p.step(350 + i * 16);
  assert.equal(p.returns.at(-1), 1);
  assert.equal(p.frames.size, 0);
});
test('pending return is cancelled at lifecycle boundaries; reduced motion resets without animated return', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'wheel', wheel());
  p.menu.open = true;
  p.menuChanged();
  assert.equal(p.resets(), 1);
  assert.equal(p.timers.size, 0);
  p.idle();
  assert.equal(p.returns.length, 0);
  const q = page({ reduced: true });
  q.load();
  await flush();
  q.visible();
  q.fire(q.host, 'wheel', wheel());
  q.idle();
  assert.equal(q.resets(), 1);
  assert.equal(q.returns.length, 0);
  assert.equal(q.frames.size, 0);
});

test('hiding during a live drag parks home; cancellation after rotation schedules a return without inertia', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.fire(p.host, 'pointerdown', pointer());
  p.fire(p.host, 'pointermove', pointer(180, 95, 20));
  p.panel.attrs.inert = '';
  p.mutate();
  assert.equal(p.resets(), 1);
  assert.equal(p.captures.size, 0);
  assert.equal(p.timers.size, 0);
  const q = page();
  q.load();
  await flush();
  q.visible();
  q.fire(q.host, 'pointerenter', { pointerType: 'mouse' });
  q.fire(q.host, 'pointerdown', pointer());
  q.fire(q.host, 'pointermove', pointer(180, 95, 20));
  q.fire(q.host, 'pointercancel', pointer(180, 95, 30));
  assert.equal(q.timers.size, 1);
  assert.equal(q.frames.size, 0);
  q.idle();
  for (let i = 0; i < 60; i++) q.step(i * 16);
  assert.equal(q.returns.at(-1), 1);
});

test('barcode projection exposes only a visible anchored target and the eye opens composition', async () => {
  const p = page();
  p.load();
  await flush();
  p.visible();
  p.barcode({ visible: true, x: 125, y: 200 });
  assert.equal(p.hotspot.hidden, false);
  assert.equal(p.hotspot.style.left, '125px');
  p.fire(p.hotspot, 'pointerdown');
  assert.equal(p.frames.size, 0);
  p.fire(p.hotspot, 'click');
  assert.equal(p.requests.at(-1).type, 'bloom:journeyopen');
  assert.equal(p.requests.at(-1).detail.index, 1);
  p.barcode({ visible: false });
  assert.equal(p.hotspot.hidden, true);
  p.panel.setAttribute('inert', '');
  p.fire(p.hotspot, 'click');
  assert.equal(
    p.requests.length,
    1,
    'inactive scenes cannot activate a stale target',
  );
});
test('a tap on the printed barcode opens composition but a drag across it never does', async () => {
  for (const pointerType of ['mouse', 'touch']) {
    const p = page();
    p.load();
    await flush();
    p.visible();
    p.renderer.hitBarcode = () => true;
    const down = {
      isPrimary: true,
      button: 0,
      pointerId: 1,
      pointerType,
      clientX: 100,
      clientY: 100,
      timeStamp: 0,
    };
    p.fire(p.host, 'pointerdown', down);
    p.fire(p.host, 'pointerup', { ...down, timeStamp: 50 });
    assert.equal(p.requests.length, 1);
    p.fire(p.host, 'pointerdown', down);
    p.fire(p.host, 'pointermove', { ...down, clientX: 120, timeStamp: 30 });
    p.fire(p.host, 'pointerup', { ...down, clientX: 120, timeStamp: 60 });
    assert.equal(p.requests.length, 1);
    p.fire(p.host, 'pointerdown', down);
    p.fire(p.host, 'pointercancel', { ...down, timeStamp: 90 });
    assert.equal(p.requests.length, 1);
  }
});
