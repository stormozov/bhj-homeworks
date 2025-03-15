/**
 * Инициализация приложения опроса.
 * @param {Object} params - Параметры приложения.
 */
async function initializePoll(params) {
  const poll = await getPollFromAPI(params.APIUrl);
  addPoll(params.poll, poll.data);
  manageAnswerChoice(params, poll);
}

/**
 * Запросить данные с API.
 * 
 * @param {string} url - Адрес API.
 * @returns {Promise} - Промис с данными.
 * @throws {Error} - Если код ответа не 200.
 */
function getPollFromAPI(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.send();

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Ошибка при загрузке данных по API: ' + xhr.status));
      }
    };
  });
}

/**
 * Отправить результат опроса на API.
 * 
 * @param {string} url - Адрес API, на который нужно отправить результат.
 * @param {Object} pollData - Данные опроса, полученные с API.
 * @param {number} resultID - Идентификатор выбранного ответа.
 * 
 * @returns {Promise} - Промис с данными, полученными от API.
 * @throws {Error} - Если код ответа не 201.
 */
function postPollResultToAPI(url, pollData, resultID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(`vote=${pollData.id}&answer=${resultID}`);

    xhr.onload = function () {
      if (xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Ошибка при отправке данных по API (method: POST): ${xhr.status}`));
      }
    };
  });
}

/**
 * Добавить опрос на страницу.
 * 
 * @param {Object} pollParams - Параметры для создания элемента ответа на опрос.
 * @param {Object} pollData - Данные опроса, полученные с API.
 */
function addPoll(pollParams, pollData) {
  const { title, answers } = pollData;

  setTittle(pollParams.title, title);

  answers.sort(() => Math.random() - 0.5);

  answers.forEach(answer => {
    addElementToDOM(pollParams.answers, createAnswerElement(pollParams, answer));
  });
}

/**
 * Управление выбором ответа.
 * @param {Object} params - Параметры приложения.
 * @param {Object} pollData - Данные опроса, полученные с API.
 */
async function manageAnswerChoice(params, pollData) {
  const answerButtons = document.querySelectorAll(params.poll.button);
  answerButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      handleAnswerClick(event, params, pollData, answerButtons)
    });
  });
}

/**
 * Установить заголовок опроса.
 * @param {string} titleSelector - Селектор заголовка опроса, который нужно изменить.
 * @param {string} title - Текст заголовка опроса, который нужно установить.
 */
function setTittle(titleSelector, title) {
  document.querySelector(titleSelector).textContent = title;
}

/**
 * Создать элемент ответа.
 * 
 * @param {Object} pollParams - Параметры для создания элемента ответа на опрос.
 * @param {string} answerVariant - Текст варианта ответа.
 * 
 * @returns {Element} - Элемент ответа.
 */
function createAnswerElement(pollParams, answerVariant) {
  const answerElement = document.createElement('li');
  const answerButton = document.createElement('button');

  answerElement.classList.add(pollParams.answer.replace('.', ''));
  answerButton.classList.add(pollParams.button.replace('.', ''));
  answerButton.textContent = answerVariant;

  answerElement.appendChild(answerButton);

  return answerElement;
}

/**
 * Создать элемент результата опроса.
 * 
 * @param {string} selector - Селектор для класса элемента результата опроса.
 * @param {Object} answerData - Данные ответа.
 * 
 * @returns {Element} - Элемент результата опроса.
 */
function createResultPollElement(selector, answerData) {
  const resultElement = document.createElement('li');
  const resultVotes = document.createElement('span');

  resultElement.classList.add(selector.replace('.', ''));
  resultElement.textContent = answerData.answer;

  resultVotes.textContent = `${answerData.votes}%`;

  resultElement.appendChild(resultVotes);

  return resultElement;
}

/**
 * Добавить элемент на страницу.
 * 
 * @param {string} listSelector - Селектор для списка элементов, 
 * в который нужно добавить элемент.
 * @param {Element} element - Элемент, который нужно добавить.
 */
function addElementToDOM(listSelector, element) {
  const answersList = document.querySelector(listSelector);
  answersList.appendChild(element);
}

/**
 * Обработка клика по кнопке ответа.
 * 
 * @param {Event} event - Объект события.
 * @param {Object} params - Параметры приложения.
 * @param {Object} pollData - Данные опроса, полученные с API.
 * @param {NodeList} answerButtons - Список кнопок ответа.
 * 
 * @throws {Error} - Если произошла ошибка при обработке ответа на опрос.
 */
async function handleAnswerClick(event, params, pollData, answerButtons) {
  const answerIndex = [...answerButtons].indexOf(event.target);

  try {
    const dataResults = await postPollResultToAPI(params.APIUrl, pollData, answerIndex);
    displayThankYouMessage(params.thankYouMessage, pollData.data.title, event.target.textContent);
    updatePollResults(params.poll, pollData.data, dataResults.stat);
    startCountdown(params);
  } catch (error) {
    console.error('Ошибка при обработке ответа на опрос:', error);
  }
}

/**
 * Отобразить сообщение благодарности за ответ.
 * 
 * @param {Object} thankYouMessage - Сообщение благодарности.
 * @param {Object} pollTitle - Заголовок опроса.
 * @param {string} answerChoice - Вариант ответа, который выбрал пользователь.
 */
function displayThankYouMessage(thankYouMessage, pollTitle, answerChoice) {
  alert(`${thankYouMessage}\nОпрос: ${pollTitle}\nОтвет: ${answerChoice}`);
}

/**
 * Обновить результаты опроса.
 * 
 * @param {Object} pollParams - Параметры приложения для обновления результатов опроса.
 * @param {Object} pollData - Данные опроса, полученные с API.
 * @param {Object} dataResults - Результаты опроса, полученные с API.
 */
function updatePollResults(pollParams, pollData, dataResults) {
  clearPoll(pollParams);
  toggleListActiveState(pollParams.answers, pollParams.answersActive);
  setTittle(pollParams.title, `Результат опроса «${pollData.title}»`);

  dataResults.forEach((answer) => {
    addElementToDOM(pollParams.answers, createResultPollElement(pollParams.answer, answer));
  });
}

/**
 * Начать отсчет времени до следующего опроса с остановкой отсчета после окончания времени.
 * @param {Object} params - Параметры приложения.
 */
function startCountdown(params) {
  const countdownContainer = document.createElement('div');
  countdownContainer.classList.add('card', params.countdown.container.replace('.', ''));
  document.querySelector(params.mainContainer).appendChild(countdownContainer);

  let timeRemaining = params.countdown.duration;

  const seconds = timeRemaining % 60;
  countdownContainer.textContent = `Следующий опрос начнется через ${seconds} секунд.`;

  const interval = setInterval(() => {
    timeRemaining--;

    const seconds = timeRemaining % 60;
    countdownContainer.textContent = `Следующий опрос начнется через ${seconds} секунд.`;

    if (timeRemaining <= 0) stopCountdown(params, interval, countdownContainer);
  }, 1000);
}

/**
 * Остановить отсчет времени до следующего опроса и начать новый опрос.
 * 
 * @param {Object} params - Параметры приложения.
 * @param {number} interval - Интервал, который необходимо остановить.
 * @param {Element} countdownContainer - Контейнер, в котором отображается 
 * время до следующего опроса.
 */
function stopCountdown(params, interval, countdownContainer) {
  clearInterval(interval);
  clearPoll(params.poll, true);
  toggleListActiveState(params.poll.answers, params.poll.answersActive);
  countdownContainer.remove();
  initializePoll(params);
}

/**
 * Переключить активный класс списка ответов.
 * @param {string} selector - Селектор списка ответов.
 * @param {string} activeClass - Активный класс списка ответов.
 */
function toggleListActiveState(selector, activeClass) {
  const answersList = document.querySelector(selector);
  const containsActiveClass = answersList.classList.contains(`${activeClass.replace('.', '')}`);
  answersList.classList.toggle(`${activeClass.replace('.', '')}`, containsActiveClass ? false : true);
}

/**
 * Очистить опрос.
 * @param {Object} pollParams - Параметры приложения.
 * @param {boolean} all - Флаг, указывающий, нужно ли очистить все элементы.
 * true - очищает заголовок и список ответов, false - очищает только список ответов.
 */
function clearPoll(pollParams, all = false) {
  document.querySelector(pollParams.answers).innerHTML = '';
  if (all) document.querySelector(pollParams.title).textContent = '';
}

initializePoll({
  APIUrl: 'https://students.netoservices.ru/nestjs-backend/poll',
  mainContainer: '.content',
  poll: {
    title: '.poll__title',
    answers: '.poll__answers',
    answersActive: '.poll__answers--active',
    answer: '.poll__answer',
    button: '.poll__button',
  },
  countdown: {
    container: '.card--countdown',
    duration: 10,
  },
  thankYouMessage: 'Спасибо, ваш голос засчитан!',
});
