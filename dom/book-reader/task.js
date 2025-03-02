/**
 * Инициализация интерфейса читалки
 * 
 * @param {Object} params - Параметры.
 * @param {string} params.bookReaderSelector - Селектор книги. Родительский элемент книги.
 * @param {string} params.controllerTagName - Тег контроллеров. Передавать нужно именно имя тега, например 'a'.
 * Передача класса или ID не поддерживается.
 * @param {Object} params.controlConfig - Конфигурация контроллеров.
 */
function initializeBookReaderUI({ bookReaderSelector, controllerTagName, controlConfig }) {
  validateControlConfigHandler(bookReaderSelector, controllerTagName, controlConfig);

  Object.entries(controlConfig).forEach(([selector, config]) => {
    const controls = document.querySelectorAll(selector);
    controls.forEach((control) => {
      control.addEventListener('click', (event) => {
        onControlButtonClick(event, controllerTagName, bookReaderSelector, config, control);
      });
    });
  });
}

/**
 * Обработка нажатия на контроллер.
 * 
 * @param {Event} event - Объект события.
 * @param {string} controllerTagName - Тег контроллеров. Передавать нужно именно имя тега, например 'a'.
 * Передача класса или ID не поддерживается.
 * @param {string} bookReaderSelector - Селектор книги. Родительский элемент книги.
 * @param {Object} config - Конфигурация контроллера.
 * @param {Object} control - Элемент контроллера.
 */
function onControlButtonClick(event, controllerTagName, bookReaderSelector, config, control) {
  if (event.target.tagName === controllerTagName.toUpperCase()) {
    event.preventDefault();
    const book = document.querySelector(bookReaderSelector);

    // Удаляем старые активные классы у всех контроллеров
    removeActiveClassFromControlBtns(control, controllerTagName, config.activeClass);

    // Удаляем старые классы у книги
    removeClassesFromBook(book, config.removeClasses);

    // Получаем значение из нажатой кнопки и добавляем новый класс книге
    addClassToBook(book, bookReaderSelector, config.classPrefix, event.target.dataset[config.dataAttribute]);

    // Добавляем активный класс к нажатой кнопке
    event.target.classList.add(config.activeClass);
  }
}

/**
 * Удаление классов у книги.
 * 
 * @param {HTMLElement} book - Элемент книги.
 * @param {Array} removeClasses - Массив классов, которые нужно удалить.
 */
function removeClassesFromBook(book, removeClasses) {
  removeClasses.forEach(cls => book.classList.remove(cls));
}

/**
 * Добавление класса к книге.
 * 
 * @param {HTMLElement} book - Элемент книги.
 * @param {string} bookReaderSelector - Селектор книги. Родительский элемент книги.
 * @param {string} classPrefix - Префикс класса, который будет добавлен для элемента книги.
 * @param {string} value - Значение, которое будет добавлено после префикса.
 */
function addClassToBook(book, bookReaderSelector, classPrefix, value) {
  if (value) book.classList.add(`${bookReaderSelector.replace('.', '')}--${classPrefix}-${value}`);
}

/**
 * Удаление активного класса у контроллеров.
 * 
 * @param {HTMLElement} control - Элемент контроллера.
 * @param {string} controllerTagName - Тег контроллеров. Передавать нужно именно имя тега, например 'a'.
 * Передача класса или ID не поддерживается.
 * @param {string} activeClass - Класс активного контроллера.
 */
function removeActiveClassFromControlBtns(control, controllerTagName, activeClass) {
  const buttons = control.querySelectorAll(controllerTagName);
  buttons.forEach((button) => button.classList.remove(activeClass));
}

/**
 * Обработчик валидации конфигурации контроллеров.
 * 
 * @param {string} bookReaderSelector - Селектор книги. Родительский элемент книги.
 * @param {string} controllerTagName - Тег контроллеров. Передавать нужно именно имя тега, например 'a'.
 * Передача класса или ID не поддерживается.
 * @param {Object} controlConfig - Конфигурация контроллеров.
 */
function validateControlConfigHandler(bookReaderSelector, controllerTagName, controlConfig) {
  const validationResults = [
    validateBookReaderSelector(bookReaderSelector),
    validateControllerTagName(controllerTagName),
    validateControlConfig(controlConfig),
  ];

  for (const result of validationResults) {
    if (!result.isValid) throw new Error(errorMessageGeneration(result));
  }
}

/**
 * Функция генерации сообщения об ошибке.
 * 
 * @param {Object} params - Параметры.
 * @param {string} params.selector - Селектор элемента.
 * @param {string} params.property - Свойство элемента.
 * @param {string} params.message - Сообщение об ошибке.
 * 
 * @return {string} Сообщение об ошибке.
 */
function errorMessageGeneration(params) {
  const { selector, property, message } = params;
  // Формируем сообщение об ошибке
  let errorMessage = `Ошибка валидации:\n\n${message}\r
      ---------------------------------------\n`;
  if (selector !== undefined) {
    errorMessage += `Селектор: ${selector}\n`;
  }
  if (property !== undefined) {
    errorMessage += `Свойство: ${property}\n`;
  }

  return errorMessage;
}

// Объект, содержащий результаты валидации
const validationResults = {
  // Успешный результат
  SUCCESS: {
    isValid: true,
    message: 'Конфигурация корректна.',
  },

  // Ошибки при валидации конфигурации контроллеров
  INVALID_ROOT_CONFIG: {
    isValid: false,
    message: 'controlConfig должен быть объектом.',
  },
  NOT_AN_OBJECT: (selector) => ({
    isValid: false,
    message: `Конфигурация для селектора "${selector}" \r
    должна быть объектом.`,
    selector,
  }),
  MISSING_PROPERTY: (selector, prop) => ({
    isValid: false,
    message: `Свойство "${prop}" отсутствует в конфигурации \r
    для селектора "${selector}".`,
    selector,
    property: prop,
  }),
  INVALID_PROPERTY_TYPE: (selector, prop, expectedType) => ({
    isValid: false,
    message: `Свойство "${prop}" в конфигурации для селектора "${selector}" \r
    должно быть типа "${expectedType}".`,
    selector,
    property: prop,
    expectedType,
  }),
  INVALID_ARRAY_ITEM_TYPE: (selector, prop) => ({
    isValid: false,
    message: `Все элементы в свойстве "${prop}" для селектора "${selector}" \r
    должны быть строками.`,
    selector,
    property: prop,
  }),

  // Ошибки при валидации книги
  MISSING_BOOK_READER_SELECTOR: {
    isValid: false,
    message: 'Свойство "bookReaderSelector" отсутствует.',
  },
  INVALID_BOOK_READER_SELECTOR: (selector) => ({
    isValid: false,
    message: 'Свойство "bookReaderSelector" должно быть строкой.',
    selector,
  }),
  BOOK_NOT_FOUND: (selector) => ({
    isValid: false,
    message: `Книга с селектором "${selector}" не найдена. \r
    Убедитесь, что элемент существует в DOM.`,
    selector,
  }),

  // Ошибки при валидации имени тега контроллеров
  MISSING_CONTROLLER_TAG_NAME: {
    isValid: false,
    message: 'Свойство "controllerTagName" отсутствует.',
  },
  INVALID_CONTROLLER_TAG_NAME_TYPE: (selector) => ({
    isValid: false,
    message: 'Свойство "controllerTagName" должно быть строкой.',
    selector,
  }),
  INVALID_CONTROLLER_TAG_NAME: (selector) => ({
    isValid: false,
    message: `Свойство "controllerTagName" должно быть именем тега, например 'a'.\r
    Имя тега должно состоять только из букв.`,
    selector,
  })
};

/**
 * Валидация селектора книги.
 * 
 * @param {string} bookReaderSelector - Селектор книги.
 * @returns {Object} - Результат валидации в виде объекта с свойствами isValid и message.
 */
function validateBookReaderSelector(bookReaderSelector) {
  if (bookReaderSelector === undefined) {
    return validationResults.MISSING_BOOK_READER_SELECTOR;
  }

  if (typeof bookReaderSelector !== 'string') {
    return validationResults.INVALID_BOOK_READER_SELECTOR(bookReaderSelector);
  }

  if (!document.querySelector(bookReaderSelector)) {
    return validationResults.BOOK_NOT_FOUND(bookReaderSelector);
  }

  return validationResults.SUCCESS;
}

/**
 * Валидация имени тега контроллеров.
 * 
 * @param {string} controllerTagName - Имя тега контроллеров.
 * @returns {Object} - Результат валидации в виде объекта с свойствами isValid и message.
 */
function validateControllerTagName(controllerTagName) {
  if (controllerTagName === undefined) {
    return validationResults.MISSING_CONTROLLER_TAG_NAME;
  }

  if (typeof controllerTagName !== 'string') {
    return validationResults.INVALID_CONTROLLER_TAG_NAME_TYPE(controllerTagName);
  }

  const tagNamePattern = /^[a-zA-Z]+$/;
  if (!tagNamePattern.test(controllerTagName)) {
    return validationResults.INVALID_CONTROLLER_TAG_NAME(controllerTagName);
  }

  return validationResults.SUCCESS;
}

/**
 * Валидация конфигурации контроллеров.
 * 
 * @param {Object} controlConfig - Конфигурация контроллеров.
 * @returns {Object} - Результат валидации в виде объекта с свойствами isValid и message.
 */
function validateControlConfig(controlConfig) {
  // Проверяем, что controlConfig является объектом
  if (typeof controlConfig !== 'object' || controlConfig === null) {
    return validationResults.INVALID_ROOT_CONFIG;
  }

  // Проходим по всем ключам объекта
  for (const selector in controlConfig) {
    if (controlConfig.hasOwnProperty(selector)) {
      const config = controlConfig[selector];

      // Проверяем, что config является объектом
      if (typeof config !== 'object' || config === null) {
        return validationResults.NOT_AN_OBJECT(selector);
      }

      // Проверяем наличие и тип каждого обязательного свойства
      const requiredProps = [
        { name: 'classPrefix', type: 'string' },
        { name: 'activeClass', type: 'string' },
        { name: 'removeClasses', type: 'array' },
        { name: 'dataAttribute', type: 'string' },
      ];

      for (const prop of requiredProps) {
        if (!(prop.name in config)) {
          return validationResults.MISSING_PROPERTY(selector, prop.name);
        }
        if (
          typeof config[prop.name] !== prop.type && 
          !(prop.type === 'array' && 
          Array.isArray(config[prop.name]))
        ) {
          return validationResults.INVALID_PROPERTY_TYPE(selector, prop.name, prop.type);
        }
      }

      // Дополнительно проверяем, что все элементы в removeClasses являются строками
      if (!config.removeClasses.every(item => typeof item === 'string')) {
        return validationResults.INVALID_ARRAY_ITEM_TYPE(selector, 'removeClasses');
      }
    }
  }

  // Если все проверки пройдены, возвращаем успешный результат
  return validationResults.SUCCESS;
}

/**
 * Конфигурация контроллеров.
 * 
 * @type {Object}
 * @property {string} classPrefix - Префикс класса, который будет добавлен для элемента книги.
 * @property {string} activeClass - Класс активного контроллера.
 * @property {Array} removeClasses - Массив классов, которые нужно удалить.
 * @property {string} dataAttribute - Атрибут контроллера.
 */
const controlConfig = {
  '.book__control--font-size': {
    classPrefix: 'fs',
    activeClass: 'font-size--active',
    removeClasses: ['book--fs-small', 'book--fs-big'],
    dataAttribute: 'size',
  },
  '.book__control--color': {
    classPrefix: 'color',
    activeClass: 'color--active',
    removeClasses: ['book--color-black', 'book--color-gray', 'book--color-whitesmoke'],
    dataAttribute: 'textColor',
  },
  '.book__control--background': {
    classPrefix: 'bg',
    activeClass: 'color--active',
    removeClasses: ['book--bg-black', 'book--bg-gray', 'book--bg-white'],
    dataAttribute: 'bgColor',
  },
};

// Инициализация интерфейса читалки
initializeBookReaderUI({ bookReaderSelector: '.book', controllerTagName: 'a', controlConfig, });
