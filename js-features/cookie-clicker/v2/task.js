/**
 * Объект с настройками приложения
 */
const cookieGameSetting = {
  'speedSettings': {
    'parentWrapper': '.clicker__status',
    'creatingElemId': 'clicker__speed-text',
    'clickSpeedOutputId': 'clicker__speed-output',
    'clickSpeedBtnId': 'speed-click-btn',
  },
  'counterSettings': {
    'cookieClickerButtonId': 'cookie',
    'countElementOutputId': 'clicker__counter',
    'resetCounterBtnId': 'reset-counter-btn',
  },
  'clickAnimatorSettings': {
    'widthIncrement': 25,
  }
};

class ClickHandler {

  /**
   * Создает экземпляр класса ClickHandler.
   * @param {HTMLElement} clickElementId - ID элемента, на который кликаем.
   * @param {Function} clickCallback - Функция обратного вызова, вызываемая при клике.
   * @throws {TypeError} Если clickElementId не является строкой или clickCallback не является функцией.
   */
  constructor(clickElementId, clickCallback) {
    this._validateParams(clickElementId, clickCallback);

    this.clickDOMElement = document.getElementById(clickElementId);
    this.clickCallback = clickCallback;
    this.handleClickBound = this._handleClick.bind(this);

    // Поле для хранения состояния процесса обработки кликов
    this.isRunning = false;
  }

  /**
   * Запускает обработку кликов.
   */
  start() {
    if (this.isRunning) {
      console.warn('ClickHandler уже запущен.');
      return;
    }

    this.clickDOMElement.addEventListener('click', this.handleClickBound);
    this.isRunning = true;
  }

  /**
   * Останавливает обработку кликов.
   */
  stop() {
    if (!this.isRunning) {
      console.warn('ClickHandler уже остановлен.');
      return;
    }

    this.clickDOMElement.removeEventListener('click', this.handleClickBound);
    this.isRunning = false;
  }

  /**
   * Обрабатывает клик по элементу.
   * @private
   */
  _handleClick() {
    this.clickCallback();
  }

  /**
   * Проверяет, что переданные параметры являются строкой и функцией соответственно.
   * @param {string} clickElementId - Параметр для проверки.
   * @param {Function} clickCallback - Параметр для проверки.
   * @private
   */
  _validateParams(clickElementId, clickCallback) {
    if (typeof clickElementId !== 'string' || typeof clickCallback !== 'function') {
      throw new TypeError('clickElementId и clickCallback класса ClickHandler должны быть строкой и функцией соответственно.');
    };
  }
};

class ClickCounter {

  /**
   * Создает экземпляр класса ClickCounter.
   * @param {HTMLElement} countElementOutputId - ID элемента, в котором будет отображаться счетчик кликов.
   * @throws {TypeError} Если countElementOutput не является HTMLElement.
   */
  constructor(countElementOutputId) {
    this._validateParams(countElementOutputId)

    this.countElementOutput = document.getElementById(countElementOutputId);
    this.clicksCount = 0;
  }

  /**
   * Увеличивает счетчик кликов на 1 и обновляет отображение.
   */
  increment() {
    this.clicksCount += 1;
    this.updateDisplay();
  }

  /**
   * Сбрасывает счетчик кликов и обновляет отображение.
   */
  reset() {
    this.clicksCount = 0;
    this.updateDisplay();
  }

  /**
   * Обновляет отображение счетчика кликов в DOM.
   * @private
   */
  updateDisplay() {
    this.countElementOutput.textContent = this.clicksCount;
  }

  /**
   * Проверяет, что переданный параметр является строкой.
   * @param {string} param - Параметр для проверки.
   * @private
   */
  _validateParams(param) {
    if (typeof param !== 'string') {
      throw new TypeError('Переданный параметр в класс ClickCounter должен быть строкой.');
    };
  }
};

class ClickSpeed {

  /**
   * Создает экземпляр класса ClickSpeed.
   * @param {Object} clickSpeedSettings - Объект с настройками скорости кликов.
   */
  constructor(clickSpeedSettings) {
    // Проверка переданных параметров перед их использованием.
    this._validateParams(clickSpeedSettings);

    // Сохранение настроек для скорости кликов.
    this.clickSpeedSettings = clickSpeedSettings;

    // Поле для хранения DOM-элемента и время последнего клика
    this.speedValueDOMElement = null;
    this.lastClickTime = null;

    // Поле для хранения состояния кнопки скорости клика
    this.clickSpeedBtnState = false;
  }

  /**
   * Обновляет значение скорости клика.
   */
  update() {
    const currentTime = new Date().getTime();
    const clickSpeed = this._calculateClickSpeed(currentTime);

    this._updateSpeedDOMElement(`${clickSpeed} кликов в секунду`);
    this._setLastClickTime(currentTime);
  }

  /**
   * Сбрасывает значение скорости клика и время последнего клика.
   */
  reset() {
    this._updateSpeedDOMElement('0 кликов в секунду');
    this._setLastClickTime(null);
  }

  /**
   * Обрабатывает нажатие на кнопку скорости клика.
   */
  clickSpeedBtnHandler() {
    const params = this.clickSpeedSettings;
    const btn = document.getElementById(params.clickSpeedBtnId);
    
    btn.addEventListener('click', () => {
      this.clickSpeedBtnState = !this.clickSpeedBtnState;

      if (this.clickSpeedBtnState) {
        this._constructDOMSpeedElement(params);
      } else {
        this._deleteDOMSpeedElement(params);
      }

      this._toggleClickSpeedTextBtn(params);
    });
  }

  /**
   * Создает DOM-элемент для отображения скорости клика.
   * @param {Object} speedElemParams - Объект с параметрами для создания DOM-элемента.
   * @private
   */
  _constructDOMSpeedElement(speedElemParams) {
    const { parentWrapper, creatingElemId, clickSpeedOutputId } = speedElemParams;
    const speedClicksDOMElement = document.createElement('p');

    speedClicksDOMElement.id = creatingElemId;
    speedClicksDOMElement.innerHTML = `Скорость клика: <span id="${clickSpeedOutputId}">0</span>`;

    document.querySelector(parentWrapper).appendChild(speedClicksDOMElement);

    this.speedValueDOMElement = speedClicksDOMElement.querySelector('span');
  }

  /**
   * Удаляет DOM-элемент для отображения скорости клика.
   * @param {Object} speedElemParams - Объект с параметрами для удаления DOM-элемента.
   * @private
   */
  _deleteDOMSpeedElement({ creatingElemId }) {
    const speedClicksDOMElement = document.getElementById(creatingElemId);
    if (speedClicksDOMElement) { speedClicksDOMElement.remove(); }
    this.speedValueDOMElement = null;
  }

  /**
   * Меняет текст кнопки скорости клика.
   * @param {Object} clickSpeedBtnId - ID кнопки показа и скрытия скорости клика.
   * @private
   */
  _toggleClickSpeedTextBtn({ clickSpeedBtnId }) {
    const speedClicksDOMElement = document.getElementById(clickSpeedBtnId);
    const speedTextSpan = speedClicksDOMElement.querySelector('span');

    speedTextSpan.textContent = this.clickSpeedBtnState ? 'Скрыть скорость клика' : 'Показать скорость клика';
  }

  /**
   * Рассчитывает скорость клика.
   * @param {number} currentTime - Время в секундах.
   * @returns {number} Скорость клика.
   */
  _calculateClickSpeed(currentTime) {
    const lastClickTime = this._getLastClickTime();

    if (lastClickTime !== null) {
      const timeDiff = (currentTime - lastClickTime) / 1000;
      return (1 / timeDiff).toFixed(2);
    }

    return 0;
  }

  /**
   * Возвращает время последнего клика.
   * @returns {number} Время в миллисекундах.
   * @private
   */
  _getLastClickTime() {
    return this.lastClickTime;
  }

  /**
   * Обновляет DOM-элемент для отображения скорости клика.
   * @param {string} value - Значение скорости клика. 
   */
  _updateSpeedDOMElement(value) {
    if (this.speedValueDOMElement) { this.speedValueDOMElement.textContent = value; }
  }

  /**
   * Устанавливает время последнего клика.
   * @param {number} value - Время в миллисекундах.
   * @private
   */
  _setLastClickTime(value) {
    this.lastClickTime = value;
  }

  /**
   * Проверяет, что переданный параметр является объектом и содержит только строки в качестве значений.
   * @param {Object} param - Параметр для проверки.
   * @private
   */
  _validateParams(param) {
    if (typeof param !== 'object') {
      throw new TypeError('Переданный параметр в класс ClickSpeed должен быть объектом.');
    }

    for (const key in param) {
      if (typeof param[key] !== 'string') {
        throw new TypeError(`Переданный параметр в класс ClickSpeed должен содержать только строки.`);
      }
    }
  }
};

class ClickAnimator {
  
  /**
   * Создает экземпляр класса ClickAnimator.
   * @param {HTMLElement} clickerButtonId - Элемент, который будет применять анимацию.
   */
  constructor(clickerButtonId) {
    this._validateButtonId(clickerButtonId);
    this.clickerButton = document.getElementById(clickerButtonId);
  }

  /**
   * Увеличивает ширину элемента.
   * @param {number} widthIncrement - На сколько пикселей увеличивать ширину элемента.
   * @param {number} [speed=100] - Скорость анимации.
   * @throws {RangeError} Если widthIncrement не является положительным числом.
   */
  increaseWidth(widthIncrement = 25, speed = 100) {
    this._validateIncrementWidthMethodParams({ widthIncrement, speed });

    const originalWidth = this.clickerButton.offsetWidth;
    this.clickerButton.style.width = `${originalWidth + widthIncrement}px`;
    setTimeout(() => { this.clickerButton.style.width = `${originalWidth}px`; }, speed);
  }

  /**
   * Проверяет, что переданный параметр класса является строкой.
   * @param {string} buttonId - Параметр для проверки параметра класса.
   * @private
   */
  _validateButtonId(buttonId) {
    if (typeof buttonId !== 'string') {
      throw new TypeError('Переданный параметр в класс ClickAnimator должен быть строкой.');
    }
  }

  /**
   * Проверяет, что переданные параметры метода increaseWidth являются положительными числами.
   * @param {Object} { widthIncrement, speed } - Объект с параметрами увеличения ширины элемента и скоростью анимации.
   * @private
   */
  _validateIncrementWidthMethodParams({ widthIncrement, speed }) {
    if (
      typeof widthIncrement !== 'number' ||
      typeof speed !== 'number' || speed <= 0
    ) {
      throw new RangeError('widthIncrement и speed должны быть положительным числом.');
    }
  }
};

class CookieClickerManager {

  /**
   * Основной класс-менеджер приложения. Создает экземпляр класса CookieClickerManager.
   * @param {Object} settings - Объект с настройками приложения.
   */
  constructor(settings) {
    // Сохранение настроек приложения
    this.counterSettings = settings.counterSettings;
    this.speedSettings = settings.speedSettings;
    this.clickAnimatorSettings = settings.clickAnimatorSettings;

    // Инициализация вспомогательных классов
    this.clickHandler = new ClickHandler(this.counterSettings.cookieClickerButtonId, this._handleClick.bind(this));
    this.clickCounterHandler = new ClickCounter(this.counterSettings.countElementOutputId);
    this.clickSpeedHandler = new ClickSpeed(this.speedSettings);
    this.clickAnimatorHandler = new ClickAnimator(this.counterSettings.cookieClickerButtonId);
  }

  /**
   * Запускает приложение.
   */
  start() {
    this.clickHandler.start();
    this.clickSpeedHandler.clickSpeedBtnHandler();
    this.resetBtnHandler(this.counterSettings.resetCounterBtnId);
  }

  /**
   * Останавливает приложение.
   */
  stop() {
    this.clickHandler.stop();
  }

  /**
   * Сбрасывает счетчик кликов и скорость клика.
   */
  reset() {
    this.clickCounterHandler.reset();
    this.clickSpeedHandler.reset();
  }

  /**
   * Обработчик клика.
   */
  _handleClick() {
    this.clickCounterHandler.increment();
    this.clickAnimatorHandler.increaseWidth(this.clickAnimatorSettings.widthIncrement);
    this.clickSpeedHandler.update();
  }

  /**
   * Обработчик сброса счетчика по клику на кнопку.
   * @param {string} buttonId - ID кнопки сброса счетчика.
   */
  resetBtnHandler(buttonId) {
    document.getElementById(buttonId).addEventListener('click', () => this.reset());
  }
};

/**
 * Инициализирует приложение.
 * @param {Object} settings - Объект с настройками приложения.
 */
function initializeGame(settings) {
  const cookiesGame = new CookieClickerManager(settings);
  cookiesGame.start();
};

document.addEventListener('DOMContentLoaded', initializeGame(cookieGameSetting));