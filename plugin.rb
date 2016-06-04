# name: localized-categories
# about: sets the locale for categories that share the name of an available locale

register_asset 'stylesheets/category-locale.scss'

after_initialize do

  module CategoryLocale
    def set_tmp_locale cat
      if parent_cat_id = cat.parent_category_id
        parent_cat = Category.find parent_cat_id
        parent_sym = parent_cat.name.to_sym
        locale_from_sym parent_sym
      else
        cat_sym = cat.name.to_sym
        locale_from_sym cat_sym
      end
    end

    def locale_from_sym sym
      if I18n.available_locales.include? sym
        I18n.locale = sym
      end
    end

  end

  ListController.class_eval do
    include CategoryLocale
    alias_method :super_set_category, :set_category

    def set_category
      super_set_category
      set_tmp_locale @category
    end
  end

  TopicsController.class_eval do
    include CategoryLocale
    alias_method :super_show, :show

    def show
      if params[:topic_id]
        topic = Topic.find(params[:topic_id])
      elsif params[:id]
        topic = Topic.find_by(slug: params[:id].downcase)
      end
      if topic
        set_tmp_locale topic.category
      end

      super_show
    end
  end
end

