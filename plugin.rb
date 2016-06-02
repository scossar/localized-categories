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

      if request.referer
        flash["referer"] ||= request.referer[0..255]
      end

      # We'd like to migrate the wordpress feed to another url. This keeps up backwards compatibility with
      # existing installs.
      return wordpress if params[:best].present?

      # work around people somehow sending in arrays,
      # arrays are not supported
      params[:page] = params[:page].to_i rescue 1

      opts = params.slice(:username_filters, :filter, :page, :post_number, :show_deleted)
      username_filters = opts[:username_filters]

      opts[:slow_platform] = true if slow_platform?
      opts[:username_filters] = username_filters.split(',') if username_filters.is_a?(String)

      begin
        @topic_view = TopicView.new(params[:id] || params[:topic_id], current_user, opts)
      rescue Discourse::NotFound
        if params[:id]
          topic = Topic.find_by(slug: params[:id].downcase)
          return redirect_to_correct_topic(topic, opts[:post_number]) if topic
        end
        raise Discourse::NotFound
      end


      page = params[:page]
      if (page < 0) || ((page - 1) * @topic_view.chunk_size > @topic_view.topic.highest_post_number)
        raise Discourse::NotFound
      end

      discourse_expires_in 1.minute

      redirect_to_correct_topic(@topic_view.topic, opts[:post_number]) && return if slugs_do_not_match || (!request.format.json? && params[:slug].nil?)

      track_visit_to_topic

      if should_track_visit_to_topic?
        @topic_view.draft = Draft.get(current_user, @topic_view.draft_key, @topic_view.draft_sequence)
      end

      unless @topic_view.topic.visible
        response.headers['X-Robots-Tag'] = 'noindex'
      end

      canonical_url UrlHelper.absolute_without_cdn(@topic_view.canonical_path)

      perform_show_response

    rescue Discourse::InvalidAccess => ex

      if current_user
        # If the user can't see the topic, clean up notifications for it.
        Notification.remove_for(current_user.id, params[:topic_id])
      end

      if ex.obj && Topic === ex.obj && guardian.can_see_topic_if_not_deleted?(ex.obj)
        rescue_discourse_actions(:not_found, 410)
        return
      end

      raise ex

    end
  end
end

