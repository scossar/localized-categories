import {withPluginApi} from 'discourse/lib/plugin-api';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import ApplicationRoute from 'discourse/routes/application';
import showModal from 'discourse/lib/show-modal';

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
      if (I18n.currentLocale() !== defaultLocale) {
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
      let filter = discoveryTopics.get('filter');
      let catIsLocale = false;

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
        console.log('filter', filter);
        if (filter !== I18n.currentLocale().toLowerCase()) {
          Ember.$('body').addClass('locale-changed');
        } else {
          Ember.$('body').removeClass('locale-changed');
        }
      } else {
        if (I18n.currentLocale() !== defaultLocale) {
          Ember.$('body').addClass('locale-changed');
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
        let categorySlug = currentTopic.get('category.slug').replace('-', '_');
        let catIsLocale = false;
        availableLocales.forEach(function (locale) {
          if (locale.toLowerCase() === categorySlug) {
            catIsLocale = true;
          }
        });
        if (catIsLocale) {
          if (categorySlug !== I18n.currentLocale()) {
            Ember.$('body').addClass('locale-changed');
          } else {
            Ember.$('body').removeClass('locale-changed');
          }
        } else {
          if (I18n.currentLocale() !== defaultLocale) {
            Ember.$('body').addClass('locale-changed');
          } else {
            Ember.$('body').removeClass('locale-changed');
          }
        }
      }
    }
  });
  
  let refreshMessageStart = 'The site locale has changed. Click here to ';
  let refreshMessageHere = 'refresh page ';

  api.decorateWidget('header:after', helper => {
    return helper.h('div.wrap.refresh-notice',
      helper.h('div.refresh', [
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