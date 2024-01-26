/* eslint-disable no-constant-condition */
/* eslint-disable default-case */
const createAndAppendElement = (tag, classes = [], textContent = '') => {
  const element = document.createElement(tag);
  element.classList.add(...classes);
  element.textContent = textContent;

  return element;
};

const createAndAppendLink = (classes = [], hrefVal = '', dataId = '', textContent = '') => {
  const element = document.createElement('a');
  element.classList.add(...classes);
  element.textContent = textContent;
  element.setAttribute('href', hrefVal);
  element.setAttribute('data-id', dataId);
  element.setAttribute('target', '_blank');
  element.setAttribute('rel', 'noopener noreferrer');

  return element;
};

const renderPost = (state, elements, i18n) => {
  const clearedPostsContainer = elements.postsContainer;
  clearedPostsContainer.innerHTML = '';

  const divCard = createAndAppendElement('div', ['card', 'border-0']);
  const divCardBody = createAndAppendElement('div', ['card-body']);
  const postsHeader = createAndAppendElement('h2', ['card-title', 'h4'], i18n.t('posts'));
  divCardBody.append(postsHeader);

  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  divCardBody.appendChild(postsHeader);
  divCard.appendChild(divCardBody);
  divCard.appendChild(ulPosts);

  state.content.postsItems.map((post) => {
    const liPosts = createAndAppendElement('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);
    ulPosts.appendChild(liPosts);
    const postLink = createAndAppendLink(['fw-bold'], post.link, post.id, post.title);
    liPosts.appendChild(postLink);

    return postLink;
  });

  elements.postsContainer.appendChild(divCard);
};

const renderFeeds = (state, elements, i18n) => {
  const clearedFeedsContainer = elements.feedsContainer;
  clearedFeedsContainer.innerHTML = '';

  const divCard = createAndAppendElement('div', ['card', 'border-0']);
  const divCardBody = createAndAppendElement('div', ['card-body']);
  const feedsHeader = createAndAppendElement('h2', ['card-title', 'h4'], i18n.t('feeds'));
  const ulFeeds = createAndAppendElement('ul', ['list-group', 'border-0', 'rounded-0']);

  state.content.feedsContent.map((feed) => {
    const liFeeds = createAndAppendElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    const feedTitle = createAndAppendElement('h3', ['h6', 'm-0'], feed.title);
    const feedDescription = createAndAppendElement('p', ['m-0', 'small', 'text-black-50'], feed.description);

    liFeeds.appendChild(feedTitle);
    liFeeds.appendChild(feedDescription);

    ulFeeds.insertBefore(liFeeds, ulFeeds.firstChild);

    return liFeeds;
  });

  divCardBody.appendChild(feedsHeader);
  divCard.appendChild(divCardBody);
  divCard.appendChild(ulFeeds);

  elements.feedsContainer.append(divCard);
};

const handleStatus = (status, elements, i18n) => {
  const updatedElements = { ...elements };

  const enableFormInputs = () => {
    elements.buttonAddUrl.removeAttribute('disabled');
    elements.input.removeAttribute('disabled', true);
  };

  const disableFormInputs = () => {
    elements.buttonAddUrl.setAttribute('disabled', true);
    elements.input.setAttribute('disabled', true);
    elements.input.classList.remove('is-invalid');
  };

  switch (status) {
    case 'filling':
      enableFormInputs();
      break;

    case 'sending':
      disableFormInputs();
      break;

    case 'failed':
      enableFormInputs();
      elements.input.classList.add('is-invalid');
      break;

    case 'sent':
      enableFormInputs();
      elements.input.classList.remove('is-invalid');
      elements.feedbackMessage.classList.remove('text-danger');
      elements.feedbackMessage.classList.add('text-success');
      updatedElements.feedbackMessage.textContent = i18n.t('successfulUrl');

      elements.input.focus();
      elements.form.reset();
      break;

    default:
      break;
  }

  return updatedElements;
};

const handleError = (errorType, elements, i18n) => {
  const updatedElements = { ...elements };
  elements.input.classList.add('is-invalid');
  elements.feedbackMessage.classList.add('text-danger');
  updatedElements.feedbackMessage.textContent = i18n.t(errorType.key);

  return updatedElements;
};

const handleNetworkError = (errorType, elements, i18n) => {
  const updatedElements = { ...elements };
  elements.input.classList.add('is-invalid');
  elements.feedbackMessage.classList.add('text-danger');
  updatedElements.feedbackMessage.textContent = i18n.t('networkError');

  return updatedElements;
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'form.status':
      handleStatus(value, elements, i18n);
      break;

    case 'form.error':
      handleError(value, elements, i18n);
      break;

    case 'networkError':
      handleNetworkError(value, elements, i18n);
      break;

    case 'feeds.succesed':
      renderPost(state, elements, i18n);
      renderFeeds(state, elements, i18n);
      break;

    default:
      break;
  }
};

export default render;
