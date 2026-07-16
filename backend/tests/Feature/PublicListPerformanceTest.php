<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicListPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_list_is_paginated_and_excludes_detail_fields(): void
    {
        $project = $this->project(['name' => 'Dự án tiếng Việt']);

        $response = $this->getJson('/api/v1/projects')->assertOk()
            ->assertJsonPath('meta.per_page', 12)
            ->assertJsonPath('data.0.name', 'Dự án tiếng Việt');

        $item = $response->json('data.0');
        foreach (['content', 'gallery', 'detail_gallery', 'floor_plans', 'floor_plan_groups', 'amenities', 'seo_meta'] as $field) {
            $this->assertArrayNotHasKey($field, $item);
        }
        $this->assertSame($project->id, $item['id']);
    }

    public function test_public_project_page_size_is_capped_and_options_are_minimal(): void
    {
        foreach (range(1, 51) as $index) $this->project(['name' => "Project {$index}", 'slug' => "project-{$index}"]);

        $this->getJson('/api/v1/projects?per_page=100')->assertOk()
            ->assertJsonPath('meta.per_page', 50)
            ->assertJsonCount(50, 'data');

        $options = $this->getJson('/api/v1/projects/options')->assertOk()->json('data');
        $this->assertCount(51, $options);
        $this->assertSame(['id', 'name', 'slug'], array_keys($options[0]));
    }

    public function test_post_list_excludes_content_and_drops_base64_thumbnail(): void
    {
        $category = PostCategory::create(['name' => 'Tin tức', 'slug' => 'tin-tuc']);
        $author = User::factory()->create();
        Post::create([
            'title' => 'Bài viết tối ưu', 'slug' => 'bai-viet-toi-uu', 'post_type' => 'news',
            'summary' => '<p>Tóm tắt ngắn</p>', 'intro_content' => str_repeat('intro', 100),
            'content' => str_repeat('<p>Nội dung dài</p>', 1000),
            'thumbnail' => 'data:image/png;base64,'.str_repeat('A', 5000),
            'status' => 'published', 'is_featured' => true,
            'post_category_id' => $category->id, 'author_id' => $author->id, 'published_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/posts')->assertOk()
            ->assertJsonPath('meta.per_page', 12)
            ->assertJsonPath('data.0.thumbnail', null);
        $item = $response->json('data.0');
        foreach (['content', 'intro_content', 'media_items', 'seo_meta', 'manual_related_posts'] as $field) {
            $this->assertArrayNotHasKey($field, $item);
        }
    }

    public function test_project_update_invalidates_public_list_cache(): void
    {
        $project = $this->project(['name' => 'Tên ban đầu']);
        $this->getJson('/api/v1/projects')->assertJsonPath('data.0.name', 'Tên ban đầu');

        $project->update(['name' => 'Tên sau khi sửa']);

        $this->getJson('/api/v1/projects')->assertJsonPath('data.0.name', 'Tên sau khi sửa');
    }

    public function test_post_unpublish_invalidates_list_and_featured_cache(): void
    {
        $category = PostCategory::create(['name' => 'Thị trường', 'slug' => 'thi-truong']);
        $author = User::factory()->create();
        $post = Post::create([
            'title' => 'Tin đang xuất bản', 'slug' => 'tin-dang-xuat-ban', 'post_type' => 'news',
            'summary' => 'Tóm tắt', 'content' => 'Nội dung', 'status' => 'published',
            'is_featured' => true, 'post_category_id' => $category->id,
            'author_id' => $author->id, 'published_at' => now(),
        ]);
        $this->getJson('/api/v1/posts')->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/posts/featured')->assertJsonCount(1, 'data');

        $post->update(['status' => 'draft']);

        $this->getJson('/api/v1/posts')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/posts/featured')->assertJsonCount(0, 'data');
    }

    public function test_public_settings_cache_is_invalidated_on_update(): void
    {
        Setting::set('company_name', 'Masterise cũ');
        $this->getJson('/api/v1/settings/public')->assertJsonPath('data.company_name', 'Masterise cũ');

        Setting::set('company_name', 'Masterise mới');

        $this->getJson('/api/v1/settings/public')->assertJsonPath('data.company_name', 'Masterise mới');
    }

    private function project(array $attributes = []): Project
    {
        static $sequence = 0;
        $sequence++;
        return Project::create(array_merge([
            'name' => "Project {$sequence}",
            'slug' => "performance-project-{$sequence}",
            'description' => 'Mô tả ngắn cho thẻ dự án.',
            'content' => str_repeat('Nội dung chi tiết ', 100),
            'is_published' => true,
            'published_at' => now(),
            'thumbnail' => '/images/project.webp',
        ], $attributes));
    }
}
