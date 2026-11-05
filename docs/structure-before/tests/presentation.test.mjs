import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(
  new URL('../static/js/presentation.js', import.meta.url),
  'utf8',
);
test('screen selection updates the spotlight, explanation and accessible state without GSAP', () => {
  const app = { dataset: {} };
  const description = { textContent: '' };
  const buttons = ['result', 'composition'].map((screen) => ({
    dataset: { screen },
    attributes: {},
    addEventListener(_type, callback) {
      this.activate = callback;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  }));
  const controls = {
    hidden: true,
    querySelectorAll: () => buttons,
    querySelector: () => description,
  };
  runInNewContext(source, {
    document: {
      querySelector: (selector) =>
        ({ '.app': app, '.app-presentation-controls': controls })[selector] ??
        null,
    },
  });
  assert.equal(controls.hidden, false);
  assert.equal(app.dataset.focus, 'result');
  buttons[1].activate();
  assert.equal(app.dataset.focus, 'composition');
  assert.equal(buttons[0].attributes['aria-pressed'], 'false');
  assert.equal(buttons[1].attributes['aria-pressed'], 'true');
  assert.match(description.textContent, /источники/);
  buttons[0].activate();
  assert.equal(app.dataset.focus, 'result');
  assert.equal(buttons[1].attributes['aria-pressed'], 'false');
});
