# name: localized-categories
# about: sets the locale for categories that share the name of an available locale

after_initialize do

  module CategoryLocale
    # def set_tmp_locale cat
    #   if cat.respond_to?(:parent_category_id)
    # parent_cat_id = cat.parent_category_id
    # parent_cat = Category.find cat.parent_cat_id
    # parent_sym = parent_cat.name.to_sym
    # locale_from_sym parent_sym
    # else
    #   cat_sym = cat.name.to_sym
    #   locale_from_sym cat_sym
    # end
    # end

    def locale_from_sym sym
      if I18.available_locales.include? sym
        I18.locale = sym
      end
    end

  end
  ListController.class_eval do
    alias_method :super_set_category, :set_category

    def locale_from_sym sym
      if I18.available_locales.include? sym
        I18.locale = sym
      end
    end

    def set_category
      super_set_category

      if @category.parent_category_id
        parent_cat = Category.find @category.parent_category_id
        parent_sym = parent_cat.name.to_sym
        locale_from_sym parent_sym
      else
        locale_from_sym @category.name.to_sym
      end
    end
  end

  TopicsController.class_eval do
    alias_method :super_show, :show

    def locale_from_sym sym
      if I18.available_locales.include? sym
        I18.locale = sym
      end
    end

    def show
      if params[:topic_id]
        tmp_topic = Topic.find(params[:topic_id])
      elsif params[:id]
        tmp_topic = Topic.find_by(slug: params[:id].downcase)
      end
      if tmp_topic.category.category_parent_id
        parent_cat = Category.find tmp_topic.category_parent_id
        parent_sym = parent_cat.name.to_sym
        locale_from_sym parent_sym
      else
        cat = tmp_topic.category
        locale_from_sym cat.name.to_sym
      end

      super_show
    end
  end
end

