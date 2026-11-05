import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(
  new URL('../static/js/motion.js', import.meta.url),
  'utf8',
);
function openStory(matches) {
  const scripts = [];
  const errors = [];
  const queries = [];
  let onChange;
  const preference = {
    matches,
    addEventListener(_event, callback) {
      onChange = callback;
    },
  };
  runInNewContext(source, {
    console: { error: (...args) => errors.push(args) },
    window: {
      matchMedia(query) {
        queries.push(query);
        return preference;
      },
      gsap: {
        registerPlugin() {},
        matchMedia: () => ({ add() {}, revert() {} }),
      },
      ScrollTrigger: { refresh() {} },
      addEventListener() {},
    },
    document: {
      createElement: () => ({}),
      head: { append: (script) => scripts.push(script) },
      fonts: { ready: Promise.resolve() },
      querySelectorAll: () => [],
    },
  });
  return { scripts, errors, queries, preference, change: () => onChange() };
}
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

test('mobile or reduced-motion story downloads no desktop motion engine', () => {
  const page = openStory(false);
  assert.equal(page.scripts.length, 0);
  assert.match(page.queries[0], /min-width: 1024px/);
  assert.match(page.queries[0], /prefers-reduced-motion: no-preference/);
});
test('desktop loads core before plugin and does not duplicate work on media changes', async () => {
  const page = openStory(true);
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, '/static/js/gsap.min.js');
  page.change();
  assert.equal(page.scripts.length, 1);
  page.scripts[0].onload();
  await settle();
  assert.equal(page.scripts[1].src, '/static/js/ScrollTrigger.min.js');
  page.scripts[1].onload();
  await settle();
  assert.equal(page.errors.length, 0);
});
test('optional engine failure preserves diagnostics and stops before plugin initialization', async () => {
  const page = openStory(true);
  page.scripts[0].onerror();
  await settle();
  assert.equal(page.scripts.length, 1);
  assert.equal(page.errors.length, 1);
  assert.match(page.errors[0][1].message, /gsap.min.js/);
});
