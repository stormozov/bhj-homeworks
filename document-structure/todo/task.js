/**
 * Инициализация приложения TODO
 * @param {Object} params - Параметры приложения TODO
 */
function initializeTodo(params) {
  loadTasks(params);
  sendForm(params);
  clearAndDeleteTasks(params);
  updateClearButtonState(params.form);
}

/**
 * Загрузка задач из localStorage
 * 
 * @param {Object} params - Параметры приложения TODO
 * @param {Object} params.form - Объект с параметрами формы
 * @param {Object} params.output - Объект с параметрами вывода
 */
function loadTasks({ form, output }) {
  const tasks = getTasksFromLocalStorage();
  tasks.forEach(task => addIssueToList(task, output));
  updateClearButtonState(form);
}

/**
 * Отправка формы
 * 
 * @param {Object} params - Параметры приложения TODO
 * @param {Object} params.form - Объект с параметрами формы
 * @param {Object} params.output - Объект с параметрами вывода
 */
function sendForm({ form, output }) {
  const { formSelector, inputSelector } = form;
  const formElement = document.querySelector(formSelector);
  
  formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const issue = getIssueFromForm(inputSelector);
    formElement.reset();
    addIssueToList(issue, output);
    addIssueToLocalStorage(issue);
    updateClearButtonState(form);
  });
}

/**
 * Очистка и удаление задач
 * @param {Object} params - Параметры приложения TODO
 */
function clearAndDeleteTasks(params) {
  deleteSelectedTask(params);
  clearTasks(params);
}

/**
 * Получение задачи из формы
 * @param {string} inputSelector - Селектор поля ввода
 * @return {string} Текст задачи, полученная из поля формы
 */
function getIssueFromForm(inputSelector) {
  return document.querySelector(inputSelector).value;
}

/**
 * Добавление задачи в список
 * @param {string} issue - Текст задачи
 * @param {Object} outputParams - Объект с параметрами вывода
 */
function addIssueToList(issue, outputParams) {
  addIssueDOMStructure(issue, outputParams);
}

/**
 * Добавление элемента задачи в DOM
 * @param {string} issue - Текст задачи
 * @param {Object} outputParams - Объект с параметрами для вывода
 */
function addIssueDOMStructure(issue, outputParams) {
  const output = document.querySelector(outputParams.outputSelector);
  output.appendChild(createTaskItem(issue, outputParams));
}

/**
 * Создание HTML-элемента задачи
 * 
 * @param {string} issue - Текст задачи
 * @param {Object} outputParams - Объект с параметрами вывода
 * @param {string} outputParams.itemClass - Класс элемента задачи
 * @param {string} outputParams.titleClass - Класс заголовка задачи
 * @param {string} outputParams.removeClass - Класс кнопки удаления задачи
 * 
 * @return {Element} HTML-элемент задачи
 */
function createTaskItem(issue, { itemClass, titleClass, removeClass }) {
  const element = document.createElement('li');
  element.className = itemClass;
  element.innerHTML = `
    <span class="${titleClass}">${issue}</span>
    <button class="${removeClass}">&times;</button>
  `;

  return element;
}

/**
 * Удаление задачи из списка
 * @param {Object} params - Параметры приложения TODO
 */
function deleteSelectedTask(params) {
  const { outputSelector, titleClass, removeClass } = params.output;
  const outputList = document.querySelector(outputSelector);
  
  outputList.addEventListener('click', (event) => {
    if (event.target.classList.contains(removeClass)) {
      const text = event.target.parentElement.querySelector(`.${titleClass}`).textContent;
      removeTaskFromLocalStorage(text);
      event.target.parentElement.remove();
      updateClearButtonState(params.form);
    }
  });
}

/**
 * Очистка списка задач
 * 
 * @param {Object} params - Параметры приложения TODO
 * @param {Object} params.form - Объект с параметрами формы
 * @param {Object} params.output - Объект с параметрами вывода
 */
function clearTasks({ form, output }) {
  const clearButton = document.querySelector(form.clearSelector);

  clearButton.disabled = getTasksFromLocalStorage().length === 0;

  clearButton.addEventListener('click', () => {
    const userConfirmation = confirm('Вы действительно хотите удалить все задачи?');
    if (!userConfirmation) return;
    
    const outputList = document.querySelector(output.outputSelector);
    outputList.innerHTML = '';
    localStorage.setItem('tasks', JSON.stringify([]));

    updateClearButtonState(form);
  });
}

/**
 * Обновление состояния кнопки очистки списка задач
 * @param {Object} paramForm - Объект с параметрами формы
 * @param {string} paramForm.clearSelector - Селектор кнопки очистки
 */
function updateClearButtonState({ clearSelector }) {
  const clearButton = document.querySelector(clearSelector);
  const tasks = getTasksFromLocalStorage();
  clearButton.disabled = tasks.length === 0;
}

/**
 * Добавление задачи в localStorage
 * @param {string} task - Текст задачи
 */
function addIssueToLocalStorage(task) {
  const tasks = getTasksFromLocalStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Получение задач из localStorage
 * @return {Array} Массив задач
 */
function getTasksFromLocalStorage() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

/**
 * Удаление задачи из localStorage
 * @param {string} taskTitle - Текст задачи
 */
function removeTaskFromLocalStorage(taskTitle) {
  const tasks = getTasksFromLocalStorage();
  const updatedTasks = tasks.filter(task => task !== taskTitle);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

initializeTodo({
  form: {
    formSelector: '#tasks-form',
    inputSelector: '#tasks-input',
    clearSelector: '#tasks-clear',
  },
  output: {
    outputSelector: '#tasks-list',
    itemClass: 'tasks__item',
    titleClass: 'tasks__item-title',
    removeClass: 'tasks__item-remove',
  }
});
