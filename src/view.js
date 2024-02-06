/* eslint-disable no-constant-condition */
/* eslint-disable default-case */
const createElement = (tag, classes = [], textContent = '') => {
  const element = document.createElement(tag);
  element.classList.add(...classes);
  element.textContent = textContent;

  return element;
};

const createLink = (post, state, classes = []) => {
  const { id, link, title } = post;
  const postLink = document.createElement('a');
  postLink.classList.add(...classes);
  postLink.textContent = title;
  postLink.setAttribute('href', link);
  postLink.setAttribute('data-id', id);
  postLink.setAttribute('target', '_blank');
  postLink.setAttribute('rel', 'noopener noreferrer');

  if (state.uiState.visitedPostsId.has(id)) {
    postLink.classList.remove('fw-bold');
    postLink.classList.add('link-secondary', 'fw-normal');
  }

  return postLink;
};

const createButton = (classes = [], dataId = '', textContent = '', type = 'button', dataBsToggle = 'modal', dataBsTarget = '#modal') => {
  const button = document.createElement('button');
  button.classList.add(...classes);
  button.textContent = textContent;
  button.setAttribute('data-id', dataId);
  button.setAttribute('type', type);
  button.setAttribute('data-bs-toggle', dataBsToggle);
  button.setAttribute('data-bs-target', dataBsTarget);

  return button;
};

const renderPost = (state, elements, i18n) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const divCard = createElement('div', ['card', 'border-0']);
  const divCardBody = createElement('div', ['card-body']);
  const postsHeader = createElement('h2', ['card-title', 'h4'], i18n.t('posts'));
  divCardBody.append(postsHeader);

  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-0', 'rounded-0');
  divCardBody.appendChild(postsHeader);
  divCard.appendChild(divCardBody);
  divCard.appendChild(ulPosts);

  state.content.postsItems.map((post) => {
    const liPosts = createElement('li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);

    const postLink = createLink(post, state, 'fw-bold');

    const viewingButton = createButton(['btn', 'btn-outline-primary', 'btn-sm'], post.id, i18n.t('viewing'));
    liPosts.appendChild(postLink);
    liPosts.appendChild(viewingButton);
    ulPosts.prepend(liPosts);

    return ulPosts;
  });

  postsContainer.appendChild(divCard);
};

const renderFeeds = (state, elements, i18n) => {
  const clearedFeedsContainer = elements.feedsContainer;
  clearedFeedsContainer.innerHTML = '';

  const divCard = createElement('div', ['card', 'border-0']);
  const divCardBody = createElement('div', ['card-body']);
  const feedsHeader = createElement('h2', ['card-title', 'h4'], i18n.t('feeds'));
  const ulFeeds = createElement('ul', ['list-group', 'border-0', 'rounded-0']);

  state.content.feedsContent.map((feed) => {
    const liFeeds = createElement('li', ['list-group-item', 'border-0', 'border-end-0']);
    const feedTitle = createElement('h3', ['h6', 'm-0'], feed.title);
    const feedDescription = createElement('p', ['m-0', 'small', 'text-black-50'], feed.description);

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

const renderModal = (state, elements) => {
  const { modalTitle, modalDescription, modalReadFullArticle } = elements;
  const postId = state.uiState.activePostId;
  const posts = state.content.postsItems;

  const currentPost = posts.find((post) => postId === post.id);

  if (currentPost) {
    modalTitle.textContent = currentPost.title;
    modalDescription.textContent = currentPost.description;
    modalReadFullArticle.href = currentPost.link;
  }
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
      renderFeeds(state, elements, i18n);
      break;

    case 'content.postsItems':
      renderPost(state, elements, i18n);
      break;

    case 'uiState.visitedPostsId':
      renderPost(state, elements, i18n);
      break;

    case 'uiState.modalMode':
      renderModal(state, elements);
      break;

    default:
      break;
  }
};

export default render;
