<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\PostMedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PublicPostDetailPerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_detail_uses_slim_cards_for_every_related_position(): void
    {
        [$main, $related] = $this->posts();
        $main->manualRelatedPosts()->attach($related->id, ['sort_order' => 0]);

        $response = $this->getJson('/api/v1/posts/'.$main->slug)
            ->assertOk()
            ->assertJsonPath('data.post.title', 'Bài viết chính');

        $cacheControl = (string) $response->headers->get('Cache-Control');
        foreach (['public', 'max-age=60', 's-maxage=600', 'stale-while-revalidate=120'] as $directive) {
            $this->assertStringContainsString($directive, $cacheControl);
        }

        $this->assertArrayNotHasKey('manual_related_posts', $response->json('data.post'));
        foreach (['inline_related', 'related'] as $collection) {
            foreach ($response->json('data.'.$collection) as $item) {
                foreach (['content', 'intro_content', 'media_items', 'seo_meta', 'manual_related_posts'] as $field) {
                    $this->assertArrayNotHasKey($field, $item);
                }
            }
        }
        $this->assertLessThan(100_000, strlen((string) $response->getContent()));
    }

    public function test_detail_cache_is_invalidated_when_post_changes(): void
    {
        [$main] = $this->posts();
        $this->getJson('/api/v1/posts/'.$main->slug)->assertJsonPath('data.post.title', 'Bài viết chính');

        $main->update(['title' => 'Tiêu đề đã cập nhật']);

        $this->getJson('/api/v1/posts/'.$main->slug)
            ->assertOk()
            ->assertJsonPath('data.post.title', 'Tiêu đề đã cập nhật');
    }

    public function test_detail_second_request_is_served_without_database_queries(): void
    {
        [$main] = $this->posts();
        $this->getJson('/api/v1/posts/'.$main->slug)->assertOk();

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->getJson('/api/v1/posts/'.$main->slug)->assertOk();

        $this->assertSame([], DB::getQueryLog());
    }

    public function test_detail_cache_is_invalidated_when_media_changes(): void
    {
        [$main] = $this->posts();
        $media = PostMedia::create([
            'post_id' => $main->id,
            'type' => 'image',
            'title' => 'Ảnh ban đầu',
            'url' => '/storage/media/initial.webp',
            'sort_order' => 0,
        ]);
        $this->getJson('/api/v1/posts/'.$main->slug)
            ->assertJsonPath('data.post.media_items.0.title', 'Ảnh ban đầu');

        $media->update(['title' => 'Ảnh đã cập nhật']);

        $this->getJson('/api/v1/posts/'.$main->slug)
            ->assertOk()
            ->assertJsonPath('data.post.media_items.0.title', 'Ảnh đã cập nhật');
    }

    private function posts(): array
    {
        $category = PostCategory::create(['name' => 'Tin dự án', 'slug' => 'tin-du-an']);
        $author = User::factory()->create();
        $main = Post::create([
            'title' => 'Bài viết chính',
            'slug' => 'bai-viet-chinh',
            'post_type' => 'news',
            'summary' => 'Tóm tắt bài viết chính.',
            'intro_content' => '<p>Mở đầu bài viết.</p>',
            'content' => str_repeat('<p>Nội dung chi tiết.</p>', 80),
            'thumbnail' => '/storage/media/main.webp',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now(),
        ]);
        $related = Post::create([
            'title' => 'Bài viết liên quan',
            'slug' => 'bai-viet-lien-quan',
            'post_type' => 'news',
            'summary' => 'Tóm tắt liên quan.',
            'intro_content' => str_repeat('Mở đầu nặng ', 500),
            'content' => str_repeat('<p>Nội dung không được trả về trong thẻ.</p>', 3000),
            'thumbnail' => '/storage/media/related.webp',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => now()->subDay(),
        ]);

        return [$main, $related];
    }
}
