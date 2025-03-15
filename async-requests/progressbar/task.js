class FileUploader {

  /**
   * Загрузчик файлов на сервер
   * @param {Object} config - Объект конфигурации загрузчика на сервер
   */
  constructor(config) {
    // Элементы
    this.form = config.form;
    this.fileInput = config.fileInput;
    this.progressBar = config.progressBar;
    this.fileNameSpan = config.fileNameSpan;
    this.sendButton = config.sendButton;

    // Ссылка на сервер
    this.url = config.url;

    // Состояния
    this.previewContainer = null;
    this.animationFrameId = null;
    this.animationStartTime = null;
    this.targetPercentage = 0;

    // Инициализация загрузчика
    this.#initialize();
  }

  /**
   * Инициализация загрузчика
   */
  #initialize() {
    this.#registerEventListeners();
    this.#initDropZone();
  }

  /**
   * Регистрация обработчиков событий
   */
  #registerEventListeners() {
    this.fileInput.addEventListener('change', this.#handleFileSelect.bind(this));
    this.form.addEventListener('submit', this.#handleFormSubmit.bind(this));
  }

  /**
   * Инициализация зоны перетаскивания
   */
  #initDropZone() {
    const dropZone = this.form;
    dropZone.classList.add('form-drop-zone');

    // Создаем оверлей
    this.#createDropZoneOverlay();

    // Обработчики событий
    dropZone.addEventListener('dragenter', this.#handleDragEnter.bind(this));
    dropZone.addEventListener('dragover', this.#handleDragOver.bind(this));
    dropZone.addEventListener('dragleave', this.#handleDragLeave.bind(this));
    dropZone.addEventListener('drop', this.#handleDrop.bind(this));
  }

  /**
   * Создание оверлей для зоны перетаскивания
   */
  #createDropZoneOverlay() {
    this.dragOverlay = document.createElement('div');
    this.dragOverlay.className = 'drag-overlay';
    document.body.appendChild(this.dragOverlay);
  }

  /**
   * Обработка входа в зону перетаскивания
   * @param {Event} e - Объект события
   */
  #handleDragEnter(e) {
    e.preventDefault();
    this.form.classList.add('dragover');
    this.dragOverlay.style.display = 'block';
  }

  /**
   * Обработка перетаскивания
   * @param {Event} e - Объект события
   */
  #handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Обработка выхода из зоны перетаскивания
   * @param {Event} e - Объект события
   */
  #handleDragLeave(e) {
    if (!e.relatedTarget || !this.form.contains(e.relatedTarget)) {
      this.form.classList.remove('dragover');
      this.dragOverlay.style.display = 'none';
    }
  }

  /**
   * Обработка перетаскивания
   * @param {Event} e - Объект события
   */
  #handleDrop(e) {
    e.preventDefault();
    this.form.classList.remove('dragover');
    this.dragOverlay.style.display = 'none';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.fileInput.files = files;
      this.#handleFileSelect();
    }
  }

  /**
   * Обработка выбора файла
   */
  #handleFileSelect() {
    this.#clearPreview();
    this.#updateFileNameDisplay();
    this.#previewImgFile();
  }

  /**
   * Обработка отправки формы
   * @param {Event} e - Объект события
   */
  async #handleFormSubmit(e) {
    e.preventDefault();
    const file = this.fileInput.files[0];

    try {
      this.#toggleUIState(true);
      await this.#uploadFile(file);
      this.#handleSuccess();
    } catch (error) {
      this.#handleUploadError(error);
    } finally {
      this.#toggleUIState(false);
    }
  }

  /**
   * Обновление отображения имени файла
   */
  #updateFileNameDisplay() {
    const MAX_VISIBLE_LENGTH = 25;
    const originalName = this.fileInput.files[0]?.name || 'Имя файла...';
    const truncatedName = this.#truncateFileName(originalName, MAX_VISIBLE_LENGTH);

    this.fileNameSpan.textContent = truncatedName;
    this.fileNameSpan.title = originalName;
  }
  
  /**
   * Обрезка имени файла
   * 
   * @param {string} name - Имя файла
   * @param {number} maxLength - Максимальная длина имени файла
   * 
   * @returns {string} Обрезанное имя файла или оригинальное имя
   */
  #truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;

    const extensionIndex = name.lastIndexOf('.');
    if (extensionIndex === -1) return `${name.slice(0, maxLength - 3)}...`;

    const extension = name.slice(extensionIndex);
    const baseName = name.slice(0, extensionIndex);
    const maxBaseLength = maxLength - extension.length - 3;

    if (baseName.length <= maxBaseLength) return name;

    return `${baseName.slice(0, maxBaseLength)}...${extension}`;
  }

  /**
   * Предварительное отображение файла
   */
  #previewImgFile() {
    const file = this.fileInput.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => this.#showImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }

  /**
   * Показать предварительное отображение файла
   * @param {string} src - Ссылка на файл
   */
  #showImagePreview(src) {
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'preview-container';
    this.previewContainer.innerHTML = `
    <img src="${src}" class="file-preview" alt="Превью файла">
    <div class="preview-close-btn">&times;</div>
  `;

    this.#addRemoveAddedFile();
  }

  /**
   * Добавление кнопки удаления добавленного файла и его превью
   */
  #addRemoveAddedFile() {
    const closeBtn = this.previewContainer.querySelector('.preview-close-btn');
    closeBtn.addEventListener('click', this.#handleRemoveFile.bind(this));
    this.form.prepend(this.previewContainer);
  }

  /**
   * Обработчик удаления файла
   */
  #handleRemoveFile() {
    if (this.isUploading) return;

    this.fileInput.value = '';
    this.#clearPreview();
    this.#updateFileNameDisplay();
  }

  /**
   * Очистка предварительного отображения файла
   */
  #clearPreview() {
    if (this.previewContainer) {
      this.previewContainer.remove();
      this.previewContainer = null;
    }
  }

  /**
   * Загрузка файла на сервер
   * 
   * @param {File} file - Файл, полученный из формы на странице
   * @returns {Promise} - Промис, который возвращает результат загрузки файла
   * @throws {Error} - Если произошла ошибка при загрузке на сервер
   */
  #uploadFile(file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', this.#updateProgress.bind(this));

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Ошибка загрузки на сервер: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Ошибка сети')));

      xhr.open('POST', this.url);
      xhr.send(formData);
    });
  }

  /**
   * Обновление прогресс-бара
   * @param {Event} e - Объект события
   */
  #updateProgress(e) {
    // Если загрузка не поддерживается, выходим
    if (!e.lengthComputable) return;

    // Фиксируем целевой прогресс
    this.targetPercentage = (e.loaded / e.total) * 100;

    // Запускаем анимацию только если она еще не активна
    if (!this.animationFrameId) this.#animateProgress();
  }

  /**
   * Анимация прогресс-бара
   */
  #animateProgress() {
    const animate = () => {
      // Текущее значение прогресс-бара
      const currentWidth = parseFloat(this.progressBar.style.width) || 0;

      // Новое значение прогресс-бара
      const newWidth = currentWidth + (this.targetPercentage - currentWidth) * 0.1;

      // Обновляем значение
      this.progressBar.style.width = `${newWidth}%`;

      // Продолжаем анимацию пока не достигнем цели
      if (newWidth < this.targetPercentage - 0.1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Фиксация завершения анимации
        this.progressBar.style.width = `${this.targetPercentage}%`;
        this.animationFrameId = null;
        this.animationStartTime = null;
      }
    };

    // Запускаем анимацию
    if (!this.animationStartTime) this.animationStartTime = Date.now();
    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Отмена предыдущей анимации
   */
  #cancelPreviousAnimation() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  /**
   * Обработка успешной загрузки файла
   */
  #handleSuccess() {
    // Фиксация завершения анимации
    this.#setProgressBarWidth(100);

    // Задержка перед сбросом для демонстрации
    setTimeout(() => {
      this.#resetForm();
      alert('Файл успешно загружен!');
    }, 300);
  }

  /**
   * Сброс формы
   */
  #resetForm() {
    this.form.reset();
    this.fileNameSpan.textContent = 'Имя файла...';
    this.#cancelPreviousAnimation();
    this.#clearPreview();
    this.#setProgressBarWidth(0);
    this.animationStartTime = null;
  }

  /**
   * Переключение состояния интерфейса
   * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки
   */
  #toggleUIState(isLoading) {
    this.sendButton.disabled = isLoading;
    this.fileInput.disabled = isLoading;
  }

  #setProgressBarWidth(width) {
    this.targetPercentage = width;
    this.progressBar.style.width = `${width}%`;
  }

  /**
   * Обработка ошибки при загрузке файла
   * @param {Error} error - Объект ошибки
   */
  #handleUploadError(error) {
    alert(`Ошибка: ${error.message}`);
    this.progressBar.style.width = '0%';
    this.#clearPreview();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const config = {
    form: document.getElementById('form'),
    fileInput: document.getElementById('file'),
    progressBar: document.getElementById('progress'),
    fileNameSpan: document.querySelector('.input__wrapper-desc'),
    sendButton: document.getElementById('send'),
    url: 'https://students.netoservices.ru/nestjs-backend/upload'
  };

  new FileUploader(config);
});
