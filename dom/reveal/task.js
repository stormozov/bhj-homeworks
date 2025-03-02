/**
 * Проверка видимости элемента
 * @param {HTMLElement} elem - HTML-элемент.
 * @param {number} threshold - Порог видимости. По умолчанию 0.
 */
function isElementInViewport(elem, threshold) {
  const rect = elem.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  threshold = (typeof threshold === 'number') || 0;

  return (
    rect.top < windowHeight - threshold &&
    rect.bottom > 0 + threshold
  );
}

/**
 * Обновление видимости элементов
 * @param {Object} params - Объект с параметрами.
 * @param {string} params.selector - Селектор элементов.
 * @param {string} params.activeClass - Активный класс элементов.
 * @param {boolean} params.removeClassOnExit - Удаление активного класса при выходе из зоны 
 * видимости. По умолчанию false.
 * @param {number} params.threshold - Порог видимости. По умолчанию 0.
 */
function updateVisibleElements({ selector, activeClass, removeClassOnExit, threshold }) {
  const elements = document.querySelectorAll(selector);
  const shouldRemoveClassOnExit = (typeof removeClassOnExit === 'boolean') || false;

  elements.forEach((elem) => {
    if (isElementInViewport(elem, threshold)) {
      elem.classList.add(activeClass);
    } else if (shouldRemoveClassOnExit) {
      elem.classList.remove(activeClass);
    }
  });
}

/**
 * Инициализация ScrollReveal
 * @param {Object} params - Параметры.
 * @param {string} params.selector - Селектор элементов.
 * @param {string} params.activeClass - Активный класс элементов.
 * @param {boolean} params.removeClassOnExit - Удаление активного класса при выходе из зоны 
 * видимости. По умолчанию false.
 * @param {number} params.threshold - Порог видимости. По умолчанию 0.
 */
function initScrollReveal(params) {
  document.addEventListener('scroll', () => {
    requestAnimationFrame(() => updateVisibleElements(params));
  });
}

initScrollReveal({ selector: '.reveal', activeClass: 'reveal--active' });
