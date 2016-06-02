# name: localized-categories
# about: sets the locale for categories that share the name of an available locale

after_initialize do
  ListController.class_eval do

    def set_category
      super

      category_sym = @category.name.to_sym
      if I18n.available_locales.include? category_sym
        I18n.locale = category_sym
      end
    end

  end

  TopicsController.class_eval do

    def show
      if params[:topic_id]
        tmp_topic = Topic.find(params[:topic_id])
      else
        tmp_topic = Topic.find_by(slug: params[:id].downcase)
      end
      if tmp_topic
        category_locale = tmp_topic.category.name.to_sym
        if I18n.available_locales.include? category_locale
          I18n.locale = category_locale
        end
      end

      super
    end

  end
end