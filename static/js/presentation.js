(() => {
  'use strict';
  const journey = document.querySelector('[data-journey]');
  if (!journey) return;
  const controls = journey.querySelector('.journey-controls');
  const buttons = [...controls.querySelectorAll('[data-journey-step]')];
  const panels = [...journey.querySelectorAll('[data-journey-panel]')];
  const select = (index, instant = false) => {
    if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
    journey.dataset.step = String(index);
    journey.toggleAttribute('data-instant', instant);
    buttons.forEach((button, position) =>
      button.setAttribute('aria-pressed', String(position === index)),
    );
    panels.forEach((panel, position) => {
      const active = position === index;
      panel.toggleAttribute('data-active', active);
      panel.setAttribute('aria-hidden', String(!active));
      panel.inert = !active;
    });
  };
  select(0);
  journey.setAttribute('data-enhanced', '');
  controls.hidden = false;
  buttons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
      select(index, event.detail === 0);
      journey.dispatchEvent(
        new CustomEvent('bloom:journeyrequest', { detail: { index } }),
      );
    });
  });
  journey.addEventListener('bloom:journeystep', (event) => {
    if (journey.dataset.step !== String(event.detail.index))
      select(event.detail.index);
  });
})();
