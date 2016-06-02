# name: localized-categories
# about: sets the locale for categories that share the name of an available locale

after_initialize do

  ListController.class_eval do
    alias_method :super_set_category, :set_category

    def set_category
      super_set_category

      category_sym = @category.name.to_sym
      if I18n.available_locales.include? category_sym
        I18n.locale = category_sym
      end
    end
  end

  TopicsController.class_eval do
    alias_method :super_show, :show

    def show
      if params[:topic_id]
        tmp_topic = Topic.find(params[:topic_id])
      elsif params[:id]
        tmp_topic = Topic.find_by(slug: params[:id].downcase)
      end
      if tmp_topic
        category_sym = tmp_topic.category.name.to_sym
        if I18n.available_locales.include? category_sym
          I18n.locale = category_sym
        end
      end

      super_show
    end
  end
end

