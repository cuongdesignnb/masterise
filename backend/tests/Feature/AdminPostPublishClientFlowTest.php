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

        $updatePayload = [
            ...$payload,
            'title' => 'Bài viết đã sửa ảnh đại diện',
            'thumbnail' => '/uploads/news-proof-updated.jpg',
        ];

        $postId = $createResponse->json('data.id');

        $this
            ->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/posts/{$postId}", $updatePayload)
            ->assertOk()
            ->assertJsonPath('data.title', 'Bài viết đã sửa ảnh đại diện')
            ->assertJsonPath('data.thumbnail', '/uploads/news-proof-updated.jpg');

        $this->getJson('/api/v1/posts/bai-viet-kiem-tra-luu-admin')
            ->assertOk()
            ->assertJsonPath('data.post.title', 'Bài viết đã sửa ảnh đại diện')
            ->assertJsonPath('data.post.thumbnail', '/uploads/news-proof-updated.jpg');
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

    public function test_featured_news_are_filtered_and_sorted_before_latest_fallback(): void
    {
        $author = User::factory()->create();
        $category = PostCategory::create([
            'name' => 'Tin thị trường',
            'slug' => 'tin-thi-truong',
        ]);

        Post::create([
            'title' => 'Bài nổi bật cũ',
            'slug' => 'bai-noi-bat-cu',
            'post_type' => 'news',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now()->subDay(),
        ]);
        Post::create([
            'title' => 'Bài nổi bật mới',
            'slug' => 'bai-noi-bat-moi',
            'post_type' => 'news',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now(),
        ]);
        Post::create([
            'title' => 'Bài đầu tư nổi bật không được lấy',
            'slug' => 'bai-dau-tu-noi-bat',
            'post_type' => 'investment',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now()->addMinute(),
        ]);

        $this->getJson('/api/v1/posts/featured?limit=1&post_type=news')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'bai-noi-bat-moi');

        Post::where('post_type', 'news')->update(['is_featured' => false]);

        $this->getJson('/api/v1/posts?per_page=1&post_type=news&status=published')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'bai-noi-bat-moi');
    }

    public function test_related_news_exclude_drafts_self_duplicates_and_other_post_types(): void
    {
        $author = User::factory()->create();
        $category = PostCategory::create([
            'name' => 'Tin dự án',
            'slug' => 'tin-du-an',
        ]);
        $otherCategory = PostCategory::create([
            'name' => 'Tin mới',
            'slug' => 'tin-moi',
        ]);

        $current = Post::create([
            'title' => 'Bài đang đọc',
            'slug' => 'bai-dang-doc',
            'post_type' => 'news',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now(),
        ]);
        $sameCategory = Post::create([
            'title' => 'Bài cùng danh mục',
            'slug' => 'bai-cung-danh-muc',
            'post_type' => 'news',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now()->subMinute(),
        ]);
        $latestFallback = Post::create([
            'title' => 'Bài mới danh mục khác',
            'slug' => 'bai-moi-danh-muc-khac',
            'post_type' => 'news',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $otherCategory->id,
            'author_id' => $author->id,
            'published_at' => now()->subMinutes(2),
        ]);
        Post::create([
            'title' => 'Bản nháp cùng danh mục',
            'slug' => 'ban-nhap-cung-danh-muc',
            'post_type' => 'news',
            'status' => 'draft',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
        ]);
        Post::create([
            'title' => 'Bài đầu tư cùng danh mục',
            'slug' => 'bai-dau-tu-cung-danh-muc',
            'post_type' => 'investment',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
        ]);

        $response = $this->getJson("/api/v1/posts/{$current->slug}")
            ->assertOk();

        $relatedIds = collect($response->json('data.related'))->pluck('id');
        $this->assertSame($sameCategory->id, $relatedIds->first());
        $this->assertTrue($relatedIds->contains($latestFallback->id));
        $this->assertFalse($relatedIds->contains($current->id));
        $this->assertSame($relatedIds->count(), $relatedIds->unique()->count());
        $this->assertCount(2, $relatedIds);
    }
}
