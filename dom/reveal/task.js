/**
 * Обновление видимости элементов
 * 
 * @param {NodeList} elements - Список элементов, к которым необходимо применить 
 * класс активности.
 * @param {Object} params - Объект с параметрами.
 * @param {string} params.selector - Селектор элементов.
 * @param {string} params.activeClass - Активный класс элементов.
 * @param {boolean} params.removeClassOnExit - Нужно ли удалить активный класс при
 * выходе из зоны видимости. По умолчанию false.
 */
function updateVisibleElements(elements, { elements, activeClass, shouldRemoveClassOnExit }) {
  elements.forEach((elem) => {
    const { innerHeight } = window;
    const { top } = elem.getBoundingClientRect();
    
    if (top < innerHeight && top > 0) {
      elem.classList.add(activeClass);
    } else if (shouldRemoveClassOnExit) {
      elem.classList.remove(activeClass);
    }
  });
}

/**
 * Инициализация ScrollReveal
 * 
 * @param {Object} params - Параметры.
 * @param {string} params.selector - Селектор элементов.
 * @param {string} params.activeClass - Активный класс элементов.
 * @param {boolean} params.removeClassOnExit - Нужно ли удалить активный класс при 
 * выходе из зоны видимости. По умолчанию false.
 */
function initScrollReveal(params) {
  const elements = document.querySelectorAll(params.selector);
  document.addEventListener('scroll', () => {
    requestAnimationFrame(() => updateVisibleElements(elements, params));
  });
}

initScrollReveal({ selector: '.reveal', activeClass: 'reveal--active' });
