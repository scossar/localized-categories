# Discourse Localized Categories

**Note:** this plugin is a work in progress. It is not ready to be used in production. If you would like to try it out in a testing environment, any feedback would be greatly appreciated. The plugin is currently localized for 'ar', 'de', 'en', 'fa_IR', 'fr', and 'he'. All translations were made with Google :)

## Description

The Discourse Localized Categories plugin allows you to create language specific categories for a Discourse forum. When a localized category is entered, the user's locale is automatically switched to the category's locale. When exiting the category, the user's locale is switched back to either the site's default locale, or the user's preferred locale. Sub-categories of a localized category will observer the parent category's locale.

## Installation

Follow the [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157) howto, using
`git clone https://github.com/scossar/localized-categories` as the plugin command.

## Use

To create a localized category, create a category and set its slug as one of the forum's
available locales. The available locales are: 'ar', 'bs_BA', 'cs', 'da', 'de', 'en',
'es', 'et', 'fa_IR', 'fi', 'fr', 'gl', 'he', 'id', 'it', 'ja', 'ko', 'nb_NO', 'nl',
'pl_PL', 'pt', 'pt_BR', 'ro', 'ru', 'sk', 'sq', 'sv', 'te', 'tr_TR', 'uk', 'vi', 
'zh_CN', 'zh_TW'.

The category slug should be set as the locale, with underscores replaced with dashes, and all
letters set to lowercase. For example the locale 'fa_IR' should be written as 'fa-ir'.

## Issues

The plugin isn't very well tested yet. I don't want to break your site. Don't install it on a production site yet.

At this point, the user interface could be a little confusing. A link is being added to the header that links to the parent category's topic list. It would probably be clearer if it linked to a category list for the parent category and it's sub-categories.

Allowing localized categories for anonymous users on sites that are using a CDN will cause problems. A temporary workaround for sites that are using a CDN is to de-select the 'localized categories allow anonymous users' setting on the plugin's settings page.

Loading a new locale requires reloading the site from the server. This could be a problem for mobile users. The plugin's user interface needs to make it clear that clicking on certain links (for example the forum logo) will reload the site.

There is currently a section added to the bottom of the Discourse header for the plugin's user interface. It's taking up a lot of room. Possibly it should be moved from the header and added to the top of the page.
