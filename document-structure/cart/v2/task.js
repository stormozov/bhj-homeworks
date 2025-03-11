// cart-config.js
const CartConfig = {
  selectors: {
    cart: {
      parent: '.cart',
      output: '.cart__products',
      clearBtn: '#cart-clear',
      item: {
        parent: '.cart__product',
        title: '.cart__product-title',
        image: '.cart__product-image',
        count: '.cart__product-count'
      }
    },
    products: {
      list: '.products',
      item: {
        parent: '.product',
        title: '.product__title',
        image: '.product__image',
        count: '.product__quantity-value',
        addBtn: '.product__add',
        quantity: {
          value: '.product__quantity-value',
          decBtn: '.product__quantity-control--dec',
          incBtn: '.product__quantity-control--inc'
        }
      }
    }
  },
  classes: {
    cartVisible: 'visible',
    itemBump: 'cart__product-bump',
    flyingItem: 'flying-item'
  },
  storageKey: 'cart_v2'
};

// cart-dom.js
class CartDOM {
  static getElement(selector, parent = document) {
    const el = parent.querySelector(selector);
    if (!el) console.error(`Element not found: ${selector}`);
    return el;
  }

  static calculatePosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY + rect.height / 2
    };
  }
}

// cart-storage.js
class CartStorage {
  static getProducts() {
    try {
      return JSON.parse(localStorage.getItem(CartConfig.storageKey)) || [];
    } catch (error) {
      console.error('Cart storage error:', error);
      return [];
    }
  }

  static updateProduct(product) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index > -1) {
      products[index].count += product.count;
    } else {
      products.push(product);
    }

    localStorage.setItem(CartConfig.storageKey, JSON.stringify(products));
    return products;
  }

  static clear() {
    localStorage.removeItem(CartConfig.storageKey);
  }
}

// cart-animations.js
class CartAnimations {
  static #activeAnimations = new Set();

  static createFlyingImage(imageElement, config) {
    const flyingImage = imageElement.cloneNode(true);
    flyingImage.classList.add(config.classes.flyingItem);
    Object.assign(flyingImage.style, {
      position: 'fixed',
      width: '50px',
      height: 'auto',
      pointerEvents: 'none',
      zIndex: '10000'
    });
    return flyingImage;
  }

  static animateElement(element, startPos, endPos) {
    const keyframes = [
      {
        transform: `translate(${startPos.x}px, ${startPos.y}px) scale(1)`,
        opacity: 1
      },
      {
        transform: `translate(${endPos.x}px, ${endPos.y}px) scale(0.3)`,
        opacity: 0
      }
    ];

    const animation = element.animate(keyframes, {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    this.#activeAnimations.add(animation);
    animation.onfinish = () => {
      element.remove();
      this.#activeAnimations.delete(animation);
    };
  }

  static cancelAll() {
    this.#activeAnimations.forEach(animation => {
      animation.cancel();
      animation.onfinish = null;
    });
    this.#activeAnimations.clear();
  }
}

// cart-ui.js
class CartUI {
  static updateCartVisibility(isVisible) {
    const cartElement = CartDOM.getElement(CartConfig.selectors.cart.parent);
    cartElement.classList.toggle(CartConfig.classes.cartVisible, isVisible);
  }

  static renderCartItem(product) {
    const item = document.createElement('div');
    item.className = CartConfig.selectors.cart.item.parent.replace('.', '');
    item.dataset.id = product.id;

    item.innerHTML = `
      <img src="${product.img}" 
           class="${CartConfig.selectors.cart.item.image.replace('.', '')}" 
           alt="${product.title}">
      <span class="${CartConfig.selectors.cart.item.count.replace('.', '')}">
        ${product.count}
      </span>
    `;

    return item;
  }

  static updateCartItems(products, addedProductId) {
    const output = CartDOM.getElement(CartConfig.selectors.cart.output);
    output.innerHTML = '';

    products.forEach(product => {
      const item = this.renderCartItem(product);
      if (product.id === addedProductId) {
        item.classList.add(CartConfig.classes.itemBump);
        item.addEventListener('animationend', () =>
          item.classList.remove(CartConfig.classes.itemBump));
      }
      output.appendChild(item);
    });
  }
}

// cart-core.js
class CartManager {
  static init() {
    this.setupEventListeners();
    this.loadInitialCart();
  }

  static setupEventListeners() {
    document.addEventListener('click', event => {
      this.handleQuantityChange(event);
      this.handleAddToCart(event);
      this.handleClearCart(event);
    });
  }

  static handleQuantityChange(event) {
    const { decBtn, incBtn, value } = CartConfig.selectors.products.item.quantity;

    if (event.target.closest(decBtn)) {
      this.updateQuantity(event, -1);
    } else if (event.target.closest(incBtn)) {
      this.updateQuantity(event, 1);
    }
  }

  static updateQuantity(event, delta) {
    const parent = event.target.closest(CartConfig.selectors.products.item.parent);
    const countElement = CartDOM.getElement(CartConfig.selectors.products.item.quantity.value, parent);
    const newValue = Math.max(1, +countElement.textContent + delta);
    countElement.textContent = newValue;
  }

  static handleAddToCart(event) {
    if (!event.target.closest(CartConfig.selectors.products.item.addBtn)) return;

    const productData = this.getProductData(event);
    if (!productData) return;

    const products = CartStorage.updateProduct(productData);
    CartUI.updateCartItems(products, productData.id);
    CartUI.updateCartVisibility(products.length > 0);
    this.animateProductAddition(event, productData);
  }

  static getProductData(event) {
    const parent = event.target.closest(CartConfig.selectors.products.item.parent);
    if (!parent) return null;

    return {
      id: parent.dataset.id,
      title: CartDOM.getElement(CartConfig.selectors.products.item.title, parent).textContent.trim(),
      img: CartDOM.getElement(CartConfig.selectors.products.item.image, parent).src,
      count: +CartDOM.getElement(CartConfig.selectors.products.item.quantity.value, parent).textContent
    };
  }

  static animateProductAddition(event, productData) {
    const productImage = CartDOM.getElement(
      CartConfig.selectors.products.item.image,
      event.target.closest(CartConfig.selectors.products.item.parent)
    );

    const targetItem = this.findCartItem(productData.id)
      || CartDOM.getElement(CartConfig.selectors.cart.parent);

    const flyingImage = CartAnimations.createFlyingImage(productImage, CartConfig);
    document.body.appendChild(flyingImage);

    const startPos = CartDOM.calculatePosition(productImage);
    const endPos = CartDOM.calculatePosition(targetItem);

    CartAnimations.animateElement(flyingImage, startPos, endPos);
  }

  static findCartItem(productId) {
    const items = Array.from(document.querySelectorAll(CartConfig.selectors.cart.item.parent));
    return items.reverse().find(item => item.dataset.id === productId);
  }

  static handleClearCart(event) {
    if (!event.target.closest(CartConfig.selectors.cart.clearBtn)) return;

    CartStorage.clear();
    CartUI.updateCartItems([], null);
    CartUI.updateCartVisibility(false);
    CartAnimations.cancelAll();
  }

  static loadInitialCart() {
    const products = CartStorage.getProducts();
    CartUI.updateCartItems(products, null);
    CartUI.updateCartVisibility(products.length > 0);
  }
}

// Инициализация
CartManager.init();