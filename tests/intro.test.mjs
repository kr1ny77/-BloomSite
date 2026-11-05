import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
const source = readFileSync(
  new URL('../static/js/intro.js', import.meta.url),
  'utf8',
);

function openPage({
  reduced = false,
  dark = false,
  theme,
  hidden = false,
} = {}) {
  const events = new Map();
  const timers = new Map();
  const motion = {
    matches: reduced,
    addEventListener: (_, cb) => events.set('motion', cb),
  };
  const scheme = {
    matches: dark,
    addEventListener: (_, cb) => events.set('scheme', cb),
  };
  const root = { dataset: theme ? { theme } : {} };
  const host = { dataset: { introState: 'static' } };
  const darkSource = {};
  const artwork = {
    src: 'static-light.webp',
    hidden: true,
    dataset: {
      lightSrc: 'intro-light.webp',
      darkSrc: 'intro-dark.webp',
    },
    addEventListener: (event, cb) => events.set(event, cb),
    removeAttribute(name) {
      delete this[name];
    },
  };
  const document = {
    documentElement: root,
    hidden,
    addEventListener: (event, cb) => events.set(event, cb),
    querySelector: (selector) =>
      ({
        '.hero-brand': host,
        '.wordmark-animation': artwork,
        '.wordmark-dark-source': darkSource,
      })[selector],
  };
  let now = 0;
  runInNewContext(source, {
    document,
    performance: { now: () => now },
    MutationObserver: class {
      constructor(cb) {
        events.set('theme', cb);
      }
      observe() {}
    },
    window: {
      matchMedia: (query) => (query.includes('reduced') ? motion : scheme),
      setTimeout: (cb, delay) => {
        timers.set(1, { cb, delay });
        return 1;
      },
      clearTimeout: (id) => timers.delete(id),
    },
  });
  return {
    root,
    host,
    artwork,
    darkSource,
    motion,
    scheme,
    events,
    timers,
    document,
    advance: (value) => {
      now = value;
    },
  };
}

test('complete static brand stays in flow until the selected animation loads', () => {
  const p = openPage();
  assert.equal(p.artwork.src, 'intro-light.webp');
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.artwork.hidden, true);
  p.events.get('load')();
  assert.equal(p.host.dataset.introState, 'playing');
  assert.equal(p.artwork.hidden, false);
  assert.equal(p.timers.get(1).delay, 5000);
});
test('system dark theme and a manual theme override choose matching ink', () => {
  const dark = openPage({ dark: true });
  assert.equal(dark.artwork.src, 'intro-dark.webp');
  assert.equal(dark.darkSource.media, 'all');
  const light = openPage({ dark: true, theme: 'light' });
  assert.equal(light.artwork.src, 'intro-light.webp');
  assert.equal(light.darkSource.media, 'not all');
});
test('reduced motion never requests animation', () => {
  const p = openPage({ reduced: true });
  assert.equal(p.artwork.src, 'static-light.webp');
  assert.equal(p.events.has('load'), false);
  assert.equal(p.host.dataset.introState, 'static');
});
test('a single playback returns to the identical static composition', () => {
  const p = openPage();
  p.events.get('load')();
  p.timers.get(1).cb();
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.artwork.src, undefined);
  assert.equal(p.timers.size, 0);
});
test('an asset failure preserves the static logo', () => {
  const p = openPage();
  p.events.get('error')();
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.artwork.hidden, true);
});
test('a late network response does not replace a settled logo with an intro', () => {
  const p = openPage();
  p.advance(1300);
  p.events.get('load')();
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.timers.size, 0);
});
test('reducing motion interrupts playback and prevents a late load from restarting it', () => {
  for (const loaded of [false, true]) {
    const p = openPage();
    if (loaded) p.events.get('load')();
    p.motion.matches = true;
    p.events.get('motion')();
    p.events.get('load')();
    assert.equal(p.host.dataset.introState, 'static');
    assert.equal(p.artwork.hidden, true);
    assert.equal(p.timers.size, 0);
  }
});
test('theme changes immediately restore matching static ink without replay', () => {
  const p = openPage();
  p.events.get('load')();
  p.root.dataset.theme = 'dark';
  p.events.get('theme')();
  assert.equal(p.darkSource.media, 'all');
  assert.equal(p.host.dataset.introState, 'static');
  p.events.get('load')();
  assert.equal(p.artwork.hidden, true);
});
test('backgrounding the page settles its logo and cancels the timer', () => {
  const p = openPage();
  p.events.get('load')();
  p.document.hidden = true;
  p.events.get('visibilitychange')();
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.timers.size, 0);
});
