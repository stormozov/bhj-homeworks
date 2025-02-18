class CookieClickerManager {

  /**
   * Создает экземпляр класса `CookieClickerManagerManager`.
   * @param {HTMLElement} clicker - Элемент, по которому совершают клик мышью.
   * @param {HTMLElement} clickerCounter - Элемент для отображения счетчика кликов.
   * @param {HTMLElement} clickSpeedCounter - Элемент для отображения скорости клика.
   * @param {number} [incrementWidth=25] - На сколько пикселей увеличивать ширину элемента при клике.
   * 
   * @throws {Error} Если `clicker`, `clickerCounter` или `clickSpeedCounter` не переданы.
   * @throws {TypeError} Если `clicker`, `clickerCounter` или `clickSpeedCounter` не являются `HTMLElement`.
   * @throws {RangeError} Если `incrementWidth` не является положительным числом.
   */
  constructor(clicker, clickerCounter, clickSpeedCounter, incrementWidth = 25) {
    if (!clicker || !clickerCounter || !clickSpeedCounter) {
      throw new Error('Аргументы класса CookieClickerManager: clicker, clickerCounter и clickSpeedCounter обязательны.');
    };

    if (!this._isHTMLElement(clicker, clickerCounter, clickSpeedCounter)) {
      throw new TypeError('Аргументы clicker, clickerCounter и clickSpeedCounter класса CookieClickerManager должны быть DOM-элементом.');
    };
    if (typeof incrementWidth !== 'number' || incrementWidth <= 0) {
      throw new RangeError('Аргумент incrementWidth класса CookieClickerManager должен быть положительным числом.');
    };

    this.clicker = clicker;
    this.clickerCounter = clickerCounter;
    this.clickSpeedCounter = clickSpeedCounter;
    this.clicksCount = 0;
    this.incrementWidth = incrementWidth;
    this.originalWidth = this.clicker.offsetWidth;
    this.handleClickBound = this._handleClick.bind(this);
    this.isRunning = false;
    this.lastClickTime = null;
  };

  /**
   * Запускает отслеживание кликов.
   */
  start() {
    if (this.isRunning) {
      console.warn('CookieClickerManager уже запущен.');
      return;
    };
    this.clicker.addEventListener('click', this.handleClickBound);
    this.isRunning = true;
  };

  /**
   * Останавливает отслеживание кликов.
   */
  stop() {
    if (!this.isRunning) {
      console.warn('CookieClickerManager уже остановлен.');
      return;
    };
    this.clicker.removeEventListener('click', this.handleClickBound);
    this.isRunning = false;
  };

  /**
   * Сбрасывает счетчик кликов и состояние анимации.
   */
  reset() {
    this._setClicksCount(0);
    this._resetClickSpeed();
    this._resetWidth();
  };

  /**
   * Обрабатывает клик по элементу.
   * @private
   */
  _handleClick() {
    this._incrementClicksCount();
    this._animateClick();
    this._updateClickSpeed();
  };

  /**
   * Добавляет анимацию элемента при клике.
   * @private
   */
  _animateClick() {
    this.clicker.style.width = `${this.originalWidth + this.incrementWidth}px`;
    setTimeout(() => { this.clicker.style.width = `${this.originalWidth}px`; }, 100);
  };

  /**
   * Устанавливает значение счетчика кликов и устанавливает его в DOM.
   * @private
   */
  _setClicksCount(value) {
    this.clicksCount = value;
    this._updateClicksCountDisplay();
  };

  /**
   * Увеличивает значение счетчика кликов и устанавливает его в DOM.
   * @private
   */
  _incrementClicksCount() {
    this.clicksCount += 1;
    this._updateClicksCountDisplay();
  }

  /**
   * Обновляет значение счетчика кликов в DOM.
   * @private
   */
  _updateClicksCountDisplay() {
    this.clickerCounter.textContent = this.clicksCount;
  };

  /**
   * Сбрасывает значение скорости клика.
   * @private
   */
  _resetClickSpeed() {
    this.clickSpeedCounter.textContent = '0 кликов в секунду';
    this.lastClickTime = null;
  };

  /**
   * Сбрасывает ширину элемента в DOM.
   * @private
   */
  _resetWidth() {
    this.clicker.style.width = `${this.originalWidth}px`;
  }

  /**
   * Обновляет значение скорости клика.
   * @private
   */
  _updateClickSpeed() {
    const currentTime = new Date().getTime();

    if (this.lastClickTime !== null) {
      const timeDiff = (currentTime - this.lastClickTime) / 1000;
      const clickSpeed = 1 / timeDiff;
      this.clickSpeedCounter.textContent = `${clickSpeed.toFixed(2)} кликов в секунду`;
    } else {
      this.clickSpeedCounter.textContent = '0 кликов в секунду';
    }

    this.lastClickTime = currentTime;
  };

  /**
   * Проверяет, являются ли переданные элементы DOM-элементами.
   * @private
   */
  _isHTMLElement(...elements) {
    return elements.every(el => el instanceof HTMLElement);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const clicker = document.getElementById('cookie');
  const clickerCounter = document.getElementById('clicker__counter');
  const clickerSpeedCounter = document.getElementById('clicker__speed');
  const resetCounterBtn = document.getElementById('reset-counter-btn');

  const cookiesGame = new CookieClickerManager(clicker, clickerCounter, clickerSpeedCounter);
  cookiesGame.start();

  resetCounterBtn.addEventListener('click', () => { cookiesGame.reset(); });
});