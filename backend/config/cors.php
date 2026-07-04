<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://masterise-homes.net.vn',
        'https://www.masterise-homes.net.vn',
        'https://api.masterise-homes.net.vn',
        'http://localhost:8746',
        'http://localhost:3000',
        'http://127.0.0.1:8746',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
