/**
 * Возвращает следующий случай ротатора.
 * 
 * @param {HTMLElement} rotator - Элемент ротатора.
 * @param {HTMLElement} activeCase - Активный случай ротатора.
 * 
 * @return {HTMLElement} Следующий случай ротатора.
 */
function getNextCase(rotator, activeCase) {
  return activeCase.nextElementSibling || rotator.firstElementChild;
}

/**
 * Возвращает значения из атрибутов случая ротатора.
 * @param {HTMLElement} caseElement - Элемент случая ротатора.
 * @return {Object} Объект с ключами speed и color со значениями 
 * из атрибутов случая ротатора.
 */
function getCaseAttributes(caseElement) {
  const speed = parseInt(caseElement.getAttribute('data-speed'), 10) || 1000;
  const color = caseElement.getAttribute('data-color') || 'black';
  return { speed, color };
}

/**
 * Обновляет класс активного случая ротатора.
 * 
 * @param {HTMLElement} activeCase - Активный случай ротатора.
 * @param {HTMLElement} nextCase - Следующий случай ротатора.
 * @param {string} activeCaseClass - Класс активного случая ротатора.
 */
function updateActiveClass(activeCase, nextCase, activeCaseClass) {
  activeCase.classList.remove(activeCaseClass);
  nextCase.classList.add(activeCaseClass);
}

/**
 * Устанавливает цвет текста случая ротатора.
 * 
 * @param {HTMLElement} caseElement - Элемент случая ротатора.
 * @param {string} color - Цвет текста.
 */
function setCaseColor(caseElement, color) {
  caseElement.style.color = color;
}

/**
 * Обновляет активный случай ротатора.
 * 
 * @param {HTMLElement} rotator - Элемент ротатора.
 * @param {string} activeCaseClass - Класс активного случая ротатора.
 * 
 * @return {number} Скорость смены случаев ротатора для setTimeout.
 */
function updateActiveCase(rotator, activeCaseClass) {
  const activeCase = rotator.querySelector(`.${activeCaseClass}`);

  if (activeCase) {
    const nextCase = getNextCase(rotator, activeCase);
    const { speed, color } = getCaseAttributes(nextCase);

    updateActiveClass(activeCase, nextCase, activeCaseClass);
    setCaseColor(nextCase, color);

    return speed;
  }

  return 1000; // Значение по умолчанию, если активный случай не найден
}

/**
 * Инициализация ротатора рекламы.
 * 
 * @param {Object} params - Параметры.
 * @param {string} params.rotatorSelector - Селектор ротатора.
 * @param {string} params.activeCaseClass - Класс активного случая ротатора.
 */
function initializeAdRotator({ rotatorSelector, activeCaseClass }) {
  const rotator = document.querySelector(rotatorSelector);

  if (!rotator) {
    console.error(`Ротатор с селектором "${rotatorSelector}" не был найден.`);
    return;
  }

  let interval = 1000;
  const update = () => {
    interval = updateActiveCase(rotator, activeCaseClass);
    setTimeout(update, interval);
  };

  update();
}

// Инициализация
initializeAdRotator({
  rotatorSelector: '.rotator',
  activeCaseClass: 'rotator__case--active'
});
