# Discourse Localized Categories

**Note:** this plugin is no longer supported. It might be useful as example code.

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
