import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import ApplicationRoute from 'discourse/routes/application';

function initializePlugin(api) {
  const siteSettings = api.container.lookup('site-settings:main');
  const availableLocales = siteSettings.available_locales.split('|');
  const defaultLocale = I18n.defaultLocale;

  const updateLocale = function (categorySlug) {
    categorySlug = categorySlug.replace('-', '_');
    let isLocale = false;
    availableLocales.forEach(function (locale) {
      if (locale.toLowerCase() === categorySlug) {
        isLocale = true;
      }
    });

    if (isLocale) {
      if (categorySlug !== I18n.currentLocale().toLowerCase()) {
        Ember.$('body').addClass('locale-reload');
        location.reload(true);
      } else {
        Ember.$('body').removeClass('locale-reload');
      }
    } else {
      let user = Discourse.User.current();
      if (I18n.currentLocale() !== (user.get('locale') || defaultLocale)) {
        Ember.$('body').addClass('locale-reload');
        location.reload(true);
      } else {
        Ember.$('body').removeClass('locale-reload');
      }
    }
  };

  const updateUserLocale = function (user) {
    console.log('stuck in updating user locale');
    let userLocale = user.get('locale') || defaultLocale;
    console.log('default locale', userLocale);
    if (I18n.currentLocale() !== userLocale) {
      Ember.$('body').addClass('locale-reload');
    } else {
      Ember.$('body').removeClass('locale-reload');
    }
  };

  ApplicationRoute.reopen({
    actions: {
      didTransition() {
        this._localeChanged();
        this._super();
      }
    },

    _localeChanged() {
      updateUserLocale(Discourse.User.current());
    }
  });

  DiscoveryRoute.reopen({
    actions: {
      didTransition() {
        this._localeChanged();
        this._super();
      }
    },

    _localeChanged() {
      let discoveryTopics = this.controllerFor('discovery/topics').get('model');

      if (discoveryTopics) {
        let filter = discoveryTopics.get('filter');

        if (filter) {
          if (filter.indexOf('/') !== -1) {
            filter = filter.split('/')[1]
          }
          updateLocale(filter);
        } else {
          updateUserLocale(Discourse.User.current());
        }
      } else {
        updateUserLocale(Discourse.User.current());
      }
    }
  });

  TopicRoute.reopen({
    actions: {
      didTransition() {
        this._localeChanged();
        this._super();
      }
    },

    _localeChanged() {
      let currentTopic = this.modelFor('topic');
      if (currentTopic.get('category')) {
        let category = currentTopic.get('category');
        if (category.get('parentCategory')) {
          category = category.get('parentCategory');
        }
        updateLocale(category.get('slug'));
      }
    }
  });

  api.decorateWidget('header:after', dec => {
    return dec.h('div.loading-screen', [
        dec.h('div.loading-message', 'The site locale is being updated.'),
        dec.h('div.spinner')
      ]
    );
  });
}

export default {
  name: 'extend-for-localized-categories',
  initialize() {
    withPluginApi('0.1', api => initializePlugin(api));
  }
}