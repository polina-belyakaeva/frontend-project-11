/* eslint-disable no-constant-condition */
/* eslint-disable default-case */
const render = (state, elements) => (path, value) => {
  switch (path) {
    case 'form.status':
      if (value === 'filling') {
        elements.buttonAddUrl.removeAttribute('disabled');
      }
      if (value === 'sending') {
        elements.buttonAddUrl.setAttribute('disabled', true);
        elements.input.classList.remove('is-invalid');
      }
      if (value === 'failed') {
        elements.buttonAddUrl.removeAttribute('disabled');
        elements.input.classList.add('is-invalid');
      }
      if (value === 'sent') {
        elements.buttonAddUrl.removeAttribute('disabled');
        elements.input.classList.remove('is-invalid');
        elements.input.focus();
        elements.form.reset();
      }
      break;
    default:
      break;
  }
};

export default render;
