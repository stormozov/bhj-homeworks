function initModalOneTimeView(config) {
  const elements = getElementsBySelector(config.selectors);
  modalEvents(elements, config);
}

function getElementsBySelector(selectors) {
  return Object
    .entries(selectors)
    .reduce((acc, [key, selector]) => {
      acc[key] = document.querySelector(selector);
      return acc;
    }, {});
}

function modalEvents(elements, config) {
  document.addEventListener('DOMContentLoaded', () => {
    handleShowModal(elements.modal, config);
  });
  elements.modal.addEventListener('click', (e) => {
    const isCloseTarget = e.target === elements.modal || e.target === elements.closeBtn;
    handleCloseModal(isCloseTarget, elements.modal, config);
  });
}

function handleShowModal(modal, config) {
  if (!getCookie(config.cookieConfig.name)) {
    setTimeout(() => modal.classList.add(config.activeClasses.modal), 500);
  }
}

function handleCloseModal(isCloseTarget, modal, config) {
  if (isCloseTarget) {
    modal.classList.remove(config.activeClasses.modal);
    setCookie(config.cookieConfig);
  }
}

function setCookie({ name, value, days, path = '/' }) {
  const date = new Date();

  if (days) {
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  }

  const expires = days ? 'expires=' + date.toUTCString() : '';
  document.cookie = `${name}=${value};${expires};path=${path}`;
}

function getCookie(name) {
  const matches = document.cookie.match(new RegExp(
    '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)' ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

initModalOneTimeView({
  selectors: {
    modal: '#subscribe-modal',
    closeBtn: '.modal__close',
  },
  activeClasses: {
    modal: 'modal--active',
  },
  cookieConfig: {
    name: 'popup',
    value: 'true',
    days: 0.00011574,
    path: '/',
  }
});
