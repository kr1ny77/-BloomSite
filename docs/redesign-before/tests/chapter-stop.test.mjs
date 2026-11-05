import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
const source = readFileSync(
  new URL('../static/js/chapter-stop.js', import.meta.url),
  'utf8',
);
function setup(reduce = false) {
  const listeners = {};
  let timer;
  const calls = [];
  let pending;
  const window = {
    scrollY: 0,
    innerHeight: 720,
    matchMedia: () => ({ matches: reduce }),
    addEventListener: (name, callback) => {
      listeners[name] = callback;
    },
    scrollTo: (options) => {
      calls.push(options);
      pending = options.behavior === 'smooth' ? options.top : undefined;
    },
  };
  runInNewContext(source, {
    window,
    document: {
      querySelector: () => ({
        getBoundingClientRect: () => ({ top: 720 - window.scrollY }),
      }),
    },
    setTimeout: (callback) => {
      timer = callback;
      return 1;
    },
    clearTimeout: () => {},
  });
  return {
    window,
    calls,
    listeners,
    idle: () => timer?.(),
    finish: () => {
      if (pending !== undefined) window.scrollY = pending;
      pending = undefined;
    },
    wheel(deltaY, extra = {}) {
      const event = {
        deltaY,
        deltaX: 0,
        deltaMode: 0,
        cancelable: true,
        preventDefault() {
          this.prevented = true;
        },
        ...extra,
      };
      listeners.wheel(event);
      if (!event.prevented) window.scrollY += deltaY;
      return event;
    },
  };
}
test('ordinary scrolling stays native before the second slide', () => {
  const s = setup();
  s.wheel(100);
  assert.equal(s.window.scrollY, 100);
  assert.equal(s.calls.length, 0);
});
test('crossing the second slide schedules one smooth landing, without instant jumps', () => {
  const s = setup();
  s.wheel(1800);
  assert.equal(s.calls[0].top, 720);
  assert.equal(s.calls[0].behavior, 'smooth');
  assert.equal(s.window.scrollY, 0);
  s.wheel(300);
  assert.equal(s.calls.length, 1);
  s.finish();
  s.idle();
  s.wheel(100);
  assert.equal(s.window.scrollY, 820);
});
test('a new gesture during the landing is native and does not restart it', () => {
  const s = setup();
  s.wheel(1800);
  s.window.scrollY = 400;
  s.idle();
  assert.equal(s.wheel(80).prevented, undefined);
  assert.equal(s.calls.length, 1);
});
test('all input from the third slide through the footer remains native, even without idle gaps', () => {
  const s = setup();
  s.window.scrollY = 1440;
  for (let i = 0; i < 30; i++) assert.equal(s.wheel(80).prevented, undefined);
  assert.equal(s.window.scrollY, 3840);
  assert.equal(s.calls.length, 0);
});
test('reverse input cancels a pending landing and immediately scrolls upward', () => {
  const s = setup();
  s.wheel(1800);
  s.window.scrollY = 400;
  assert.equal(s.wheel(-80).prevented, undefined);
  assert.equal(s.window.scrollY, 320);
  assert.equal(s.calls.at(-1).behavior, 'instant');
  assert.equal(s.calls.at(-1).top, 400);
});
test('returning above the second slide rearms only its entrance', () => {
  const s = setup();
  s.wheel(1800);
  s.finish();
  s.idle();
  s.wheel(-300);
  s.wheel(500);
  assert.equal(s.calls.at(-1).top, 720);
});
test('reduced motion, zoom and horizontal gestures are never captured', () => {
  assert.equal(setup(true).wheel(1800).prevented, undefined);
  assert.equal(setup().wheel(1800, { ctrlKey: true }).prevented, undefined);
  assert.equal(setup().wheel(10, { deltaX: 50 }).prevented, undefined);
});
