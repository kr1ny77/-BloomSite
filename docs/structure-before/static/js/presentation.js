(() => {
  'use strict';
  const app = document.querySelector('.app');
  const controls = document.querySelector('.app-presentation-controls');
  if (!app || !controls) return;
  const descriptions = {
    result:
      'Общий результат: отправная точка. Дальше можно изучить показатели.',
    composition:
      'За результатом стоят ингредиенты, пищевая ценность и доступные источники.',
  };
  const buttons = [...controls.querySelectorAll('[data-screen]')];
  controls.hidden = false;
  app.dataset.focus = 'result';
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      app.dataset.focus = button.dataset.screen;
      buttons.forEach((item) =>
        item.setAttribute('aria-pressed', String(item === button)),
      );
      controls.querySelector('.app-focus-description').textContent =
        descriptions[button.dataset.screen];
    });
  });
})();
