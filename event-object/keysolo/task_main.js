const gameSettings = {
  container: '#game',
  words: [
    'bob',
    'awesome',
    'нетология',
    'привет',
    'кот',
    'rock',
    'youtube',
    'попкорн',
    'кино',
    'любовь',
    'javascript',
    'я люблю kitkat'
  ],
};
class Game {

  #settings;
  #container;
  #wordElement;
  #winsElement;
  #lossElement;
  #timerElement;
  #timeLeft;
  #timerId;
  #currentSymbol;
  #keyboardRegexPattern = /[a-zA-Zа-яА-ЯёЁ\s\-']/;

  /**
   * Создает экземпляр класса Game.
   * @param {Object} settings Объект, хранящий настройки программы.
   */
  constructor(settings) {
    // Настройки игры
    this.#settings = settings;

    // Хранение HTML-элементов
    this.#container = document.querySelector(this.#settings.container);
    this.#wordElement = this.#container.querySelector('.word');
    this.#winsElement = this.#container.querySelector('.status__wins');
    this.#lossElement = this.#container.querySelector('.status__loss');
    this.#timerElement = this.#container.querySelector('.status__timer');

    // Предыдущее слово, которое было на экране
    this.previousWord = '';

    // Сброс прогресса игры
    this.#reset();

    // Регистрация событий
    this.#registerEvents();
  }

  /**
   * Сброс игры
   * @private
   */
  #reset() {
    this.#winsElement.textContent = 0;
    this.#lossElement.textContent = 0;
    this.#stopTimer();
    this.#setNewWord();
  }

  /**
   * Регистрация событий
   * @private
   */
  #registerEvents() {
    this.#keyboardInputEvent();
  }

  /**
   * Событие прослушивания ввода с клавиатуры
   * @private
   */
  #keyboardInputEvent() {
    window.addEventListener('keydown', (e) => {
      // Дополнительная проверка на длину и на то, чтобы введенный символ был буквой на английском или русском
      if (e.key.length === 1 && e.key.match(this.#keyboardRegexPattern)) {
        const condition = e.key.toLowerCase() === this.#currentSymbol.textContent.toLowerCase();
        condition ? this.#success() : this.#fail();
      }
    });
  }

  /**
   * Успешный ввод символа
   * @private
   */
  #success() {
    if (this.#currentSymbol.classList.contains('symbol_current')) {
      this.#currentSymbol.classList.remove('symbol_current');
    }

    this.#currentSymbol.classList.add('symbol_correct');
    this.#currentSymbol = this.#currentSymbol.nextElementSibling;

    if (this.#currentSymbol !== null) {
      this.#currentSymbol.classList.add('symbol_current');
      return;
    }

    if (++this.#winsElement.textContent === 10) {
      alert('Победа!');
      this.#reset();
    }

    this.#setNewWord();
  }

  /**
   * Неудачный ввод символа
   * @private
   */
  #fail() {
    if (++this.#lossElement.textContent === 5) {
      alert('Вы проиграли!');
      this.#reset();
    } else {
      this.#setNewWord();
    }
  }

  /**
   * Установка нового слова
   * @private
   */
  #setNewWord() {
    let word;
    do { word = this.#getWord(); } 
    while (word === this.previousWord);

    this.previousWord = word;
    this.#renderWord(word);
    this.#startTimer(word.length);
  }

  /**
   * Получение случайного слова
   * @private
   */
  #getWord() {
    const words = this.#settings.words;
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }

  /**
   * Рендер слова
   * @private
   */
  #renderWord(word) {
    const html = [...word]
      .map((s, i) => `<span class="symbol ${i === 0 ? 'symbol_current' : ''}">${s}</span>`)
      .join('');

    this.#wordElement.innerHTML = html;
    this.#currentSymbol = this.#wordElement.querySelector('.symbol_current');
  }

  /**
   * Запуск таймера
   * @private
   */
  #startTimer(seconds) {
    this.#stopTimer();
    this.#timeLeft = seconds;
    this.#timerElement.textContent = this.#timeLeft;

    this.#timerId = setInterval(() => {
      this.#timeLeft--;
      this.#timerElement.textContent = this.#timeLeft;

      if (this.#timeLeft <= 0) {
        clearInterval(this.#timerId);
        this.#fail();
      }
    }, 1000);
  }

  /**
   * Остановка таймера
   * @private
   */
  #stopTimer() {
    clearInterval(this.#timerId);
    this.#timerElement.textContent = '';
  }
}

/**
 * Инициализация игры
 */
new Game(gameSettings);