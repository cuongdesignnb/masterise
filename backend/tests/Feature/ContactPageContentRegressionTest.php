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
}
