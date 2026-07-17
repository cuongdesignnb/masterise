<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use App\Services\InlineArticleImageNormalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InlineArticleImageNormalizerTest extends TestCase
{
    use RefreshDatabase;

    public function test_base64_image_is_saved_to_media_library_and_reused(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $png = base64_encode((string) UploadedFile::fake()->image('inline.png', 8, 8)->getContent());
        $html = '<p>Ảnh bài viết</p><p><img src="data:image/png;base64,'.$png.'"></p>';
        $normalizer = app(InlineArticleImageNormalizer::class);

        $first = $normalizer->normalize($html, $user->id, 'Bài kiểm thử');
        $second = $normalizer->normalize($html, $user->id, 'Bài kiểm thử');

        $this->assertStringNotContainsString('data:image', (string) $first);
        $this->assertSame($first, $second);
        $this->assertDatabaseCount('media', 1);
        $media = Media::query()->firstOrFail();
        $this->assertSame('image/webp', $media->mime_type);
        Storage::disk('public')->assertExists($media->path);
    }

    public function test_admin_cannot_persist_base64_images_in_article_content(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        $category = PostCategory::create(['name' => 'Tin tức', 'slug' => 'tin-tuc']);
        $png = base64_encode((string) UploadedFile::fake()->image('pasted.png', 8, 8)->getContent());
        $content = '<p>Nội dung có ảnh.</p><img src="data:image/png;base64,'.$png.'">';

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/posts', [
            'title' => 'Bài có ảnh dán',
            'slug' => 'bai-co-anh-dan',
            'post_type' => 'news',
            'content' => $content,
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
        ])->assertCreated();

        $storedContent = (string) Post::findOrFail($response->json('data.id'))->content;
        $this->assertStringNotContainsString('data:image', $storedContent);
        $this->assertStringContainsString('/storage/media/inline-', $storedContent);
        $this->getJson('/api/v1/posts/bai-co-anh-dan')
            ->assertOk()
            ->assertJsonMissing(['data:image']);
    }

    public function test_data_migration_is_idempotent_and_preserves_invalid_articles(): void
    {
        Storage::fake('public');
        $author = User::factory()->create();
        $category = PostCategory::create(['name' => 'Tin dự án', 'slug' => 'tin-du-an']);
        $png = base64_encode((string) UploadedFile::fake()->image('legacy.png', 8, 8)->getContent());
        $valid = Post::create([
            'title' => 'Bài cũ hợp lệ',
            'slug' => 'bai-cu-hop-le',
            'post_type' => 'news',
            'content' => '<img src="data:image/png;base64,'.$png.'">',
            'status' => 'published',
            'post_category_id' => $category->id,
            'author_id' => $author->id,
        ]);
        $invalid = Post::create([
            'title' => 'Bài cũ có ảnh lỗi',
            'slug' => 'bai-cu-co-anh-loi',
            'post_type' => 'news',
            'content' => '<img src="data:image/png;base64,khong-hop-le">',
            'status' => 'published',
            'post_category_id' => $category->id,
            'author_id' => $author->id,
        ]);
        $migration = require database_path('migrations/2026_07_17_010000_normalize_post_inline_images.php');

        $migration->up();
        $migration->up();

        $this->assertStringNotContainsString('data:image', (string) $valid->fresh()->content);
        $this->assertSame('<img src="data:image/png;base64,khong-hop-le">', $invalid->fresh()->content);
        $this->assertDatabaseCount('media', 1);
    }
}
