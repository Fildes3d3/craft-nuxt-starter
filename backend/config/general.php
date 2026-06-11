<?php
/**
 * General Configuration
 *
 * @see \craft\config\GeneralConfig
 * @link https://craftcms.com/docs/5.x/reference/config/general.html
 */

use craft\config\GeneralConfig;

return GeneralConfig::create()
    ->defaultWeekStartDay(1)
    ->omitScriptNameInUrls()
    ->preloadSingles()
    ->preventUserEnumeration()
    ->aliases([
        '@webroot' => dirname(__DIR__) . '/web',
    ])
    // The two settings that make this a headless Craft install:
    // no Twig front-end routing, GraphQL enabled.
    ->headlessMode()
    ->enableGql()
;
