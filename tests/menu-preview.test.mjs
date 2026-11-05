import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
const source = readFileSync(
  new URL('../static/js/menu-preview.js', import.meta.url),
  'utf8',
);
function menu() {
  const requests = new Map();
  const errors = [];
  const node = () => ({
    dataset: {},
    attrs: {},
    listeners: {},
    addEventListener(type, fn) {
      this.listeners[type] = fn;
    },
    setAttribute(key, value) {
      this.attrs[key] = value;
    },
    removeAttribute(key) {
      delete this.attrs[key];
    },
    toggleAttribute(key, value) {
      if (value) this.attrs[key] = '';
      else delete this.attrs[key];
    },
  });
  const image = { src: 'initial' };
  const caption = { textContent: 'initial' };
  const preview = node();
  preview.querySelector = (key) => (key === 'img' ? image : caption);
  const links = ['choice', 'path', 'app', 'trust', 'launch'].map((key) => ({
    ...node(),
    dataset: { preview: key },
  }));
  runInNewContext(source, {
    document: { querySelector: () => preview, querySelectorAll: () => links },
    console: { error: (...args) => errors.push(args) },
    Image: class {
      decode() {
        return new Promise((resolve, reject) =>
          requests.set(this.src, { resolve, reject }),
        );
      }
    },
  });
  const select = (key, type = 'focus') =>
    links.find((link) => link.dataset.preview === key).listeners[type]();
  const settle = async (fragment, fail = false) => {
    const [, request] = [...requests].find(([url]) => url.includes(fragment));
    if (fail) request.reject(new Error('decode failed'));
    else request.resolve();
    await Promise.resolve();
    await Promise.resolve();
  };
  return { preview, image, caption, requests, errors, select, settle };
}
test('rapid focus commits only the latest decoded image and caption together', async () => {
  const p = menu();
  p.select('path');
  p.select('app');
  await p.settle('bloom-mark-96');
  assert.match(p.image.src, /bloom-mark-96/);
  assert.equal(
    p.caption.textContent,
    'Bloom среди привычных приложений. Концепт.',
  );
  await p.settle('ingredients');
  assert.match(p.image.src, /bloom-mark-96/);
  assert.equal(p.preview.dataset.preview, 'app');
  assert.equal(Object.hasOwn(p.preview.attrs, 'data-instant'), true);
});
test('decode failure hides stale imagery, preserves navigation and supports retry', async () => {
  const p = menu();
  p.select('app', 'pointerenter');
  await p.settle('bloom-mark-96', true);
  assert.equal(Object.hasOwn(p.preview.attrs, 'data-image-error'), true);
  assert.equal(p.errors.length, 1);
  assert.equal(Object.hasOwn(p.preview.attrs, 'aria-busy'), false);
  p.select('app');
  await p.settle('bloom-mark-96');
  assert.match(p.image.src, /bloom-mark-96/);
  assert.equal(Object.hasOwn(p.preview.attrs, 'data-image-error'), false);
});
test('a failure after the home-screen preview suppresses stale media and a retry commits together', async () => {
  const p = menu();
  p.select('app');
  await p.settle('bloom-mark-96');
  assert.equal(p.preview.dataset.preview, 'app');
  p.select('path');
  await p.settle('ingredients', true);
  assert.equal(Object.hasOwn(p.preview.attrs, 'data-image-error'), true);
  assert.equal(p.preview.dataset.preview, 'app');
  p.select('path');
  await p.settle('ingredients');
  assert.equal(Object.hasOwn(p.preview.attrs, 'data-image-error'), false);
  assert.equal(p.preview.dataset.preview, 'path');
  assert.match(p.image.src, /ingredients/);
  assert.equal(
    p.caption.textContent,
    'От привычного продукта к понятным фактам.',
  );
});
