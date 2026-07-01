<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPostPublishClientFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_publish_news_and_client_endpoints_receive_it(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        $category = PostCategory::create([
            'name' => 'Tin tức',
            'slug' => 'tin-tuc',
        ]);

        $payload = [
            'title' => 'Bài viết kiểm tra lưu admin',
            'slug' => 'bai-viet-kiem-tra-luu-admin',
            'post_type' => 'news',
            'summary' => 'Tóm tắt bài viết kiểm tra',
            'content' => '<p>Nội dung bài viết kiểm tra.</p>',
            'thumbnail' => '/uploads/news-proof.jpg',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $category->id,
            'seo_title' => 'SEO bài viết kiểm tra',
            'seo_description' => 'Mô tả SEO bài viết kiểm tra',
            'seo_keywords' => 'masterise, tin tuc',
        ];

        $createResponse = $this
            ->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/posts', $payload);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Bài viết kiểm tra lưu admin')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.category.name', 'Tin tức')
            ->assertJsonPath('data.seo_meta.title', 'SEO bài viết kiểm tra');

        $this->assertDatabaseHas('posts', [
            'slug' => 'bai-viet-kiem-tra-luu-admin',
            'status' => 'published',
            'post_type' => 'news',
            'post_category_id' => $category->id,
        ]);

        $this->getJson('/api/v1/posts?post_type=news&status=published')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'bai-viet-kiem-tra-luu-admin')
            ->assertJsonPath('data.0.category.name', 'Tin tức');

        $this->getJson('/api/v1/posts/bai-viet-kiem-tra-luu-admin')
            ->assertOk()
            ->assertJsonPath('data.post.slug', 'bai-viet-kiem-tra-luu-admin')
            ->assertJsonPath('data.post.content', '<p>Nội dung bài viết kiểm tra.</p>');
    }

    public function test_draft_news_is_hidden_from_client_endpoints(): void
    {
        $category = PostCategory::create([
            'name' => 'Tin tức',
            'slug' => 'tin-tuc',
        ]);

        Post::create([
            'title' => 'Bản nháp không hiện client',
            'slug' => 'ban-nhap-khong-hien-client',
            'post_type' => 'news',
            'summary' => 'Draft summary',
            'content' => '<p>Draft content.</p>',
            'status' => 'draft',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => User::factory()->create()->id,
        ]);

        $this->getJson('/api/v1/posts?post_type=news')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->getJson('/api/v1/posts/ban-nhap-khong-hien-client')
            ->assertNotFound();
    }
}
