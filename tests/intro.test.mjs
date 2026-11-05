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
  blocked = false,
} = {}) {
  const events = new Map(),
    timers = new Map();
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
  const sources = [
    { dataset: { lightSrc: 'light.mov', darkSrc: 'dark.mov' } },
    { dataset: { lightSrc: 'light.webm', darkSrc: 'dark.webm' } },
  ];
  let loads = 0,
    plays = 0,
    pauses = 0;
  const artwork = {
    hidden: true,
    querySelectorAll: () => sources,
    addEventListener: (event, cb) => events.set(event, cb),
    load: () => {
      loads++;
    },
    pause: () => {
      pauses++;
    },
    play: () => {
      plays++;
      return blocked
        ? Promise.reject(new Error('autoplay blocked'))
        : Promise.resolve();
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
  runInNewContext(source, {
    document,
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
    events,
    timers,
    motion,
    scheme,
    root,
    host,
    darkSource,
    sources,
    artwork,
    document,
    counts: () => ({ loads, plays, pauses }),
  };
}
function play(p) {
  p.events.get('canplay')();
  p.events.get('playing')();
}

test('video waits for data and actual playing before replacing the still', () => {
  const p = openPage();
  assert.equal(p.counts().loads, 1);
  assert.equal(p.counts().plays, 0);
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.artwork.muted, true);
  assert.equal(p.artwork.playsInline, true);
  assert.equal(p.artwork.playbackRate, 1);
  p.events.get('canplay')();
  assert.equal(p.counts().plays, 1);
  assert.equal(p.artwork.hidden, true);
  p.events.get('playing')();
  assert.equal(p.artwork.hidden, false);
  assert.equal(p.host.dataset.introState, 'playing');
  assert.equal(
    p.timers.size,
    0,
    'native video completion owns playback, not a wall-clock timeout',
  );
});
test('system and manual themes populate both native codec alternatives consistently', () => {
  const p = openPage({ dark: true });
  assert.deepEqual(
    p.sources.map((s) => s.src),
    ['dark.mov', 'dark.webm'],
  );
  assert.equal(p.darkSource.media, 'all');
  const light = openPage({ dark: true, theme: 'light' });
  assert.deepEqual(
    light.sources.map((s) => s.src),
    ['light.mov', 'light.webm'],
  );
  assert.equal(light.darkSource.media, 'not all');
});
test('reduced motion and hidden initial documents download no video', () => {
  for (const settings of [{ reduced: true }, { hidden: true }]) {
    const p = openPage(settings);
    assert.equal(p.counts().loads, 0);
    assert.equal(p.counts().plays, 0);
    assert.ok(p.sources.every((s) => s.src === undefined));
    assert.equal(p.timers.size, 0);
  }
});
test('native ended restores the complete still, preserving video quality counters for diagnostics', () => {
  const p = openPage();
  play(p);
  p.events.get('ended')();
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.counts().pauses, 1);
  assert.equal(p.sources[1].src, 'light.webm');
});
test('startup timeout retains the still and a late canplay or playing cannot restart it', () => {
  const p = openPage();
  assert.equal(p.timers.get(1).delay, 1800);
  p.timers.get(1).cb();
  play(p);
  assert.equal(p.counts().plays, 0);
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.host.dataset.introState, 'static');
});
test('blocked autoplay and decode errors fall back to the static logo', async () => {
  const p = openPage({ blocked: true });
  p.events.get('canplay')();
  await Promise.resolve();
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.timers.size, 0);
  const failed = openPage();
  play(failed);
  failed.events.get('error')();
  assert.equal(failed.artwork.hidden, true);
  assert.equal(failed.host.dataset.introState, 'static');
});
test('brief buffering recovers; a sustained stall restores the complete still', () => {
  const p = openPage();
  p.events.get('waiting')();
  play(p);
  p.events.get('waiting')();
  assert.equal(p.host.dataset.introState, 'playing');
  assert.equal(p.timers.get(1).delay, 1800);
  p.events.get('playing')();
  assert.equal(p.timers.size, 0);
  assert.equal(p.artwork.hidden, false);
  p.events.get('waiting')();
  p.timers.get(1).cb();
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.artwork.hidden, true);
});
test('reducing motion cancels loading or playback and prevents a delayed media event', () => {
  for (const started of [false, true]) {
    const p = openPage();
    if (started) play(p);
    p.motion.matches = true;
    p.events.get('motion')();
    play(p);
    assert.equal(p.artwork.hidden, true);
    assert.equal(p.host.dataset.introState, 'static');
    assert.equal(p.timers.size, 0);
  }
});
test('theme switches choose matching static ink and do not replay the video', () => {
  const p = openPage();
  play(p);
  p.root.dataset.theme = 'dark';
  p.events.get('theme')();
  assert.equal(p.darkSource.media, 'all');
  assert.equal(p.artwork.hidden, true);
  p.events.get('playing')();
  assert.equal(p.artwork.hidden, true);
});
test('backgrounding the document pauses playback and retains its complete composition', () => {
  const p = openPage();
  play(p);
  p.document.hidden = true;
  p.events.get('visibilitychange')();
  assert.equal(p.artwork.hidden, true);
  assert.equal(p.host.dataset.introState, 'static');
  assert.equal(p.timers.size, 0);
});
