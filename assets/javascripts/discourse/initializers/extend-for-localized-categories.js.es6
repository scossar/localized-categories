import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';
import ApplicationRoute from 'discourse/routes/application';

function initializePlugin(api) {
  const siteSettings = api.container.lookup('site-settings:main');
  const availableLocales = siteSettings.available_locales.split('|');
  let updateMessage = 'The site locale is being updated';

  const updateLocaleForCategory = function (categorySlug) {
      categorySlug = categorySlug.replace('-', '_');
      let isLocale = false;
      availableLocales.forEach(function (locale) {
        if (locale.toLowerCase() === categorySlug) {
          isLocale = true;
        }
      });

      if (isLocale) {
        if (categorySlug !== I18n.currentLocale().toLowerCase()) {
          // Ember.$('body').addClass('locale-reload locale-changed');
          Ember.$('body').addClass('locale-reload');
          location.reload(true);
        } else {
          Ember.$('body').addClass('locale-changed');
          Ember.$('body').removeClass('locale-reload');
        }
      } else {
        restoreLocale();
      }
  };

  const restoreLocale = function () {
    if ( Ember.$('body').hasClass('locale-changed')) {
      Ember.$('body').addClass('locale-reload');
      location.reload(true);
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
        restoreLocale();
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
        restoreLocale();
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
            updateLocaleForCategory(filter);
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
          updateLocaleForCategory(category.slug);
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