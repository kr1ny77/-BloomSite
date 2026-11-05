import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(
  new URL('../static/js/app.js', import.meta.url),
  'utf8',
);

test('menu navigation unlocks the document before focus, scroll and motion synchronization', () => {
  const trace = [];
  const frames = [];
  const classes = new Set();
  const node = () => ({
    listeners: {},
    attributes: {},
    dataset: {},
    addEventListener(name, callback) {
      this.listeners[name] = callback;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    toggleAttribute() {},
    getAttribute(name) {
      return this.attributes[name];
    },
  });
  const trigger = node();
  const close = node();
  const theme = node();
  const link = node();
  link.attributes.href = '#about';
  const target = {
    ...node(),
    focus(options) {
      assert.equal(options.preventScroll, true);
      assert.equal(classes.has('menu-open'), false);
      trace.push('focus');
    },
    scrollIntoView(options) {
      assert.equal(classes.has('menu-open'), false);
      assert.equal(options.behavior, 'instant');
      trace.push('scroll');
    },
  };
  let queuedClose;
  const menu = {
    ...node(),
    showModal() {},
    close() {
      queuedClose = () => menu.listeners.close();
    },
    querySelectorAll() {
      return [link];
    },
  };
  const elements = {
    '#site-menu': menu,
    '.menu-toggle': trigger,
    '.menu-close': close,
    '.theme-toggle': theme,
    '#about': target,
  };
  const window = {
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (callback) => frames.push(callback),
    dispatchEvent: (event) => trace.push(event.type),
  };
  runInNewContext(source, {
    document: {
      documentElement: node(),
      body: {
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
        },
      },
      querySelector: (selector) => elements[selector],
    },
    window,
    history: {
      pushState: (_state, _title, hash) => {
        assert.equal(hash, '#about');
        trace.push('history');
      },
    },
    CustomEvent: class {
      constructor(type) {
        this.type = type;
      }
    },
  });
  trigger.listeners.click({ detail: 1 });
  assert.equal(classes.has('menu-open'), true);
  link.listeners.click({ detail: 1, preventDefault() {} });
  assert.deepEqual(trace, []);
  queuedClose();
  assert.equal(classes.has('menu-open'), false);
  assert.deepEqual(trace, []);
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.deepEqual(trace, ['history', 'focus', 'scroll', 'bloom:navigated']);
});
