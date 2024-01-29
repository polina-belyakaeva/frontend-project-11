import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import _ from 'lodash';
import { setLocale } from 'yup';
import axios from 'axios';
import render from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

const parsePosts = (parsedData, watchedState) => {
  const newPosts = Array.from(parsedData.querySelectorAll('item')).map((item) => {
    const { textContent: link } = item.querySelector('link');
    const { textContent: title } = item.querySelector('title');
    const { textContent: description } = item.querySelector('description');
    return { id: _.uniqueId(), link, title, description };
  });

  const uniqueNewPosts = newPosts.filter((newPost) => !watchedState.content.postsItems.some((existingPost) => existingPost.link === newPost.link));

  watchedState.content.postsItems.push(...uniqueNewPosts);

  return uniqueNewPosts;
};

const updateRssFlow = (watchedState) => {
  Promise.allSettled(
    watchedState.feeds.addedUrl.map((url) => {
      return fetchUrl(url)
        .then((response) => parse(response))
        .then((parsedData) => {
          const newPosts = parsePosts(parsedData, watchedState);

          return watchedState;
        })
        .catch((error) => {
          console.error('Error fetching or parsing data:', error);

          return watchedState;
        });
    })
  ).then((results) => {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('Error checking for new posts:', result.reason);
      }
    });
  });
};

const updatePostsRegularly = (watchedState) => {
  const updateInterval = 5000;
  const update = () => {
    updateRssFlow(watchedState);
    setTimeout(update, updateInterval);
  };

  update();
};

const fetchUrl = (link) =>
  axios
    .get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}&disableCache=true`)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }

      return { error: 'Failed to fetch data' };
    })
    .then((data) => data.contents);

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
        parsePosts(doc, watchedState);

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
  updatePostsRegularly(watchedState);
};
export default app;
