/**
 * Объект, хранящий настройки программы.
 */
const settingsData = {
  dropdownParentClass: '.dropdown',
  dropdownListActiveClass: 'dropdown__list--active',
}

class Dropdown {

  /**
   * Объект, хранящий селекторы дочерних элементов выпадающего списка.
   * В качестве селекторов используются кастомные HTML-атрибуты для тегов.
   * @private
   */
  #childSelectors = {
    button: '[data-dropdown-role="value"]',
    list: '[data-dropdown-role="list"]',
    item: '[data-dropdown-role="item"]',
  }

  // Инициализация приватных полей класса.
  #parentElement;
  #dropdownValueElement;
  #dropdownListElement;
  #dropdownListActiveClass;

  /**
   * Создает экземпляр класса выпадающего списка.
   * @param {Object} settings Объект, хранящий настройки программы.
   * @param {HTMLElement} parentElement Родительский элемент выпадающего списка.
   */
  constructor(settings, parentElement) {
    // HTML-элемент родителя выпадающего списка
    this.#parentElement = parentElement || document.querySelector(settings.dropdownParentClass);

    // HTML-элементы дочерних элементов родителя выпадающего списка
    this.#dropdownValueElement = this.#parentElement.querySelector(this.#childSelectors.button);
    this.#dropdownListElement = this.#parentElement.querySelector(this.#childSelectors.list);

    // Класс активного состояния выпадающего списка
    this.#dropdownListActiveClass = settings.dropdownListActiveClass;

    // Инициализация выпадающего списка
    this.#init();
  }

  /**
   * Инициализация выпадающего списка.
   * @private
   */
  #init() {
    this.#dropdownValueElement.addEventListener('click', this.#toggleListVisibility.bind(this));
    this.#dropdownListElement.addEventListener('click', this.#selectValue.bind(this));
  }

  /**
   * Переключает видимость выпадающего списка.
   * @private
   */
  #toggleListVisibility() {
    this.#dropdownListElement.classList.toggle(this.#dropdownListActiveClass);
  }

  /**
   * Скрывает выпадающий список.
   * @private
   */
  #closeList() {
    this.#dropdownListElement.classList.remove(this.#dropdownListActiveClass);
  }

  /**
   * Выбирает значение выпадающего списка.
   * @param {Event} event Событие, вызвавшее выбор значения выпадающего списка.
   * @private
   */
  #selectValue(event) {
    event.preventDefault();
    const target = event.target.closest(this.#childSelectors.item);

    if (!target) return;

    this.#dropdownValueElement.textContent = target.textContent;
    this.#closeList();
  }
}

/**
 * Инициализация программы.
 * @param {Object} settings Объект, хранящий настройки программы.
 */
function initialize(settings) {
  const dropdowns = document.querySelectorAll(settings.dropdownParentClass);
  dropdowns.forEach(dropdown => new Dropdown(settingsData, dropdown));
}

document.addEventListener('DOMContentLoaded', () => initialize(settingsData));