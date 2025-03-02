/**
 * Инициализация ротатора рекламы.
 * 
 * @param {Object} params - Параметры.
 * @param {string} params.rotatorSelector - Селектор ротатора.
 * @param {string} params.defaultCaseClass - Класс по умолчанию случая ротатора.
 * @param {string} params.activeCaseClass - Класс активного случая ротатора.
 * @param {Array} params.cases - Массив объектов с данными случаев ротатора.
 */
function initializeAdRotator(params) {
  const { 
    rotatorSelector, defaultCaseClass, activeCaseClass 
  } = validateRotatorSelectorAndCasesClasses(params); 
  const rotator = document.querySelector(rotatorSelector);

  if (!rotator) {
    console.error(`Ротатор с селектором "${rotatorSelector}" не был найден.`);
    return;
  }

  let currentIndex = 0;

  /**
   * Обновляет активный случай ротатора.
   */
  const update = () => {
    removeExistingCase(rotator, defaultCaseClass);

    const nextCaseData = validateCasesParams(params.cases[currentIndex]);
    const nextCaseElement = createCaseElement(nextCaseData, defaultCaseClass);

    addCaseToDOM(rotator, nextCaseElement);
    activateCase(nextCaseElement, activeCaseClass);
    setCaseColor(nextCaseElement, nextCaseData.color);

    currentIndex = getNextCaseIndex(currentIndex, params.cases);

    setTimeout(update, nextCaseData.speed);
  };

  update();
}

/**
 * Валидация селектора ротатора и классов случаев ротатора перед использованием.
 * 
 * @param {Object} params - Объект с параметрами для валидации.
 * @return {Object} Параметры, которые были проверены и подтверждены.
 */
function validateRotatorSelectorAndCasesClasses(params) {
  params.rotatorSelector = (typeof params.rotatorSelector === 'string') ? params.rotatorSelector : '';
  params.defaultCaseClass = (typeof params.defaultCaseClass === 'string') ? params.defaultCaseClass : '';
  params.activeCaseClass = (typeof params.activeCaseClass === 'string') ? params.activeCaseClass : '';

  return params;
}

/**
 * Валидация параметров случаев ротатора перед их использованием.
 * 
 * @param {Object} params - Объект с параметрами для валидации.
 * @return {Object} Параметры, которые были проверены и подтверждены в случаях ротатора.
 */
function validateCasesParams(params) {
  params.speed = (typeof params.speed === 'number') ? params.speed : 1000;
  params.color = (typeof params.color === 'string') ? params.color : '#000000';
  params.text = (typeof params.text === 'string') ? params.text : '';

  return params;
}

/**
 * Возвращает следующий случай ротатора.
 * 
 * @param {number} currentIndex - Индекс текущего активного случая.
 * @param {Array} cases - Массив объектов с данными случаев ротатора.
 * @return {number} Индекс следующего случая ротатора.
 */
function getNextCaseIndex(currentIndex, cases) {
  return (currentIndex + 1) % cases.length;
}

/**
 * Создает базовый элемент ротатора с базовым классом.
 * 
 * @param {string} defaultCaseClass - Класс по умолчанию для случая ротатора.
 * @return {HTMLElement} Базовый элемент ротатора с базовым классом.
 */
function createBaseElement(defaultCaseClass) {
  const caseElement = document.createElement('span');
  caseElement.classList.add(defaultCaseClass);
  return caseElement;
}

/**
 * Устанавливает атрибуты для элемента ротатора.
 * 
 * @param {HTMLElement} caseElement - Элемент ротатора, которому нужно установить атрибуты.
 * @param {Object} caseData - Данные случая ротатора (скорость и цвет).
 */
function setCaseAttributes(caseElement, caseData) {
  caseElement.setAttribute('data-speed', caseData.speed);
  caseElement.setAttribute('data-color', caseData.color);
}

/**
 * Создает элемент случая ротатора с заданными данными (классы, атрибуты и текст).
 * 
 * @param {Object} caseData - Данные случая ротатора для заполнения элемента.
 * @param {string} defaultCaseClass - Класс по умолчанию для случая ротатора.
 * @return {HTMLElement} Элемент случая ротатора.
 */
function createCaseElement(caseData, defaultCaseClass) {
  const caseElement = createBaseElement(defaultCaseClass);
  
  setCaseAttributes(caseElement, caseData);
  setCaseText(caseElement, caseData.text);

  return caseElement;
}

/**
 * Устанавливает текстовое содержимое для элемента ротатора.
 * 
 * @param {HTMLElement} caseElement - Элемент ротатора.
 * @param {string} text - Текст для установки.
 */
function setCaseText(caseElement, text) {
  caseElement.textContent = text;
}

/**
 * Удаляет существующий случай ротатора из DOM.
 * 
 * @param {HTMLElement} rotator - Элемент ротатора.
 * @param {string} defaultCaseClass - Класс по умолчанию случая ротатора.
 */
function removeExistingCase(rotator, defaultCaseClass) {
  const existingCase = rotator.querySelector(`.${defaultCaseClass}`);
  if (existingCase) rotator.removeChild(existingCase);
}

/**
 * Добавляет новый случай ротатора в DOM.
 * 
 * @param {HTMLElement} rotator - Элемент ротатора.
 * @param {HTMLElement} caseElement - Элемент случая ротатора.
 */
function addCaseToDOM(rotator, caseElement) {
  rotator.appendChild(caseElement);
}

/**
 * Активирует случай ротатора, добавляя класс активного случая.
 * 
 * @param {HTMLElement} caseElement - Элемент случая ротатора.
 * @param {string} activeCaseClass - Класс активного случая ротатора.
 */
function activateCase(caseElement, activeCaseClass) {
  setTimeout(() => caseElement.classList.add(activeCaseClass), 10);
}

/**
 * Устанавливает цвет текста для случая ротатора.
 * 
 * @param {HTMLElement} caseElement - Элемент случая ротатора.
 * @param {string} color - Цвет текста.
 */
function setCaseColor(caseElement, color) {
  caseElement.style.color = color;
}

// Данные случаев ротатора, которые будут добавлены в html
const casesData = [
  { speed: 1000, color: 'red', text: 'Бог JS' },
  { speed: 2000, color: 'green', text: 'лучший программист на земле' },
  { speed: 1000, color: '#000', text: 'покорю этот мир' },
  { speed: 3000, color: 'red', text: 'знаю python, javascript, html, css, UI-дизайн' },
  { speed: 500, color: 'blue', text: 'счастливый как никто' },
  { speed: 200, color: 'gray', text: 'радуюсь жизни' },
];

// Инициализация
initializeAdRotator({
  rotatorSelector: '.rotator',
  defaultCaseClass: 'rotator__case',
  activeCaseClass: 'rotator__case--active',
  cases: casesData,
});
