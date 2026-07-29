<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MediaKindFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_media_library_by_image_or_document(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        Media::create(['name' => 'Price image', 'file_name' => 'price.webp', 'mime_type' => 'image/webp', 'size' => 10, 'path' => 'media/price.webp', 'url' => '/storage/media/price.webp']);
        Media::create(['name' => 'Policy PDF', 'file_name' => 'policy.pdf', 'mime_type' => 'application/pdf', 'size' => 10, 'path' => 'media/policy.pdf', 'url' => '/storage/media/policy.pdf']);
        Media::create(['name' => 'Project video', 'file_name' => 'tour.mp4', 'mime_type' => 'video/mp4', 'size' => 10, 'path' => 'media/tour.mp4', 'url' => '/storage/media/tour.mp4']);

        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/media?kind=image')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.file_name', 'price.webp');

        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/media?kind=document')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.file_name', 'policy.pdf');
    }

    public function test_search_stays_grouped_with_kind_filter(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        Media::create(['name' => 'Unrelated image', 'file_name' => 'policy-image.webp', 'mime_type' => 'image/webp', 'size' => 10, 'path' => 'media/policy-image.webp', 'url' => '/storage/media/policy-image.webp']);
        Media::create(['name' => 'Policy PDF', 'file_name' => 'policy.pdf', 'mime_type' => 'application/pdf', 'size' => 10, 'path' => 'media/policy.pdf', 'url' => '/storage/media/policy.pdf']);

        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/media?kind=document&q=policy')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.file_name', 'policy.pdf');
    }
}
