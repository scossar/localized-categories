import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';
import ApplicationRoute from 'discourse/routes/application';

function initializePlugin(api) {
  const siteSettings = api.container.lookup('site-settings:main');
  const availableLocales = siteSettings.available_locales.split('|');
  const defaultLocale = I18n.defaultLocale;
  let updateMessage = 'The site locale is being updated';

  const updateLocale = function (categorySlug, user) {
    // Don't update the locale if there isn't a logged in user.
    if (user) {

      // Test if the category is a locale.
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
        // The category isn't a locale. Update the locale to the user's locale.
        updateUserLocale(user);
      }
    }
  };

  const updateUserLocale = function (user) {
    if (user) {
      let userLocale = user.locale;
      userLocale = userLocale ? userLocale : defaultLocale;
      if (I18n.currentLocale() !== userLocale) {
        Ember.$('body').addClass('locale-reload');
        location.reload(true);
      } else {
        Ember.$('body').removeClass('locale-reload');
      }
    }
  };

  if (siteSettings.localized_categories_enabled) {
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

    DiscoveryCategoriesRoute.reopen({
      actions: {
        didTransition() {
          this._localeChanged();
          this._super();
          return true;
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
        let filter = null;

        if (discoveryTopics) {
          filter = discoveryTopics.get('filter');

          if (filter) {
            if (filter.indexOf('/') !== -1) {
              filter = filter.split('/')[1]
            }
            updateLocale(filter, Discourse.User.current());
          }
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
          updateLocale(category.get('slug'), Discourse.User.current());
        }
      }
    });

    api.decorateWidget('header:after', dec => {
      return dec.h('div.loading-screen', [
          dec.h('div.loading-message', updateMessage),
          dec.h('div.spinner')
        ]
      );
    });
  }
}

export default {
  name: 'extend-for-localized-categories',
  initialize() {
    withPluginApi('0.1', api => initializePlugin(api));
  }
}