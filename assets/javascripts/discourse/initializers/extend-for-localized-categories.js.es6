import {withPluginApi} from 'discourse/lib/plugin-api';
import {ajax} from 'discourse/lib/ajax';
import {popupAjaxError} from 'discourse/lib/ajax-error';
import TopicRoute from 'discourse/routes/topic';
import DiscoveryRoute from 'discourse/routes/discovery';
import DiscoveryCategoriesRoute from 'discourse/routes/discovery-categories';
import ApplicationRoute from 'discourse/routes/application';

function initializePlugin(api) {
  const siteSettings = api.container.lookup('site-settings:main');
  const availableLocales = siteSettings.available_locales.split('|');
  let newLocale = I18n.defaultLocale;
  let isLocalizedCategory = false;

  const updateLocaleForUser = function () {
    if (Discourse.User.current()) {
      let username = Discourse.User.current().get('username');
      api.container.lookup('store:main').find('user', username).then(function (user) {
        let userLocale = user.get('locale');
        userLocale = userLocale ? userLocale : I18n.defaultLocale;
        if (I18n.locale !== userLocale) {
          Ember.$('body').addClass('locale-reload');
          location.reload(true);
        }
      });
    } else if (I18n.defaultLocale !== I18n.locale) {
      Ember.$('body').addClass('locale-reload');
      location.reload(true);
    }
  };

  const updateLocaleForCategory = function (slug) {
    let categorySlug = slug.replace('-', '_');
    // let isLocale = false;
    availableLocales.forEach(function (locale) {
      if (locale.toLowerCase() === categorySlug) {
        isLocalizedCategory = true;
      }
    });

    if (isLocalizedCategory) {
      if (categorySlug !== I18n.locale.toLowerCase()) {
        Ember.$('body').addClass('locale-reload');
        location.reload(true);
      }
    } else {
      updateLocaleForUser();
    }
  };

  api.decorateWidget('home-logo:after', dec => {
    if (isLocalizedCategory) {
      let categorySlug = I18n.locale.replace('-', '_').toLowerCase();
      console.log('slug', categorySlug);
      return dec.h('div.localized-category-link', [
        dec.h('a', {attributes: {href: '/c/' + categorySlug}}, `${I18n.t('localized_categories_category_link_text')}`)
      ]);
    }
  });

  api.decorateWidget('header:after', dec => {
    return dec.h('div.loading-screen', [
        dec.h('div.loading-message', `${I18n.t('localized_categories_update_message')}`),
        dec.h('i.fa.fa-globe', {attributes: {'aria-hidden': true}})
      ]
    );
  });

  TopicRoute.reopen({
    actions: {
      didTransition() {
        this._didTransition();
        this._super();
      }
    },

    _didTransition() {
      let topicModel = this.modelFor('topic');

      if (topicModel.get('category')) {
        let category = topicModel.get('category');
        if (category.get('parentCategory')) {
          category = category.get('parentCategory');
        }

        let categorySlug = category.get('slug');
        updateLocaleForCategory(categorySlug);
      } else {
        let topicId = topicModel.get('id');
        if (topicId) {

          ajax('/t/' + topicId).then(function (result) {
            let categoryId = result.category_id;
            if (categoryId) {
              let category = Discourse.Category.findById(categoryId);
              if (category.get('parentCategory')) {
                category = category.get('parentCategory');
              }
              let categorySlug = category.get('slug');
              updateLocaleForCategory(categorySlug);
            }
          }).catch(popupAjaxError);
        }
      }
    }
  });

  DiscoveryRoute.reopen({
    actions: {
      didTransition() {
        this._didTransition();
        this._super();
      }
    },

    _didTransition() {
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

  DiscoveryCategoriesRoute.reopen({
    actions: {
      didTransition() {
        this._didTransition();
        this._super();
        return true;
      }
    },

    _didTransition() {
      updateLocaleForUser();
    }
  });

  ApplicationRoute.reopen({
    actions: {
      didTransition() {
        this._didTransition();
        this._super();
      }
    },

    _didTransition() {
      updateLocaleForUser();
    }
  });

}

export default {
  name: 'extend-for-localized-categories',
  initialize() {
    withPluginApi('0.5', api => initializePlugin(api));
  }
}
