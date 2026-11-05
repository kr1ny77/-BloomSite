import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const source = readFileSync(
  new URL('../static/js/product.js', import.meta.url),
  'utf8',
).replace("import('/static/js/product-viewer.js')", 'loadViewer()');
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function page({ reduced = false, fail = false, pending = false } = {}) {
  const node = () => ({
    listeners: {},
    attrs: {},
    hidden: true,
    value: '0',
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
    focus() {
      document.activeElement = this;
    },
  });
  const host = node();
  const panel = node();
  const controls = node();
  const status = node();
  const range = node();
  const scan = node();
  const barcode = node();
  const front = node();
  const next = node();
  const step = node();
  let stepClicks = 0;
  step.click = () => {
    stepClicks++;
    panel.attrs.inert = '';
  };
  const nodes = {
    '.package-tools': controls,
    '[data-package-status]': status,
    '[data-package-angle]': range,
    '[data-package-scan]': scan,
    '[data-package-barcode]': barcode,
    '[data-package-front]': front,
    '[data-package-next]': next,
  };
  panel.querySelector = (key) => nodes[key];
  const captures = new Set();
  host.setPointerCapture = (id) => captures.add(id);
  host.hasPointerCapture = (id) => captures.has(id);
  host.releasePointerCapture = (id) => captures.delete(id);
  let completeScan;
  let cancelScan;
  host.querySelector = () => ({
    animate: () => ({
      finished: new Promise((resolve, reject) => {
        completeScan = resolve;
        cancelScan = reject;
      }),
      cancel() {
        cancelScan(new Error('cancelled'));
      },
    }),
  });
  let intersection;
  let mutation;
  const frames = new Map();
  let frameId = 0;
  const rotations = [];
  let disposals = 0;
  const errors = [];
  const renderer = {
    rotate: (a) => rotations.push(a),
    dispose: () => disposals++,
  };
  let resolveMount;
  const document = {
    activeElement: null,
    querySelector: (key) =>
      key === '[data-package-viewer]'
        ? host
        : key === '#journey-package'
          ? panel
          : step,
  };
  const window = {
    listeners: {},
    matchMedia: () => ({ matches: reduced, addEventListener() {} }),
    addEventListener(name, fn) {
      this.listeners[name] = fn;
    },
  };
  runInNewContext(source, {
    document,
    window,
    console: { error: (...args) => errors.push(args) },
    requestAnimationFrame: (fn) => {
      frames.set(++frameId, fn);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class {
      constructor(fn) {
        intersection = fn;
      }
      observe() {}
      disconnect() {}
    },
    MutationObserver: class {
      constructor(fn) {
        mutation = fn;
      }
      observe() {}
      disconnect() {}
    },
    loadViewer: async () => ({
      mount: async () => {
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
    target.listeners[name]({ detail: 1, ...event });
  return {
    host,
    panel,
    controls,
    status,
    range,
    scan,
    barcode,
    front,
    next,
    step,
    document,
    captures,
    rotations,
    frames,
    errors,
    renderer,
    load: () => intersection([{ isIntersecting: true }]),
    fire,
    complete: () => completeScan(),
    mutate: () => mutation(),
    leave: (persisted = false) => window.listeners.pagehide({ persisted }),
    resolveMount: () => resolveMount(renderer),
    get disposals() {
      return disposals;
    },
    get stepClicks() {
      return stepClicks;
    },
  };
}
test('3D is lazy, keyboard rotation immediate, and next focuses the destination before hiding its source', async () => {
  const p = page();
  assert.equal(p.controls.hidden, true);
  p.load();
  await flush();
  assert.equal(p.controls.hidden, false);
  p.fire(p.host, 'keydown', { key: 'End', preventDefault() {} });
  assert.equal(p.rotations.at(-1), Math.PI);
  assert.equal(p.frames.size, 0);
  await p.fire(p.scan, 'click', { detail: 0 });
  assert.equal(p.next.hidden, false);
  p.fire(p.next, 'click');
  assert.equal(p.stepClicks, 1);
  assert.equal(p.document.activeElement, p.step);
});
test('pointer tracking ignores a second finger and cancellation leaves native scrolling usable', async () => {
  const p = page();
  p.load();
  await flush();
  p.fire(p.host, 'pointerdown', {
    isPrimary: true,
    button: 0,
    pointerId: 1,
    clientX: 100,
    timeStamp: 0,
  });
  p.fire(p.host, 'pointerdown', {
    isPrimary: false,
    button: 0,
    pointerId: 2,
    clientX: 300,
    timeStamp: 1,
  });
  p.fire(p.host, 'pointermove', { pointerId: 2, clientX: 500, timeStamp: 10 });
  assert.equal(p.rotations.length, 0);
  p.fire(p.host, 'pointermove', { pointerId: 1, clientX: 150, timeStamp: 20 });
  assert.equal(p.rotations.at(-1), 0.6);
  p.fire(p.host, 'pointercancel', {
    type: 'pointercancel',
    pointerId: 1,
    timeStamp: 30,
  });
  assert.equal(p.captures.size, 0);
  assert.equal(p.frames.size, 0);
});
test('WebGL context loss during drag releases capture and subsequent pointer events cannot call a disposed viewer', async () => {
  const p = page();
  p.load();
  await flush();
  p.fire(p.host, 'pointerdown', {
    isPrimary: true,
    button: 0,
    pointerId: 1,
    clientX: 100,
    timeStamp: 0,
  });
  p.fire(p.host, 'bloom:viewererror');
  assert.equal(p.captures.size, 0);
  assert.equal(p.controls.hidden, true);
  assert.equal(p.disposals, 1);
  assert.doesNotThrow(() =>
    p.fire(p.host, 'pointermove', {
      pointerId: 1,
      clientX: 130,
      timeStamp: 20,
    }),
  );
  assert.equal(p.errors.length, 1);
});
test('a cancelled scan cannot later reveal stale success and a new scan can complete', async () => {
  const p = page();
  p.load();
  await flush();
  const first = p.fire(p.scan, 'click');
  p.fire(p.front, 'click', { detail: 0 });
  await first;
  assert.equal(p.next.hidden, true);
  const second = p.fire(p.scan, 'click');
  p.complete();
  await second;
  assert.equal(p.next.hidden, false);
  p.panel.attrs.inert = '';
  p.mutate();
  assert.equal(p.next.hidden, true);
  assert.equal(p.frames.size, 0);
});
test('reduced motion preserves scanning feedback without animation or spring frames', async () => {
  const p = page({ reduced: true });
  p.load();
  await flush();
  p.fire(p.barcode, 'click');
  assert.equal(p.frames.size, 0);
  assert.equal(p.rotations.at(-1), Math.PI);
  await p.fire(p.scan, 'click');
  assert.equal(p.next.hidden, false);
});
test('engine failure retains the poster, hides unusable controls and reports its cause', async () => {
  const p = page({ fail: true });
  p.load();
  await flush();
  assert.equal(p.host.hasAttribute('data-ready'), false);
  assert.equal(p.controls.hidden, true);
  assert.match(p.status.textContent, /3D недоступно/);
  assert.equal(p.errors.length, 1);
});
test('a mount completing after page exit is immediately disposed without enabling controls', async () => {
  const p = page({ pending: true });
  p.load();
  await flush();
  p.leave();
  p.resolveMount();
  await flush();
  assert.equal(p.disposals, 1);
  assert.equal(p.controls.hidden, true);
  assert.equal(p.host.hasAttribute('data-ready'), false);
});

test('vertical touch intent does not rotate before the browser takes over scrolling', async () => {
  const p = page();
  p.load();
  await flush();
  p.fire(p.host, 'pointerdown', {
    isPrimary: true,
    button: 0,
    pointerId: 1,
    clientX: 100,
    clientY: 100,
    timeStamp: 0,
  });
  p.fire(p.host, 'pointermove', {
    pointerId: 1,
    clientX: 103,
    clientY: 130,
    timeStamp: 20,
  });
  assert.equal(p.rotations.length, 0);
});
test('bfcache suspends a scan while retaining the viewer for return', async () => {
  const p = page();
  p.load();
  await flush();
  const running = p.fire(p.scan, 'click');
  p.leave(true);
  await running;
  assert.equal(p.next.hidden, true);
  assert.equal(p.disposals, 0);
  assert.equal(p.frames.size, 0);
});
