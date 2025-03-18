/**
 * Обработка отправки формы.
 * @param {Event} event - Объект события.
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    clearErrors();

    if (!validateForm(form)) return;

    const data = await sendFormData(form);

    if (data.success) {
      handleResponse(data);
    } else {
      throw new Error(data.message || '⚠️ Ошибка авторизации. Проверьте логин и пароль.');
    }
  } catch (error) {
    handleError(error);
    displayError(error.message);
  } finally {
    submitButton.disabled = false;
  }
}

/**
 * Отправка данных формы.
 * 
 * @param {HTMLFormElement} form - Элемент формы.
 * 
 * @throws {Error} - Если отправка не удалась.
 * 
 * @returns {Promise<Object>} - Данные ответа, полученные от сервера, 
 * если отправка прошла успешно.
 */
async function sendFormData(form) {
  const url = form.action || 'https://students.netoservices.ru/nestjs-backend/auth';
  const formData = new FormData(form);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Выход из аккаунта.
 */
function signOut() {
  userStorage.removeId();
  switchToSignInScreen();
  clearForm();
}

/**
 * Обработка успешного ответа.
 * @param {Object} data - Данные ответа.
 */
function handleResponse(data) {
  userStorage.setId(data.user_id);
  displayUserIdToPage(data.user_id);
  switchToWelcomeScreen(true);
}

/**
 * Обработка ошибки.
 * @param {Error} error - Объект ошибки.
 */
function handleError(error) {
  console.error('Ошибка:', error);
}

/**
 * Отображение сообщения об ошибке.
 * @param {string} message - Сообщение об ошибке.
 */
function displayError(message) {
  const errorElement = document.createElement('p');
  errorElement.className = 'error-message';
  errorElement.textContent = message;

  const form = document.getElementById('signin-form');
  const container = form.querySelector('.error-container') || createErrorContainer(form);
  container.innerHTML = '';
  container.appendChild(errorElement);
}

/**
 * Очистка контейнера для ошибок.
 */
function clearErrors() {
  const containers = document.querySelectorAll('.error-container');
  containers.forEach(container => container.innerHTML = '');
}

/**
 * Создание контейнера для ошибок.
 * @param {HTMLFormElement} form - Объект формы.
 * @returns {HTMLElement} - Контейнер для ошибок.
 */
function createErrorContainer(form) {
  const container = document.createElement('div');
  container.className = 'error-container';
  form.prepend(container);
  return container;
}

/**
 * Переключение на экран приветствия.
 * @param {boolean} animate - Флаг, указывающий, нужно ли анимировать переключение. 
 * По умолчанию: false.
 */
async function switchToWelcomeScreen(animate = false) {
  const signin = document.getElementById('signin');
  const welcome = document.getElementById('welcome');

  if (animate) {
    await animateElement(signin, 'slide-out');
    signin.classList.remove('signin--active');
    welcome.classList.add('welcome--active');
    await animateElement(welcome, 'slide-in');
  } else {
    signin.classList.remove('signin--active');
    welcome.classList.add('welcome--active');
  }
}

/**
 * Переключение на экран входа.
 */
function switchToSignInScreen() {
  const signin = document.getElementById('signin');
  const welcome = document.getElementById('welcome');

  signin.classList.add('signin--active');
  signin.classList.remove('slide-out');
  welcome.classList.remove('welcome--active', 'slide-in');
}

/**
 * Анимация элемента.
 * 
 * @param {HTMLElement} element - Элемент, который нужно анимировать.
 * @param {string} animationClass - Класс анимации.
 * 
 * @returns {Promise} - Промис, который разрешается после завершения анимации.
 */
function animateElement(element, animationClass) {
  return new Promise(resolve => {
    const handler = () => {
      element.removeEventListener('animationend', handler);
      resolve();
    };

    element.addEventListener('animationend', handler);
    element.classList.add(animationClass);
  });
}

/**
 * Валидация формы.
 * @param {HTMLFormElement} form - Объект формы.
 * @returns {boolean} - Результат валидации. true - форма валидна, false - форма невалидна.
 */
function validateForm(form) {
  const login = form.elements.login.value.trim();
  const password = form.elements.password.value.trim();

  if (!login || !password) {
    displayError('Все поля должны быть заполнены');
    return false;
  }

  return true;
}

/**
 * Отображение идентификатора пользователя на странице.
 */
function displayUserIdToPage(userId) {
  const userIdElement = document.getElementById('user-id');
  userIdElement.textContent = userId;
}

/**
 * Очистка формы.
 */
function clearForm() {
  const form = document.getElementById('signin-form');
  form.reset();
  clearErrors();
}

/**
 * Инициализация переключателя пароля.
 */
function initializePasswordToggle() {
  const toggleButton = document.querySelector('.toggle-password');
  const buttonIcon = toggleButton.querySelectorAll('.eye-icon');
  const passwordInput = document.querySelector('input[name="password"]');
  let passwordTimeout;

  toggleButton.addEventListener('click', function () {
    handleToggleClick(this, buttonIcon, passwordInput, passwordTimeout);
  });
}

/**
 * Обрабатывает клик по кнопке переключения пароля.
 * 
 * @param {HTMLElement} toggleButton - Кнопка переключения пароля.
 * @param {NodeList} buttonIcon - Коллекция из двух иконок кнопки переключения пароля.
 * @param {HTMLInputElement} passwordInput - Поле ввода пароля.
 * @param {number} passwordTimeout - Таймер для автоматического переключения.
 */
function handleToggleClick(toggleButton, buttonIcon, passwordInput, passwordTimeout) {
  const isPressed = toggleButton.getAttribute('aria-pressed') === 'true';
  toggleButton.setAttribute('aria-pressed', String(!isPressed));
  passwordInput.type = isPressed ? 'password' : 'text';

  animateToggleButton(toggleButton);
  toggleActiveIcon(buttonIcon);
  autoSwitchVisiblePassword(isPressed, toggleButton, passwordTimeout);
}

/**
 * Переключает активный класс иконки кнопки переключения пароля.
 * @param {HTMLCollection} buttonIcon - Коллекция иконок кнопки переключения пароля.
 */
function toggleActiveIcon(buttonIcon) {
  buttonIcon.forEach(icon => icon.classList.toggle('active'));
}

/**
 * Добавляет анимацию кнопке переключения показа пароля.
 * @param {HTMLElement} toggleButton - Кнопка переключения пароля.
 */
function animateToggleButton(toggleButton) {
  toggleButton.classList.add('animate-toggle');
  setTimeout(() => toggleButton.classList.remove('animate-toggle'), 300);
}

/**
 * Автоматически переключает видимость пароля через 5 секунд.
 * @param {boolean} isPressed - Флаг, указывающий, что кнопка переключения пароля нажата.
 * @param {HTMLElement} toggleButton - Кнопка переключения пароля.
 */
function autoSwitchVisiblePassword(isPressed, toggleButton, passwordTimeout) {
  if (!isPressed) {
    passwordTimeout = setTimeout(() => {
      toggleButton.click();
    }, 5000);
  } else {
    clearTimeout(passwordTimeout);
  }
}

/**
 * Объект для работы с идентификатором пользователя в localStorage.
 */
const userStorage = {
  key: 'userId',

  /**
   * Установка идентификатора пользователя в localStorage.
   * @param {string} userId - Идентификатор пользователя.
   */
  setId(userId) {
    localStorage.setItem(this.key, userId);
  },

  /**
   * Получение идентификатора пользователя из localStorage.
   * @returns {string|null} Возвращает идентификатор пользователя 
   * или null, если он не найден.
   */
  getId() {
    return localStorage.getItem(this.key);
  },

  /**
   * Удаление идентификатора пользователя из localStorage.
   */
  removeId() {
    localStorage.removeItem(this.key);
  }
};

/**
 * Инициализация приложения авторизации и деавторизации.
 */
function initializeAuth() {
  initializePasswordToggle();
  const userId = userStorage.getId();

  if (userId) {
    displayUserIdToPage(userId);
    switchToWelcomeScreen();
  } else {
    switchToSignInScreen();
  }

  document.getElementById('signin-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('signout-btn').addEventListener('click', signOut);
}

initializeAuth();
