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

  end

  ListController.class_eval do
    include CategoryLocale
    alias_method :super_set_category, :set_category

    def set_category
      super_set_category

      if @category && SiteSetting.localized_categories_enabled
        set_tmp_locale @category
      end
    end
  end

  TopicsController.class_eval do
    include CategoryLocale
    alias_method :super_show, :show

    def show
      if SiteSetting.localized_categories_enabled
        if params[:topic_id]
          topic = Topic.find(params[:topic_id])
        elsif params[:id]
          topic = Topic.find_by(slug: params[:id].downcase)
        end
        if topic && topic.category_id
          set_tmp_locale topic.category
        end
      end

      super_show
    end
  end
end

