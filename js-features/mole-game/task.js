/**
 * Объект настроек игры "Убей кротов".
 */
const moleGameSetting = {
  // Настройки DOM-элементов
  dom: {
    deadMolesId: 'dead',
    lostMolesId: 'lost',
    holeHasMoleClass: 'hole--has-mole',
    holeClass: 'hole',
  },

  // Настройки игровой логики
  game: {
    pointsForWin: 10,
    pointsForLose: 5,
  },

  // Настройки сообщений
  messages: {
    win: 'Вы победили!',
    lose: 'Кроты оказались проворнее. Вы проиграли. Попробуйте еще раз.',
  },
};

class MoleGame {

  /**
   * Создает экземпляр класса `MoleGame`.
   * @param {Object} settings - Объект с настройками приложения.
   */
  constructor(settings) {
    // Сохранение настроек приложения
    this.settings = settings;

    // Сохранение DOM-элементов для вывода результатов статистики игры игрока
    this.deadMolesCountOutput = this._getDOMElementBySettingKey('deadMolesId', 'dom');
    this.lostMolesCountOutput = this._getDOMElementBySettingKey('lostMolesId', 'dom');

    // Сохранение класса для обозначения наличия крота в яме
    this.holeHasMoleClass = this._getSettingsValue('holeHasMoleClass', 'dom');

    // Хранение массива DOM-элементов кротовых ям
    this.holes = this._getDOMElementBySettingKey('holeClass', 'dom', 'class', true);

    // Статистика результата игры игрока
    this.deadMolesCount = 0;
    this.lostMolesCount = 0;
  }

  /**
   * Запускает игру.
   */
  start() {
    this._resetGame();
    this._setupEventListeners();
  }

  /**
   * Завершает игру.
   * @private
   */
  _endGame() {
    const pointsForWin = this._getSettingsValue('pointsForWin', 'game');
    const pointsForLose = this._getSettingsValue('pointsForLose', 'game');
    let resultMessage = null;

    if (pointsForWin !== null && this.deadMolesCount === pointsForWin) {
      resultMessage = this._getSettingsValue('win', 'messages');
    } else if (pointsForLose !== null && this.lostMolesCount === pointsForLose) {
      resultMessage = this._getSettingsValue('lose', 'messages');
    }

    resultMessage && this._showGameResult(resultMessage);
  }

  /**
   * Показывает результат игры и сбрасывает её.
   * @param {string} message - Сообщение для отображения.
   * @private
   */
  _showGameResult(message) {
    setTimeout(() => {
      alert(message);
      this._resetGame();
    }, 100);
  }

  /**
   * Сбрасывает статистику игры.
   */
  _resetGame() {
    this.deadMolesCount = 0;
    this.lostMolesCount = 0;
    this._updateScore();
  }

  /**
 * Получает значение настроек по ключу и группе.
 * 
 * @param {string} key - Ключ настроек.
 * @param {string} group - Группа настроек (например, 'dom', 'game', 'messages'). По умолчанию `null`.
 * 
 * @throws {Error} Если переданный ключ или группа не являются строками.
 * 
 * @returns {string | number | null} Значение настроек или `null` в случае ошибки.
 * 
 * @private
 */
  _getSettingsValue(key, group = null) {
    if (typeof key !== 'string' || typeof group !== 'string') {
      throw new Error(`Переданный ключ и группа в метод ${this._getSettingsValue.name} должны быть строками.`);
    }

    if (group && this.settings[group]) {
      return this.settings[group][key] || null;
    }
    
    return this.settings[key] || null;
  }

  /**
   * Получает DOM-элемент по ключу настроек.
   * 
   * @param {string} key - Ключ настроек.
   * @param {string} type - Тип элемента (id/class).
   * @param {boolean} all - Получать все элементы (true), или только первый (false).
   * 
   * @returns {object | array | null} DOM-элемент или массив DOM-элементов или `null` в случае ошибки.
   * 
   * @private
   */
  _getDOMElementBySettingKey(key, group = null, type = 'id', all = false) {
    if (typeof key !== 'string' || typeof type !== 'string') {
      throw new Error(`Переданный ключ и тип элемента в метод ${this._getDOMElementBySettingKey.name} должны быть строками.`);
    }
    if (!['id', 'class'].includes(type)) {
      throw new Error(`Переданный тип элемента в метод ${this._getDOMElementBySettingKey.name} должен быть 'id' или 'class'.`);
    }
    if (typeof all !== 'boolean') {
      throw new Error(`Переданный параметр all в метод ${this._getDOMElementBySettingKey.name} должен быть булевым.`);
    }

    const value = this._getSettingsValue(key, group);
    let selector;

    switch (type) {
      case 'id':
        selector = `#${value}`;
        break;
      case 'class':
        selector = `.${value}`;
        break;
      default:
        return null;
    }

    return all ? document.querySelectorAll(selector) : document.querySelector(selector);
  }

  /**
   * Настройка обработчиков событий.
   * @private
   */
  _setupEventListeners() {
    this.holes.forEach(hole => hole.addEventListener('click', () => this._whackMole(hole)));
  }

  /**
   * Обрабатывает клик по кроту.
   * 
   * Метод проверяет, находится ли крот в выбранной яме. Если да, увеличивает счетчик убитых кротов.
   * Если нет, увеличивает счетчик промахов.
   * 
   * @param {Object} hole - DOM-элемент ямы.
   * 
   * @private
   */
  _whackMole(hole) {
    if (hole.classList.contains(this.holeHasMoleClass)) {
      hole.classList.remove(this.holeHasMoleClass);
      this.deadMolesCount++;
    } else {
      this.lostMolesCount++;
    }

    this._updateScore();
    this._endGame();
  }

  /**
   * Обновляет счет игрока.
   * @private
   */
  _updateScore() {
    this.deadMolesCountOutput.textContent = this.deadMolesCount;
    this.lostMolesCountOutput.textContent = this.lostMolesCount;
  }
};

/**
 * Инициализирует приложение.
 * @param {Object} settings - Объект с настройками приложения.
 */
function initializeGame(settings) {
  const moleGame = new MoleGame(settings);
  moleGame.start();
};

document.addEventListener('DOMContentLoaded', initializeGame(moleGameSetting));