import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import ApplicationRoute from 'discourse/routes/application';
// import SetCategoryLocale from 'discourse/plugins/localized-categories/discourse/mixins/set-category-locale';

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
      let user = Discourse.User.current;
      if (I18n.currentLocale() !== (user.get('locale') || I18n.defaultLocale)) {
        Ember.$('body').addClass('locale-changed');
      } else {
        Ember.$('body').removeClass('locale-changed');
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
          Ember.$('body').addClass('locale-changed');
          location.reload(true);
        } else {
          Ember.$('body').removeClass('locale-changed');
        }
      } else {
        let user = Discourse.User.current();
        if (I18n.currentLocale() !== (user.get('locale') || defaultLocale)) {
          Ember.$('body').addClass('locale-changed');
          location.reload(true);
        } else {
          Ember.$('body').removeClass('locale-changed');
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

        if(category.get('parentCategory')) {
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
            Ember.$('body').addClass('locale-changed');
            location.reload(true);
          } else {
            Ember.$('body').removeClass('locale-changed');
          }
        } else {
          let user = Discourse.User.current();
          if (I18n.currentLocale() !== (user.get('locale') ||  defaultLocale)) {
            Ember.$('body').addClass('locale-changed');
            location.reload(true);
          } else {
            Ember.$('body').removeClass('locale-changed');
          }
        }
      }
    }
  });
  
  let refreshMessageStart = 'The site locale has changed. ';
  let refreshMessageHere = '';

  api.decorateWidget('home-logo:after', helper => {
    return helper.h('span.refresh-notice',
      helper.h('span.refresh', [
      refreshMessageStart,
      helper.h('a.refresh-link', {
        href: '#',
        onclick: function (e) {
          location.reload(true);
          e.preventDefault();
        }
      }, refreshMessageHere)]))
  });
}

export default {
  name: 'extend-for-localized-categories',
  initialize() {
    withPluginApi('0.1', api => initializePlugin(api));
  }
}