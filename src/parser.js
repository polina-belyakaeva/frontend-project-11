import _ from 'lodash';

export default (contents, watchedState) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'application/xml');
  const error = doc.querySelector('parsererror');
  const updatedWatchedState = { ...watchedState };

  if (error) {
    updatedWatchedState.form = {
      ...updatedWatchedState.form,
      error: error.message,
    };
  }

  const channel = doc.querySelector('channel');
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescription = channel.querySelector('description').textContent;
  const feedLink = channel.querySelector('link').textContent;
  const currentFeeds = updatedWatchedState.content.feedsContent;
  const feedExists = currentFeeds.some((feed) => feed.title === feedTitle);
  if (!feedExists) {
    updatedWatchedState.content.feedsContent.push({
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    });
  }

  const items = Array.from(doc.querySelectorAll('item'));
  const posts = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;

    return {
      id: _.uniqueId(),
      title,
      description,
      link,
    };
  });

  const postItems = updatedWatchedState.content.postsItems;
  const uniqueNewPosts = posts.filter((newPost) => (
    !postItems.some((existingPost) => existingPost.link === newPost.link)
  ));

  updatedWatchedState.content.postsItems.push(...uniqueNewPosts);
};
