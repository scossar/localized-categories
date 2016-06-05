import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import ApplicationRoute from 'discourse/routes/application';

function initializePlugin(api) {
  const siteSettings = api.container.lookup('site-settings:main');
  const availableLocales = siteSettings.available_locales.split('|');
  const defaultLocale = I18n.defaultLocale;

  ApplicationRoute.reopen({
    actions: {
      didTransition() {
        this._localeChanged();
        this._super();
      }
    },

    _localeChanged() {
      let userLocale = Discourse.User.current().get('locale') || defaultLocale;
      if (I18n.currentLocale() !== userLocale) {
        Ember.$('body').addClass('locale-reload');
      } else {
        Ember.$('body').removeClass('locale-reload');
      }
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
      let catIsLocale = false;
      let filter;

      if (discoveryTopics) {
        filter = discoveryTopics.get('filter');
      }

      if (filter) {
        filter = filter.replace('-', '_');
        if (filter.indexOf('/')) {
          filter = filter.split('/')[1]
        }
        availableLocales.forEach(function (locale) {
          if (locale.toLowerCase() === filter) {
            catIsLocale = true;
          }
        });
      }

      if (catIsLocale) {
        if (filter !== I18n.currentLocale().toLowerCase()) {
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

        let categorySlug = category.get('slug').replace('-', '_');
        let catIsLocale = false;

        availableLocales.forEach(function (locale) {
          if (locale.toLowerCase() === categorySlug) {
            catIsLocale = true;
          }
        });

        if (catIsLocale) {
          if (categorySlug !== I18n.currentLocale()) {
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
      }
    }
  });

  let refreshMessageStart = 'The site locale has changed. ';
  let refreshMessageHere = 'here';

  // api.decorateWidget('header:after', helper => {
  //   return helper.h('span.refresh-notice',
  //     helper.h('span.refresh', [
  //     refreshMessageStart,
  //     helper.h('a.refresh-link', {
  //       href: '#',
  //       onclick: function (e) {
  //         location.reload(true);
  //         e.preventDefault();
  //       }
  //     }, refreshMessageHere)]))
  // });

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