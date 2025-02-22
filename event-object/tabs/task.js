/**
 * Объект с настройками табов.
 */
const tabsSettings = {
  containerID: '#tabs-1',
  tabButton: { selector: '[tab-role="btn"]', activeClass: 'tab__btn--active' },
  tabContent: { selector: '[tab-role="content"]', activeClass: 'tab__content--active' },
};

class Tabs {

  // Объект с настройками
  #settings;

  // HTML-элементы
  #container;
  #buttons;
  #contents;

  // Селекторы
  #buttonSelectorConfig;
  #contentSelectorConfig;

  /**
   * Создает экземпляр класса Tabs.
   * @param {Object} settings - Объект с настройками табов.
   */
  constructor(settings) {
    this.#settings = settings;
    this.#init();
  }

  /**
   * Инициализация программы.
   * @private
   */
  #init() {
    // HTML-элементы
    this.#container = document.querySelector(this.#settings.containerID);
    this.#buttons = this.#container.querySelectorAll(`${this.#settings.tabButton.selector}`);
    this.#contents = this.#container.querySelectorAll(`${this.#settings.tabContent.selector}`);

    // Селекторы
    this.#buttonSelectorConfig = this.#settings.tabButton;
    this.#contentSelectorConfig = this.#settings.tabContent;

    // Регистрация событий
    this.#registerEvents();
  }

  /**
   * Регистрация событий.
   * @private
   */
  #registerEvents() {
    this.#registerTabClickEvent();
  }

  /**
   * Регистрация событий нажатия на кнопку таба.
   * @private
   */
  #registerTabClickEvent() {
    this.#container.addEventListener('click', event => {
      const tabButton = event.target.closest(this.#buttonSelectorConfig.selector);
      if (tabButton) this.#switchTab(tabButton);
    });
  }

  /**
   * Переключение активного таба.
   * @param {HTMLElement} tabButton - HTML-элемент кнопки таба.
   * @private
   */
  #switchTab(tabButton) {
    this.#removeAllActiveClass();
    const index = this.#getButtonIndex(tabButton);
    this.#addClassToElement(this.#contents[index], this.#contentSelectorConfig.activeClass);
    this.#addClassToElement(tabButton, this.#buttonSelectorConfig.activeClass);
  }

  /**
   * Удаление активного класса у всех элементов.
   * @private
   */
  #removeAllActiveClass() {
    this.#removeClassFromElements(this.#buttons, this.#buttonSelectorConfig.activeClass);
    this.#removeClassFromElements(this.#contents, this.#contentSelectorConfig.activeClass);
  }

  /**
   * Удаление класса у элементов.
   * 
   * @param {NodeList} elements - Node-collection элементов.
   * @param {string} className - Класс, который нужно удалить.
   * 
   * @private
   */
  #removeClassFromElements(elements, className) {
    elements.forEach(element => element.classList.remove(className));
  }

  /**
   * Получение индекса кнопки таба.
   * 
   * @param {HTMLElement} tabButton - HTML-элемент кнопки таба.
   * @returns {number} Индекс кнопки таба.
   * 
   * @private
   */
  #getButtonIndex(tabButton) {
    return [...this.#buttons].indexOf(tabButton);
  }

  /**
   * Добавление класса к элементу.
   * 
   * @param {HTMLElement} element - HTML-элемент.
   * @param {string} className - Класс, который нужно добавить.
   * 
   * @private
   */
  #addClassToElement(element, className) {
    if (element) element.classList.add(className);
  }
}

/**
 * Инициализация программы.
 */
function initialize() {
  new Tabs(tabsSettings);
};

document.addEventListener('DOMContentLoaded', () => initialize());