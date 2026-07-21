<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublicPageSeoContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_page_routes_only_expose_published_content(): void
    {
        Page::create(['title' => 'Published', 'slug' => 'published-page', 'status' => 'published']);
        Page::create(['title' => 'Draft', 'slug' => 'draft-page', 'status' => 'draft']);

        $this->getJson('/api/v1/pages')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'published-page');
        $this->getJson('/api/v1/pages/published-page')->assertOk();
        $this->getJson('/api/v1/pages/draft-page')->assertNotFound();
    }

    public function test_admin_page_routes_require_an_authorized_role(): void
    {
        $this->getJson('/api/v1/admin/pages')->assertUnauthorized();
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/pages')->assertOk();
    }
}
