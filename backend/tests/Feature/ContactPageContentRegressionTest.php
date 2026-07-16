<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use App\Support\ContactPageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContactPageContentRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        return $admin;
    }

    public function test_01_public_settings_returns_normalized_contact_page_content(): void
    {
        $this->getJson('/api/v1/settings/public')
            ->assertOk()
            ->assertJsonPath('data.contact_page_content.hero.enabled', true)
            ->assertJsonCount(9, 'data.contact_page_content.sectionOrder');
    }

    public function test_02_admin_can_save_complete_contact_page_content(): void
    {
        $content = ContactPageContent::default();
        $content['hero']['title'] = 'Tiêu đề liên hệ do quản trị viên cập nhật';

        $this->actingAs($this->admin(), 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $content, 'type' => 'json']],
        ])->assertOk();

        $this->assertSame($content['hero']['title'], Setting::get('contact_page_content')['hero']['title']);
    }

    public function test_03_invalid_json_shape_and_raw_html_are_rejected(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin, 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => 'not-an-object', 'type' => 'json']],
        ])->assertUnprocessable();

        $content = ContactPageContent::default();
        $content['hero']['title'] = '<script>alert(1)</script>';
        $this->actingAs($admin, 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $content, 'type' => 'json']],
        ])->assertUnprocessable();
    }

    public function test_04_unsafe_url_and_unknown_icon_are_rejected(): void
    {
        $admin = $this->admin();
        $content = ContactPageContent::default();
        $content['hero']['primaryCta']['url'] = 'javascript:alert(1)';
        $this->actingAs($admin, 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $content, 'type' => 'json']],
        ])->assertUnprocessable();

        $content = ContactPageContent::default();
        $content['commitments']['items'][0]['icon'] = 'UntrustedIcon';
        $this->actingAs($admin, 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $content, 'type' => 'json']],
        ])->assertUnprocessable();
    }

    public function test_05_duplicate_stable_id_is_rejected(): void
    {
        $content = ContactPageContent::default();
        $content['commitments']['items'][1]['id'] = $content['commitments']['items'][0]['id'];

        $this->actingAs($this->admin(), 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $content, 'type' => 'json']],
        ])->assertUnprocessable();
    }

    public function test_06_legacy_contact_departments_are_migrated_without_data_loss(): void
    {
        Setting::query()->where('key', 'contact_page_content')->delete();
        Setting::set('contact_departments', [[
            'name' => 'Phòng Kinh doanh',
            'phone' => '0901000000',
            'email' => 'sales@example.com',
            'description' => 'Tư vấn dự án',
            'time' => '08:00 - 18:00',
            'icon' => 'Building2',
        ]], 'json');

        $this->assertTrue(ContactPageContent::ensureSetting());
        $department = Setting::get('contact_page_content')['departments']['items'][0];
        $this->assertSame('Phòng Kinh doanh', $department['name']);
        $this->assertSame('0901000000', $department['phone']);
        $this->assertSame('sales@example.com', $department['email']);
    }

    public function test_07_ensure_setting_never_overwrites_existing_admin_content(): void
    {
        $content = ContactPageContent::default();
        $content['hero']['title'] = 'Nội dung đã duyệt';
        Setting::set('contact_page_content', $content, 'json');

        $this->assertFalse(ContactPageContent::ensureSetting());
        $this->assertSame('Nội dung đã duyệt', Setting::get('contact_page_content')['hero']['title']);
    }

    public function test_08_public_settings_never_exposes_private_mail_or_token_values(): void
    {
        Setting::set('mail_password', 'top-secret');
        Setting::set('mail_username', 'private-user');
        Setting::set('api_token', 'private-token');

        $response = $this->getJson('/api/v1/settings/public')->assertOk();
        $response->assertJsonMissing(['mail_password' => 'top-secret']);
        $response->assertJsonMissing(['mail_username' => 'private-user']);
        $response->assertJsonMissing(['api_token' => 'private-token']);
        $this->assertArrayNotHasKey('mail_password', $response->json('data'));
    }

    public function test_09_null_and_malformed_contact_payload_is_normalized_before_save_and_public_output(): void
    {
        $payload = [
            'hero' => [
                'title' => null,
                'image' => null,
                'primaryCta' => ['label' => null, 'url' => null],
            ],
            'salesTeam' => [
                'items' => [
                    ['name' => null, 'phone' => null, 'email' => null, 'zaloUrl' => null],
                    null,
                ],
            ],
            'contactForm' => [
                'hotline' => null,
                'email' => null,
                'address' => null,
                'mapUrl' => null,
                'mapEmbedUrl' => null,
                'directionsUrl' => null,
            ],
            'faqs' => ['items' => null],
            'cta' => ['primaryCta' => null, 'secondaryCta' => ['url' => null]],
        ];

        $this->actingAs($this->admin(), 'sanctum')->putJson('/api/v1/settings', [
            'settings' => [['key' => 'contact_page_content', 'value' => $payload, 'type' => 'json']],
        ])->assertOk();

        $stored = Setting::get('contact_page_content');
        $this->assertSame('', $stored['hero']['title']);
        $this->assertSame('', $stored['hero']['primaryCta']['url']);
        $this->assertSame('', $stored['contactForm']['hotline']);
        $this->assertSame('', $stored['contactForm']['mapUrl']);
        $this->assertSame([], $stored['salesTeam']['items']);
        $this->assertSame([], $stored['faqs']['items']);
        $this->assertIsArray($stored['cta']['primaryCta']);

        $this->getJson('/api/v1/settings/public')
            ->assertOk()
            ->assertJsonPath('data.contact_page_content.hero.title', '')
            ->assertJsonPath('data.contact_page_content.contactForm.directionsUrl', '')
            ->assertJsonPath('data.contact_page_content.salesTeam.items', [])
            ->assertJsonPath('data.contact_page_content.faqs.items', [])
            ->assertJsonCount(9, 'data.contact_page_content.sectionOrder');
    }

    public function test_10_legacy_stored_nulls_are_normalized_in_public_and_admin_apis_without_data_loss(): void
    {
        Setting::set('contact_page_content', [
            'hero' => ['title' => 'Liên hệ tiếng Việt', 'image' => null],
            'contactForm' => ['email' => null, 'directionsUrl' => null],
            'achievements' => ['metrics' => 'invalid-array'],
            'departments' => null,
        ], 'json');

        $this->getJson('/api/v1/settings/public')
            ->assertOk()
            ->assertJsonPath('data.contact_page_content.hero.title', 'Liên hệ tiếng Việt')
            ->assertJsonPath('data.contact_page_content.hero.image', '')
            ->assertJsonPath('data.contact_page_content.contactForm.email', '')
            ->assertJsonPath('data.contact_page_content.achievements.metrics', [])
            ->assertJsonPath('data.contact_page_content.departments.enabled', true);

        $response = $this->actingAs($this->admin(), 'sanctum')->getJson('/api/v1/settings')->assertOk();
        $contactSetting = collect($response->json('data'))->firstWhere('key', 'contact_page_content');
        $decoded = json_decode($contactSetting['value'], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('Liên hệ tiếng Việt', $decoded['hero']['title']);
        $this->assertSame('', $decoded['contactForm']['directionsUrl']);
        $this->assertSame([], $decoded['achievements']['metrics']);
    }
}
