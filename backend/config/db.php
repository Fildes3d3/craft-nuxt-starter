<?php

use craft\helpers\App;

return [
    'driver'      => App::env('DB_DRIVER')   ?: 'mysql',
    'server'      => App::env('DB_SERVER')   ?: '127.0.0.1',
    'port'        => App::env('DB_PORT')      ?: 3306,
    'database'    => App::env('DB_DATABASE') ?: '',
    'user'        => App::env('DB_USER')     ?: 'root',
    'password'    => App::env('DB_PASSWORD') ?: '',
    'tablePrefix' => App::env('DB_TABLE_PREFIX') ?: '',
];
