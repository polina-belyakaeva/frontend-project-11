/* eslint-disable no-constant-condition */
/* eslint-disable default-case */
const handleStatus = (status, elements, i18n) => {
  const updatedElements = { ...elements };
  if (status === 'filling') {
    elements.buttonAddUrl.removeAttribute('disabled');
  }
  if (status === 'sending') {
    elements.buttonAddUrl.setAttribute('disabled', true);
    elements.input.classList.remove('is-invalid');
  }
  if (status === 'failed') {
    elements.buttonAddUrl.removeAttribute('disabled');
    elements.input.classList.add('is-invalid');
  }
  if (status === 'sent') {
    elements.buttonAddUrl.removeAttribute('disabled');
    elements.input.classList.remove('is-invalid');
    elements.feedbackMessage.classList.remove('text-danger');
    elements.feedbackMessage.classList.add('text-success');
    updatedElements.feedbackMessage.textContent = i18n.t('successfulUrl');

    elements.input.focus();
    elements.form.reset();
  }
  return updatedElements;
};

const errorHandler = (errorType, elements, i18n) => {
  const updatedElements = { ...elements };
  elements.input.classList.add('is-invalid');
  elements.feedbackMessage.classList.add('text-danger');
  updatedElements.feedbackMessage.textContent = i18n.t(errorType.key);
  return updatedElements;
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'form.status':
      handleStatus(value, elements, i18n);
      break;

    case 'form.error':
      errorHandler(value, elements, i18n);
      break;

    default:
      break;
  }
};

export default render;
