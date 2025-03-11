/**
 * Создает обертку для хранения временного style тега с нужными css-свойствами
 * @param {string} tooltipWrapperSelector - селектор обертки
 * @return {HTMLElement} HTML-элемент обертки
 */
function createTooltipWrapper(tooltipWrapperSelector) {
  const tooltipWrapper = document.createElement('div');
  tooltipWrapper.className = tooltipWrapperSelector.replace('.', '');
  document.body.appendChild(tooltipWrapper);
  return tooltipWrapper;
}

/**
 * Создает style тег с нужными css-свойствами
 * 
 * @param {string} tooltipLinkSelector - селектор ссылки
 * @param {string} tooltipText - текст подсказки
 * 
 * @return {HTMLElement} HTML-элемент style
 */
function createTooltipStyle(tooltipLinkSelector, tooltipText, position, activeClass) {
  console.log(position)
  const tooltip = document.createElement('style');
  tooltip.innerHTML = `
    ${tooltipLinkSelector}::after {
      content: '${tooltipText}';
      white-space: nowrap;
    }

    ${tooltipLinkSelector}::after {
      ${position === 'top' ? 'top: 0; left: 50%; transform: translateX(-50%);' : ''}
      ${position === 'bottom' ? 'top: 0; left: 50%; transform: translateX(-50%);' : ''}
      ${position === 'left' ? 'right: 0; top: 50%; transform: translateY(-50%);' : ''}
      ${position === 'right' ? 'left: 0; top: 50%; transform: translateY(-50%);' : ''}
    }
    
    ${tooltipLinkSelector}.${activeClass}::after {
      ${position === 'top' ? 'top: -175%;' : ''}
      ${position === 'bottom' ? 'top: 100%;' : ''}
      ${position === 'left' ? 'left: -60%;' : ''}
      ${position === 'right' ? 'left: 110%;' : ''}
    }
  `;
  return tooltip;
}

/**
 * Показывает подсказку
 * 
 * @param {HTMLElement} link - HTML-элемент ссылки
 * @param {string} tooltipText - текст подсказки
 * @param {Object} params - Объект с параметрами
 */
function showTooltip(event, link, params) {
  event.preventDefault();

  const { tooltipWrapperSelector, activeClass, tooltipLinkSelector, tooltipTextDataAttribute } = params;
  const tooltipTextDefault = 'Текст подсказки по умолчанию'
  const tooltipText = link.getAttribute(tooltipTextDataAttribute) || tooltipTextDefault;
  const position = link.getAttribute('data-position') || 'bottom';

  let tooltipWrapper = document.querySelector(tooltipWrapperSelector);

  if (!tooltipWrapper) {
    tooltipWrapper = createTooltipWrapper(tooltipWrapperSelector);
    const tooltip = createTooltipStyle(tooltipLinkSelector, tooltipText, position, activeClass);
    tooltipWrapper.appendChild(tooltip);
  }

  link.classList.add(activeClass);
}

/**
 * Скрывает подсказку
 * 
 * @param {HTMLElement} link - HTML-элемент ссылки
 * @param {Object} params - Объект с параметрами
 */
function hideTooltip(link, params) {
  const { tooltipWrapperSelector, activeClass } = params;
  const tooltipWrapper = document.querySelector(tooltipWrapperSelector);
  setTimeout(() => {
    if (document.body.contains(tooltipWrapper)) {
      document.body.removeChild(tooltipWrapper);
    }
  }, 100);
  link.classList.remove(activeClass);
}

/**
 * Инициализация всплывающих подсказок
 * @param {Object} params - Объект с параметрами
 */
function initializeTooltip(params) {
  const { tooltipLinkSelector, eventType } = params;
  const links = document.querySelectorAll(tooltipLinkSelector);
  links.forEach((link) => {
    link.addEventListener(eventType.show, (event) => showTooltip(event, link, params));
    link.addEventListener(eventType.hide, () => hideTooltip(link, params));
  });
}

initializeTooltip({
  tooltipLinkSelector: '.has-tooltip',
  tooltipTextDataAttribute: 'title',
  tooltipWrapperSelector: '.tooltip-wrapper',
  activeClass: 'active',
  eventType: { show: 'click', hide: 'mouseout' }
});
