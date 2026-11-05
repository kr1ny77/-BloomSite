import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
const source = readFileSync(
  new URL('../static/js/presentation.js', import.meta.url),
  'utf8',
);

function openJourney() {
  const listeners = {};
  const requests = [];
  const node = () => ({
    attributes: {},
    inert: false,
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    toggleAttribute(name, active) {
      if (active) this.attributes[name] = '';
      else delete this.attributes[name];
    },
  });
  const headings = Array.from({ length: 3 }, () => ({
    ...node(),
    focus() {
      this.focused = true;
    },
  }));
  const panels = headings.map((heading) => ({
    ...node(),
    querySelector: () => heading,
  }));
  const buttons = Array.from({ length: 3 }, () => ({
    ...node(),
    addEventListener(_event, callback) {
      this.activate = callback;
    },
  }));
  const controls = { hidden: true, querySelectorAll: () => buttons };
  const journey = {
    ...node(),
    dataset: {},
    querySelector: () => controls,
    querySelectorAll: () => panels,
    addEventListener(name, callback) {
      listeners[name] = callback;
    },
    dispatchEvent(event) {
      requests.push(event);
    },
  };
  runInNewContext(source, {
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    document: { querySelector: () => journey },
  });
  return {
    journey,
    panels,
    headings,
    open: (index) => listeners['bloom:journeyopen']({ detail: { index } }),
    buttons,
    controls,
    requests,
    scroll: (index) => listeners['bloom:journeystep']({ detail: { index } }),
  };
}
function expectActive(page, expected) {
  assert.equal(page.journey.dataset.step, String(expected));
  page.panels.forEach((panel, index) => {
    assert.equal(panel.inert, index !== expected);
    assert.equal(panel.attributes['aria-hidden'], String(index !== expected));
    assert.equal(
      Object.hasOwn(panel.attributes, 'data-active'),
      index === expected,
    );
    assert.equal(
      page.buttons[index].attributes['aria-pressed'],
      String(index === expected),
    );
  });
}

test('enhancement shows one accessible scene and exposes controls without an animation engine', () => {
  const page = openJourney();
  assert.equal(page.controls.hidden, false);
  assert.equal(Object.hasOwn(page.journey.attributes, 'data-enhanced'), true);
  expectActive(page, 0);
});
test('pointer selection supports every scene and communicates the selected position to scroll', () => {
  const page = openJourney();
  for (const index of [1, 2, 0]) {
    page.buttons[index].activate({ detail: 1 });
    expectActive(page, index);
  }
  assert.deepEqual(
    page.requests.map((event) => event.detail.index),
    [1, 2, 0],
  );
  assert.ok(
    page.requests.every((event) => event.type === 'bloom:journeyrequest'),
  );
});
test('keyboard selection is immediate; subsequent scroll changes remain reversible and coherent', () => {
  const page = openJourney();
  page.buttons[2].activate({ detail: 0 });
  assert.equal(Object.hasOwn(page.journey.attributes, 'data-instant'), true);
  expectActive(page, 2);
  page.scroll(2);
  assert.equal(Object.hasOwn(page.journey.attributes, 'data-instant'), true);
  page.scroll(1);
  expectActive(page, 1);
  assert.equal(Object.hasOwn(page.journey.attributes, 'data-instant'), false);
  page.scroll(0);
  expectActive(page, 0);
  page.scroll(2);
  expectActive(page, 2);
});
test('out-of-range step events cannot hide all scenes or corrupt accessible selection', () => {
  const page = openJourney();
  page.buttons[1].activate({ detail: 1 });
  for (const invalid of [-1, 3, NaN, 0.5]) {
    page.scroll(invalid);
    expectActive(page, 1);
  }
});

test('barcode requests composition through the shared selection and focus path', () => {
  const p = openJourney();
  p.open(1);
  expectActive(p, 1);
  assert.equal(p.headings[1].focused, true);
  assert.equal(p.headings[1].attributes.tabindex, '-1');
  assert.equal(p.requests.at(-1).detail.index, 1);
  p.open(-1);
  expectActive(p, 1);
});
