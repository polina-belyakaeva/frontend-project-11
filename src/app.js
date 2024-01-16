import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import { setLocale } from 'yup';
import render from './view.js';
import resources from './locales/index.js';

const app = () => {
  const initilState = {
    form: {
      currentLink: '',
      status: 'filling',
      error: null,
    },
    feeds: {
      addedUrl: [],
    },
  };

  const addedLinks = initilState.feeds.addedUrl;

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    buttonAddUrl: document.querySelector('button[type="submit"]'),
    feedbackMessage: document.querySelector('.feedback'),
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
      .matches(/rss/i)
      .required()

      .validate(url);
    return schema;
  };

  const watchedState = onChange(initilState, render(initilState, elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';

    const formData = new FormData(e.target);
    const currentUrl = formData.get('url');
    initilState.form.error = null;

    validateLink(currentUrl)
      .then((valid) => {
        watchedState.feeds.addedUrl.push(valid);
        watchedState.form.status = 'sent';
      })
      .catch((error) => {
        watchedState.form.status = 'failed';
        watchedState.form.error = error.message;
      });
  });
};
export default app;
