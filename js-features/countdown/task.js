/**
 * Настройки таймера.
 */
const timerSettings = {
  'timerElementId': 'timer',
  'message': 'Вы победили в конкурсе!',
  'interval': 1000,
  // Флаг для форматирования времени. Для отключения устанавливаем null или false.
  'formatTime': null,
  // URL для загрузки файла при завершении таймера. Для отключения оставляем пустым.
  'downloadUrl': 'https://netology.ru/_next/static/media/slide1.06c5386d.webp'
};

/**
 * Класс для преобразования времени.
 * Предоставляет методы для конвертации времени в различные форматы.
 */
class TimeConverter {

  /**
   * Преобразует количество секунд в формат HH:MM:SS.
   * @param {number} seconds - Количество секунд.
   * @returns {string} Строка времени в формате HH:MM:SS.
   */
  static secondsToHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].join(':');
  };
};

/**
 * Класс для загрузки файлов.
 */
class FileDownloader {

  /**
   * Загружает файл по указанному URL.
   * @param {string} url - URL файла для скачивания.
   * @param {string} [filename] - Имя файла (необязательно). Если не указано, используется имя файла из URL.
   */
  downloadFile(url, filename = '') {
    if (typeof url !== 'string') {
      alert('Некорректная ссылка для загрузки файла.');
      return;
    };

    const createdDOMElement = this._constructDOMElement(url, filename);
    this._tempCreateDOMObject(createdDOMElement);
  };

  /**
   * Создает DOM-элемент для загрузки файла в новом окне браузера.
   * @param {string} url - URL файла для скачивания.
   * @param {string} [filename] - Имя файла (необязательно). Если не указано, используется имя файла из URL.
   * @returns {HTMLAnchorElement} Созданный DOM-элемент.
   */
  _constructDOMElement(url, filename = '') {
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';

    return link;
  }

  /**
   * Создает временный DOM-объект, нажимает на него, а после удаляет из DOM-дерева.
   * @param {HTMLAnchorElement} object - DOM-элемент для загрузки файла.
   */
  _tempCreateDOMObject(object) {
    this._addElementToDOM(object);
    object.click();
    this._removeElementFromDOM(object);
  }

  /**
   * Добавляет DOM-объект в DOM-дерево.
   */
  _addElementToDOM(object, to) {
    const toAppend = to || document.body;
    toAppend.appendChild(object);
  }

  /**
   * Удаляет DOM-объект из DOM-дерева.
   */
  _removeElementFromDOM(object) {
    object.remove();
  }
};

/**
 * Класс для создания и управления таймером обратного отсчета.
 */
class CountdownTimer {

  /**
   * Создает экземпляр таймера.
   * @param {Object} settings - Объект с настройками таймера.
   */
  constructor(settings) {
    // Сохраняем настройки приложения
    this.settings = settings;

    // Инициализируем вспомогательные переменные
    this.timerElement = document.getElementById(this._getTimerSettingsValue('timerElementId'));
    this.message = this._getTimerSettingsValue('message');
    this.interval = this._getTimerSettingsValue('interval') || 1000;
    this.formatTime = this._getTimerSettingsValue('formatTime') || false;
    this.totalSeconds = +this.timerElement.textContent;
    this.downloadUrl = this._getTimerSettingsValue('downloadUrl');

    // Инициализация вспомогательных классов
    this.fileDownloaderHandler = new FileDownloader();

    // Id элемента для загрузки файла
    this.timerId = null;
  };

  /**
   * Запускает таймер.
   */
  start() {
    this.timerId = setInterval(() => this.updateTimer(), this.interval);
  };

  /**
   * Обновляет значение таймера каждую секунду.
   * Если таймер достигает 0, он останавливается и показывает сообщение.
   */
  updateTimer() {
    if (this.totalSeconds === 0) {
      this.stop();
      alert(this.message);

      if (this.downloadUrl) {
        this.fileDownloaderHandler.downloadFile(this.downloadUrl);
      };

      return;
    };

    // Обновляем текст элемента
    this.timerElement.textContent = this.formatTime
      ? TimeConverter.secondsToHHMMSS(this.totalSeconds)
      : this.totalSeconds;

    this.totalSeconds -= 1;
  };

  /**
   * Останавливает таймер.
   */
  stop() {
    clearInterval(this.timerId);
  };

  /**
   * Получает значение настроек таймера по переданному ключу.
   * @param {string} settingName - Ключ настроек таймера.
   * @returns {string | null} Значение настройки или `null` в случае ошибки.
   */
  _getTimerSettingsValue(settingName) {
    return this.settings[settingName] || null;
  }
};

/**
 * Инициализирует приложение таймера.
 * @param {Object} settings - Объект с настройками приложения.
 */
function initializeTimer(settings) {
  const timer = new CountdownTimer(settings);
  timer.start();
};

document.addEventListener('DOMContentLoaded', initializeTimer(timerSettings));