<?php

namespace App\Support;

use App\Models\Setting;

final class SeoFeatureFlags
{
    public const KEYS = [
        'seo_site_entity_enabled',
        'seo_project_product_schema_enabled',
        'seo_project_review_schema_enabled',
        'seo_event_schema_enabled',
        'seo_job_schema_enabled',
        'public_project_review_submission_enabled',
    ];

    public static function all(): array
    {
        return collect(self::KEYS)
            ->mapWithKeys(fn (string $key) => [$key => (bool) Setting::get($key, false)])
            ->all();
    }

    public static function enabled(string $key): bool
    {
        return in_array($key, self::KEYS, true) && (bool) Setting::get($key, false);
    }
}
