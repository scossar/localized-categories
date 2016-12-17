# name: localized-categories
# about: sets the locale for categories and subcategories based on category slug
# version: 0.1
# authors: scossar
# url: https://github.com/scossar/localized-categories

enabled_site_setting :localized_categories_enabled

register_asset 'stylesheets/category-locale.scss'

after_initialize do

  module CategoryLocale
    def set_tmp_locale cat
      if parent_cat_id = cat.parent_category_id
        parent_cat = Category.find parent_cat_id
        slug = parent_cat.slug
        locale_from_slug slug
      else
        locale_from_slug cat.slug
      end
    end

    def locale_from_slug slug
      I18n.available_locales.each do |locale|
        if locale.to_s.downcase == slug.gsub('-', '_')
          I18n.locale = locale
        end
      end
    end

    def allow_tmp_locale? (user)
      # Todo: This has to be checked on the front-end as well. Allow localized categories for all anonymous users for now.
      # SiteSetting.localized_categories_enabled && (user || SiteSetting.localized_categories_allow_anonymous_users)
      SiteSetting.localized_categories_enabled
    end
  end

  ListController.class_eval do
    include CategoryLocale
    alias_method :super_set_category, :set_category

    def set_category
      super_set_category

      if @category && allow_tmp_locale?(current_user)
        set_tmp_locale @category
      end
    end
  end

  TopicsController.class_eval do
    include CategoryLocale
    alias_method :super_show, :show

    def show
      if allow_tmp_locale?(current_user)
        if params[:topic_id]
          topic = Topic.find(params[:topic_id])
        elsif params[:id]
          topic = Topic.find_by(slug: params[:id].downcase)
        end
        if topic && topic.category_id
          set_tmp_locale topic.category
        else
          # It's a private message. Probably the locale should not be changed.
        end
      end

      super_show
    end
  end
end

