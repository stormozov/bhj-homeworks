/**
 * Инициализация корзины
 * @param {Object} params - Объект с параметрами корзины
 */
function initializeCart(params) {
  loadCart(params.cart);
  quantityControlsManager(params.products.selectors);
  addProductToCartManager(params);
  clearCart(params.cart.selectors);
  showOrHideCart(params.cart.selectors);
}

/**
 * Показывает или скрывает корзину на основе количества товаров в ней
 * @param {Object} cartParams - Объект с параметрами корзины
 */
function showOrHideCart(cartParams) {
  const cart = document.querySelector(cartParams.parent);
  cart.classList.toggle('visible', getProductsFromLocalStorage().length > 0);
}

/**
 * Управление количеством товаров в корзине
 * 
 * @param {Object} productParams - Объект с параметрами товара
 * @param {Object} itemSchema - Объект с параметрами товара
 * @param {Object} quantity - Объект с параметрами количества
 */
function quantityControlsManager({ itemSchema, quantity }) {
  const decrementElements = document.querySelectorAll(quantity.controls.decrement);
  const incrementElements = document.querySelectorAll(quantity.controls.increment);
  
  const setupControls = (controls, change) => {
    controls.forEach(control => {
      control.addEventListener('click', (event) => {
        const parent = event.target.closest(itemSchema.parent);
        const countElement = parent.querySelector(quantity.value);
        const newValue = Math.max(1, +countElement.textContent + change);
        countElement.textContent = newValue;
      });
    });
  };

  setupControls(decrementElements, -1);
  setupControls(incrementElements, 1);
}

/**
 * Получение данных о товаре
 * 
 * @param {Element} parentElem - Родительский элемент, у которого собираются данные
 * @param {Object} params - Объект с параметрами
 * 
 * @returns {Object} - Объект с полученными данными о товаре
 */
function getProductData(parentElem, params) {
  return {
    id: parentElem.dataset.id,
    title: parentElem.querySelector(params.title).textContent.trim(),
    img: parentElem.querySelector(params.image).getAttribute('src'),
    count: +parentElem.querySelector(params.count).textContent.trim(),
  };
}

/**
 * Менеджер добавления товара в корзину
 * @param {Object} params - Объект с параметрами
 */
function addProductToCartManager(params) {
  const buttons = document.querySelectorAll(params.products.selectors.addToCartBtn);
  buttons.forEach((btn) => {
    btn.addEventListener('click', (event) => addProductToCart(event, params));
  });
}

/**
 * Добавление товара в корзину
 * @param {Event} event - Объект события
 * @param {Object} params - Объект с параметрами
 */
function addProductToCart(event, params) {
  const itemSchema = params.products.selectors.itemSchema;
  const parentElem = event.target.closest(itemSchema.parent);
  const productData = getProductData(parentElem, itemSchema);

  parentElem.querySelector(itemSchema.count).textContent = 1;
  
  updateCartData(productData, params);
  animateProductAddition(event, params, productData);
}

/**
 * Анимация изменения значения
 * @param {Element} element - Элемент, значение которого нужно анимировать
 * @param {number} start - Начальное значение
 * @param {number} end - Конечное значение
 * @param {number} duration - Длительность анимации в миллисекундах
 */
function animateValue(element, start, end, duration) {
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = timestamp - startTimestamp;
    const currentValue = Math.min(start + Math.ceil((end - start) * (progress / duration)), end);
    element.textContent = currentValue;

    if (currentValue < end) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

/**
 * Обновление данных о товаре в корзине
 * @param {Object} productData - Собранный объект с данными о товаре
 * @param {Object} params - Объект с параметрами
 */
function updateCartData(productData, params) {
  addProductToLocalStorage(productData);
  loadCart(params.cart, productData.id);
  showOrHideCart(params.cart.selectors);
}

/**
 * Анимация добавления товара в корзину
 * 
 * @param {Event} event - Объект события
 * @param {Object} params - Объект с параметрами
 * @param {Object} productData - Собранный объект с данными о товаре
 */
function animateProductAddition(event, params, productData) {
  const cartSelectors = params.cart.selectors;
  const productSelectors = params.products.selectors;
  setTimeout(() => {
    const targetCartItem = findTargetCartItem(cartSelectors, productData.id);
    const flyingImage = createFlyingImage(event, productSelectors.itemSchema);

    setupInitialPosition(flyingImage, event, productSelectors.itemSchema);
    startFlyAnimation(flyingImage, targetCartItem);
  }, 50);
}

/**
 * Поиск целевого элемента в корзине по идентификатору товара
 * 
 * @param {Object} params - Объект с селекторами корзины
 * @param {string} productId - Идентификатор товара
 * 
 * @returns {Element} - Найденный целевой элемент корзины, либо родительский элемент корзины,
 * если целевой элемент не найден
 */
function findTargetCartItem(cartSelectors, productId) {
  const cartItems = [...document.querySelectorAll(cartSelectors.item.parent)];
  const targetCartItem = cartItems.find(item => item.dataset.id === productId);
  return targetCartItem || document.querySelector(cartSelectors.parent);
}

/**
 * Создание летающего изображения-дубликата
 * 
 * @param {Event} event - Объект события
 * @param {Object} productSelectors - Объект с селекторами товара
 * 
 * @returns {Element} - Созданный летающий изображение
 */
function createFlyingImage(event, productSelectors) {
  // TODO: Повторяется код. Можно вынести получение элемента изображения
  // в отдельную функцию и вызывать ее в функции animateProductAddition
  // один раз, вместо того, чтобы вызывать дважды в разных местах и не
  // тянуть объект параметров с селекторами в каждую функцию, а передавать
  // в функции в качестве параметров сразу элемент изображения
  const productParent = event.target.closest(productSelectors.parent);
  const productImage = productParent.querySelector(productSelectors.image);

  const flyingImage = productImage.cloneNode(true);
  Object.assign(flyingImage.style, {
    position: 'absolute',
    width: '50px',
    height: 'auto',
    zIndex: '1000',
    transition: 'all 0.5s ease-in-out',
    opacity: '1',
    pointerEvents: 'none',
  });

  document.body.appendChild(flyingImage);
  return flyingImage;
}

/**
 * Установка начальной позиции летающего изображения
 * 
 * @param {Element} element - Летающий изображение
 * @param {Event} event - Объект события
 * @param {Object} productSelectors - Объект с селекторами товара
 */
function setupInitialPosition(element, event, productSelectors) {
  const productParent = event.target.closest(productSelectors.parent);
  const productImage = productParent.querySelector(productSelectors.image);
  const rect = productImage.getBoundingClientRect();

  element.style.left = `${rect.left + window.scrollX}px`;
  element.style.top = `${rect.top + window.scrollY}px`;
}

/**
 * Начало анимации летающего изображения
 * @param {Element} element - Летающий изображение
 * @param {Element} target - Целевой элемент
 */
function startFlyAnimation(element, target) {
  const targetRect = target.getBoundingClientRect();
  const targetPosition = {
    left: targetRect.left + (targetRect.width / 2) - (element.offsetWidth / 2),
    top: targetRect.top + (targetRect.height / 2) - (element.offsetHeight / 2)
  };

  // Используем transform для плавности
  element.style.transform = `translate(
    ${targetPosition.left - parseFloat(element.style.left)}px,
    ${targetPosition.top - parseFloat(element.style.top)}px
  ) scale(0.3)`;

  requestAnimationFrame(() => {
    element.style.opacity = '0';
  });

  element.addEventListener('transitionend', () => element.remove(), { once: true });
}

/**
 * Очистка корзины, включая локальное хранилище
 * 
 * @param {Object} params - Объект с параметрами
 * @param {string} params.parent - Селектор родителя корзины
 * @param {string} params.clearButton - Селектор кнопки очистки корзины
 * @param {string} params.output - Селектор списка товаров в корзине
 */
function clearCart({ parent, clearButton, output }) {
  document.querySelector(clearButton).addEventListener('click', () => {
    localStorage.removeItem('products');
    document.querySelector(output).innerHTML = '';
    showOrHideCart({ parent });
  });
}

/**
 * Загрузка товаров в корзину
 * 
 * @param {Object} params - Объект с параметрами
 * @param {number} addedProductId - Идентификатор добавленного товара. По умолчанию null
 */
function loadCart(params, addedProductId = null) {
  const outputList = document.querySelector(params.selectors.output);
  outputList.innerHTML = '';

  getProductsFromLocalStorage().forEach(product => {
    const productElement = createProductElement(params, product);

    if (addedProductId && product.id === addedProductId) {
      productElement.classList.add('cart__product-added');
      setTimeout(() => productElement.classList.remove('cart__product-added'), 400);
    }

    outputList.appendChild(productElement);
  });
}

/**
 * Добавление товара в локальное хранилище
 * @param {Object} productData - Данные о товаре для загрузки в локальное хранилище
 */
function addProductToLocalStorage(productData) {
  const products = getProductsFromLocalStorage();
  const existing = products.find(p => p.id === productData.id);

  if (existing) {
    existing.count += productData.count;
  } else {
    products.push(productData);
  }

  localStorage.setItem('products', JSON.stringify(products));
}

/**
 * Получение товаров из локального хранилища
 * @return {Array} Массив товаров, хранящихся в локальном хранилище, либо пустой массив,
 * если в хранилище нет товаров
 */
function getProductsFromLocalStorage() {
  return JSON.parse(localStorage.getItem('products')) || [];
}

/**
 * Создание элемента товара в корзине
 * 
 * @param {Object} cartParams - Объект с параметрами корзины
 * @param {Object} productData - Объект с данными о товаре
 * 
 * @return {Element} Созданный элемент товара
 */
function createProductElement(cartParams, productData) {
  const cleanClass = (selector) => selector.replace('.', '');
  const { parent, image, count } = cartParams.selectors.item;

  const product = document.createElement('div');
  product.className = cleanClass(parent);
  product.dataset.id = productData.id;
  product.innerHTML = `
    <img src="${productData.img}" class="${cleanClass(image)}" alt="${productData.title}">
    <span class="${cleanClass(count)}">${productData.count}</span>
  `;

  return product;
}

initializeCart({
  cart: {
    selectors: {
      parent: '.cart',
      output: '.cart__products',
      clearButton: '#cart-clear',
      item: {
        parent: '.cart__product',
        title: '.cart__product-title',
        image: '.cart__product-image',
        count: '.cart__product-count',
      },
    },
  },
  products: {
    selectors: {
      list: '.products',
      itemSchema: {
        parent: '.product',
        title: '.product__title',
        image: '.product__image',
        count: '.product__quantity-value',
      },
      quantity: {
        value: '.product__quantity-value',
        controls: {
          decrement: '.product__quantity-control--dec',
          increment: '.product__quantity-control--inc',
        },
      },
      addToCartBtn: '.product__add',
    },
  },
});
