import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import _ from 'lodash';
import { setLocale } from 'yup';
import axios from 'axios';
import render from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

const app = () => {
  const initialState = {
    form: {
      currentLink: '',
      status: 'filling',
      error: null,
    },
    feeds: {
      addedUrl: [],
      succesed: null,
    },
    content: {
      postsItems: [],
      feedsContent: [],
    },
    networkError: null,
  };

  const addedLinks = initialState.feeds.addedUrl;

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    buttonAddUrl: document.querySelector('button[type="submit"]'),
    feedbackMessage: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const i18nInstance = i18n.createInstance();

  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      setLocale({
        mixed: {
          notOneOf: () => ({ key: 'urlIsAlreadyExist' }),
        },
        string: {
          url: () => ({ key: 'invalidUrl' }),
          matches: () => ({ key: 'urlWithoutRss' }),
        },
      });
    });

  const validateLink = (url) => {
    const schema = yup
      .string()
      .trim()
      .url()
      .notOneOf(addedLinks)
      .matches(/\b(rss|feed)\b/i)
      .required()

      .validate(url);
    return schema;
  };

  const watchedState = onChange(initialState, render(initialState, elements, i18nInstance));

  const fetchUrl = (link) => axios
    .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { error: 'Failed to fetch data' };
    })
    .then((data) => data.contents);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const currentUrl = formData.get('url');
    initialState.form.error = null;
    watchedState.feeds.succesed = null;
    watchedState.form.status = 'sending';

    validateLink(currentUrl)
      .then((validLink) => fetchUrl(validLink))
      .then((response) => {
        const parsedData = parse(response);
        watchedState.feeds.addedUrl.push(currentUrl);

        return parsedData;
      })
      .then((doc) => {
        const postsItemsData = Array.from(doc.querySelectorAll('item'));
        postsItemsData.map((item) => {
          const postLink = item.querySelector('link');
          const postTitle = item.querySelector('title');
          const postDescription = item.querySelector('description');

          watchedState.content.postsItems.push({
            id: _.uniqueId(),
            link: postLink.textContent,
            title: postTitle.textContent,
            description: postDescription.textContent,
          });

          return watchedState.content.postsItems;
        });

        const feedsTitlesData = doc.querySelector('title');
        const feedsDescription = doc.querySelector('description');

        watchedState.content.feedsContent.push({
          id: _.uniqueId(),
          title: feedsTitlesData.textContent,
          description: feedsDescription.textContent,
        });

        watchedState.form.status = 'sent';
        watchedState.feeds.succesed = true;
      })
      .catch((error) => {
        watchedState.form.status = 'failed';
        if (error.message === 'Network Error') {
          console.log('Network Error details:', error);
          watchedState.networkError = 'networkError';
        } else {
          watchedState.form.error = error.message;
          console.log(error.message);
        }
      });
  });
};
export default app;
