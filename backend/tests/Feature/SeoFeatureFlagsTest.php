<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Support\SeoFeatureFlags;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoFeatureFlagsTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_schema_flags_default_to_false(): void
    {
        $this->assertSame(array_fill_keys(SeoFeatureFlags::KEYS, false), SeoFeatureFlags::all());
    }

    public function test_only_known_boolean_setting_can_enable_a_flag(): void
    {
        Setting::set('seo_job_schema_enabled', true, 'boolean');
        $this->assertTrue(SeoFeatureFlags::enabled('seo_job_schema_enabled'));
        $this->assertFalse(SeoFeatureFlags::enabled('unknown_flag'));
    }
}
