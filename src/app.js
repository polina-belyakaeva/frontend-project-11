import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
// import axios from 'axios';

const app = () => {
  const initilState = {
    form: {
      currentLink: '',
      isValid: true,
      status: 'filling',
      errors: [],
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
  };

  const validateLink = (url) => {
    const schema = yup
      .string()
      .trim()
      .url()
      .notOneOf(addedLinks)

      .validate(url);
    return schema;
  };

  const watchedState = onChange(initilState, render(initilState, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = 'sending';
    const formData = new FormData(e.target);
    const currentUrl = formData.get('url');
    initilState.form.errors = [];
    validateLink(currentUrl)
      .then((valid) => {
        watchedState.feeds.addedUrl.push(valid);
        watchedState.form.status = 'sent';
        console.log(watchedState.form.status);
      })
      .catch((error) => {
        watchedState.form.status = 'failed';
        watchedState.form.errors.push(error.message);
        watchedState.form.isValid = false;
        console.log(error.message);
        console.log(watchedState.form.status);
      });
  });
};
export default app;
