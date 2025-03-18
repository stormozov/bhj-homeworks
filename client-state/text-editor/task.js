/**
 * Инициализация текстового редактора
 * @param {Object} config - Объект с конфигурационными данными
 */
function initializeTextEditor(config) {
  const editorElements = getEditorElementsBySelector(config.editor);
  loadTextFromLocalStorage(config.storageKey, editorElements.editorArea);
  setupEventListeners(editorElements, config.storageKey);
}

/**
 * Объект для работы с локальным хранилищем (localStorage).
 * @namespace storage
 */
const storage = {
  /**
   * Сохраняет значение в локальном хранилище по указанному ключу.
   * 
   * @function
   * 
   * @param {string} key - Ключ, под которым будет сохранено значение.
   * @param {string} value - Значение, которое нужно сохранить.
   */
  save: (key, value) => localStorage.setItem(key, value),

  /**
   * Загружает значение из локального хранилища по указанному ключу.
   * 
   * @function
   * 
   * @param {string} key - Ключ, по которому нужно загрузить значение.
   * @returns {string|null} Возвращает значение из локального хранилища или null,
   * если значение не найдено.
   */
  load: (key) => localStorage.getItem(key),

  /**
   * Удаляет значение из локального хранилища по указанному ключу.
   * @function
   * @param {string} key - Ключ, по которому нужно удалить значение.
   */
  remove: (key) => localStorage.removeItem(key)
};

/**
 * Загружает текст из локального хранилища в текстовое поле.
 * @param {string} storageKey - Ключ, по которому нужно загрузить текст.
 * @param {HTMLTextAreaElement} editor - Элемент текстового поля.
 */
function loadTextFromLocalStorage(storageKey, editor) {
  editor.value = storage.load(storageKey);
}

/**
 * Возвращает объект с элементами текстового редактора по указанным селекторам.
 * @param {Object} selectors - Объект с селекторами элементов текстового редактора.
 */
function getEditorElementsBySelector(selectors) {
  return Object
    .entries(selectors)
    .reduce((acc, [key, selector]) => {
      acc[key] = getElementBySelector(selector);
      return acc;
    }, {});
}

/**
 * Возвращает полученный элемент по указанному селектору.
 * 
 * @param {string} selector - Селектор элемента.
 * @throws {Error} Если элемент не был найден.
 * @returns {HTMLElement} Полученный элемент по указанному селектору.
 */
function getElementBySelector(selector) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Элемент не найден: ${selector}\nФункция: getElementBySelector`);
  }

  return element;
}

/**
 * Устанавливает обработчики событий для текстового редактора.
 * @param {Object} elements - Объект с элементами текстового редактора.
 * @param {string} storageKey - Ключ, по которому нужно сохранять текст.
 */
function setupEventListeners(elements, storageKey) {
  elements.editorArea.addEventListener('input', (e) => handleTextarea(e, storageKey));
  elements.clearBtn.addEventListener('click', () => {
    handleClearTextEditor(elements.editorArea, storageKey);
  });
}

/**
 * Обрабатывает событие изменения текста в текстовом редакторе.
 * @param {Event} event - Событие изменения текста в текстовом редакторе.
 * @param {string} storageKey - Ключ, по которому нужно сохранять текст.
 */
function handleTextarea(event, storageKey) {
  storage.save(storageKey, event.target.value);
}

/**
 * Обрабатывает событие очистки текста в текстовом редакторе.
 * @param {HTMLTextAreaElement} editor - Элемент текстового поля.
 * @param {string} storageKey - Ключ, по которому нужно удалять текст.
 */
function handleClearTextEditor(editor, storageKey) {
  editor.value = '';
  storage.remove(storageKey);
}

initializeTextEditor({
  editor: {
    editorArea: '#editor',
    clearBtn: '#editor-clear',
  },
  storageKey: 'textEditor',
});
