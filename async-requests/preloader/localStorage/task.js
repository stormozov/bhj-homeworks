/*
  Поток выполнения:
  graph TD
    A[Start] --> B[Загрузить кэш]
    A --> C[Запустить фоновое обновление]
    B --> D{Есть кэш?}
    D -->|Да| E[Показать кэш]
    D -->|Нет| F[Показать прелоадер]
    C --> G{Успех?}
    G -->|Да| H[Обновить интерфейс]
    G -->|Нет| I[Обработать ошибку]

  Обработка состояний:
  — При первом посещении: прелоадер → загрузка → анимированное появление
  — При повторном: мгновенный показ кэша → фоновое обновление
  — При ошибке: показ кэша или сообщения об ошибке
*/

/**
 * Инициализация программы по загрузке курсов валют на страницу по API.
 * @param {Object} params - Параметры приложения.
 */
async function initializePreloader(params) {
  // Загрузка кэшированных данных (если есть)
  await loadCachedData(params);

  // Фоновое обновление данных с API
  fetchAndUpdateData(params).catch(error => {
    console.error('Ошибка фонового обновления:', error);
  });
}

/**
 * Загрузка кэшированных данных.
 * @param {Object} params - Параметры приложения.
 */
async function loadCachedData(params) {
  try {
    const cachedData = localStorage.getItem('cachedCurrencyData');
    if (!cachedData) return;

    const parsedData = JSON.parse(cachedData);
    validateExchangeRateResponse(parsedData);

    addCourseItemToList(params.output, parsedData.response.Valute, false);
    hidePreloader(params.loader);
  } catch (error) {
    console.error('Ошибка загрузки из кэша:', error);
    localStorage.removeItem('cachedCurrencyData');
  }
}

/**
 * Фоновое обновление данных с API.
 * @param {Object} params - Параметры приложения.
 */
async function fetchAndUpdateData(params) {
  try {
    const data = await getDataFromAPI(params.APIUrl);
    validateExchangeRateResponse(data);

    localStorage.setItem('cachedCurrencyData', JSON.stringify(data));
    updateUIWithFreshData(params, data);
  } catch (error) {
    handleDataError(error, params);
  }
}

/**
 * Обновить пользовательский интерфейс с новыми данными.
 * @param {Object} params - Параметры приложения.
 * @param {Object} data - Данные, полученные с API.
 */
function updateUIWithFreshData(params, data) {
  const list = document.querySelector(params.output.list);
  list.innerHTML = '';
  addCourseItemToList(params.output, data.response.Valute, true);
  hidePreloader(params.loader);
}

/**
 * Запросить данные с API.
 * 
 * @param {string} url - Адрес API.
 * @returns {Promise} - Промис с данными.
 * @throws {Error} - Если код ответа не 200.
 */
function getDataFromAPI(url) {
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
    }
  });
}

/**
 * Добавить полученный список курсов валют в список на странице.
 * 
 * @param {Object} outputParams - Параметры вывода курсов валют на страницу.
 * @param {Object} data - Данные, полученные с API.
 * @param {boolean} useDelay - Флаг использования задержки.
 */
function addCourseItemToList(outputParams, data, useDelay = true) {
  const list = document.querySelector(outputParams.list);
  list.innerHTML = '';

  const dataKeys = Object.keys(data);

  dataKeys.forEach((key, index) => {
    const addItem = () => {
      const item = createCourseItem(outputParams.item, data, key);
      list.appendChild(item);
    };

    useDelay ? setTimeout(addItem, index * 100) : addItem();
  });
}

/**
 * Создать HTML-элемент курса валюты.
 * 
 * @param {Object} outputParams - Параметры вывода курсов валют на страницу.
 * @param {Object} data - Данные, полученные с API.
 * @param {string} itemKey - Ключ объекта data, содержащий данные о курсе валюты.
 * 
 * @return {Element} HTML-элемент курса валюты.
 */
function createCourseItem(outputParams, data, itemKey) {
  const item = document.createElement('li');
  item.classList.add(outputParams.parent.replace('.', ''));

  const elements = [
    { className: outputParams.code.replace('.', ''), text: data[itemKey].CharCode },
    { className: outputParams.value.replace('.', ''), text: data[itemKey].Value },
    { className: outputParams.currency.replace('.', ''), text: data[itemKey].Name }
  ];

  elements.forEach(({ className, text }) => {
    const span = document.createElement('span');
    span.classList.add(className);
    span.textContent = text;
    item.appendChild(span);
  });

  return item;
}

/**
 * Скрыть прелоадер.
 * 
 * @param {Object} params - Параметры прелоадера.
 * @param {string} params.element - Селектор элемента, который нужно скрыть.
 * @param {string} params.activeClass - Активный класс элемента.
 */
function hidePreloader({ element, activeClass }) {
  document.querySelector(element).classList.remove(activeClass);
}

/**
 * Обработать ошибку получения данных.
 * @param {Error} error - Ошибка.
 * @param {Object} params - Параметры приложения.
 */
function handleDataError(error, params) {
  console.error('Ошибка получения данных:', error);
  if (!localStorage.getItem('cachedCurrencyData')) {
    const list = document.querySelector(params.output.list);
    list.innerHTML = `<li>Не удалось загрузить данные</li>`;
    hidePreloader(params.loader);
  }
}

/**
 * Проверить корректность ответа API.
 * @param {Object} data - Данные, полученные с API.
 * @throws {Error} - Если данные некорректны.
 */
function validateExchangeRateResponse(data) {
  const valuteObject = data.response.Valute;

  if (!data || !data.response || !valuteObject) {
    throw new Error('Некорректные данные API');
  }

  if (Object.keys(valuteObject).length === 0) {
    throw new Error('Нет данных в API в объекте Valute');
  }

  if (typeof valuteObject !== 'object') {
    throw new Error('Некорректный тип данных в объекте Valute');
  }

  for (const key in valuteObject) {
    const currencyData = valuteObject[key];
    if (
      !currencyData.CharCode
      || !currencyData.Name
      || typeof currencyData.Value !== 'number'
    ) {
      throw new Error(`Недостаточно данных для валюты: ${key}`);
    }
  }
}

initializePreloader({
  APIUrl: 'https://students.netoservices.ru/nestjs-backend/slow-get-courses',
  loader: {
    element: '#loader',
    activeClass: 'loader--active',
  },
  output: {
    list: '.courses__list',
    item: {
      parent: '.courses__item',
      code: '.courses__item-code',
      value: '.courses__item-value',
      currency: '.courses__item-currency',
    }
  }
});
