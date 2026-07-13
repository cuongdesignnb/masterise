<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ContentTaxonomyRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        return $admin;
    }

    private function category(string $name, string $slug): PostCategory
    {
        return PostCategory::create(['name' => $name, 'slug' => $slug]);
    }

    private function createPost(PostCategory $category, array $overrides = []): Post
    {
        static $index = 0;
        $index++;
        return Post::create(array_merge([
            'title' => "Bài kiểm thử {$index}",
            'slug' => "bai-kiem-thu-{$index}",
            'post_type' => 'news',
            'summary' => 'Tóm tắt',
            'content' => '<p>Nội dung kiểm thử.</p>',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $category->id,
            'author_id' => User::factory()->create()->id,
            'published_at' => now()->subMinutes($index),
        ], $overrides));
    }

    public function test_table_round_trip_tags_and_manual_related_order_are_preserved(): void
    {
        $admin = $this->admin();
        $category = $this->category('Tin tức', 'tin-tuc');
        $firstRelated = $this->createPost($category, ['slug' => 'related-first']);
        $secondRelated = $this->createPost($category, ['slug' => 'related-second']);
        $tagOne = Tag::create(['name' => 'Hạ tầng', 'slug' => 'ha-tang']);
        $tagTwo = Tag::create(['name' => 'Đầu tư', 'slug' => 'dau-tu']);
        $intro = '<p>Đoạn mở đầu lưu ở trường riêng.</p>';
        $table = '<table><thead><tr><th colspan="2">Tiêu đề ★★★★★</th></tr></thead><tbody><tr><td rowspan="2">A</td><td>B ⭐⭐⭐⭐⭐</td></tr><tr><td>C</td></tr></tbody><tfoot><tr><td colspan="2">Cuối</td></tr></tfoot></table>';
        $payload = [
            'title' => 'Bài có bảng', 'slug' => 'bai-co-bang', 'post_type' => 'news',
            'summary' => 'Tóm tắt', 'intro_content' => $intro, 'content' => $table, 'status' => 'published',
            'is_featured' => false, 'post_category_id' => $category->id,
            'tag_ids' => [$tagOne->id, $tagTwo->id],
            'related_post_ids' => [$secondRelated->id, $firstRelated->id],
        ];

        $created = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/posts', $payload)
            ->assertCreated()
            ->assertJsonPath('data.tags.0.id', $tagOne->id)
            ->assertJsonPath('data.manual_related_posts.0.id', $secondRelated->id);
        $postId = $created->json('data.id');

        $this->getJson('/api/v1/posts/bai-co-bang')->assertOk()
            ->assertJsonPath('data.post.intro_content', $intro)
            ->assertJsonPath('data.post.content', $table)
            ->assertJsonPath('data.inline_related.0.id', $secondRelated->id)
            ->assertJsonPath('data.inline_related.1.id', $firstRelated->id);

        $updatedTable = str_replace('Cuối', 'Đã cập nhật', $table);
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$postId}", [
            ...$payload, 'content' => $updatedTable,
            'tag_ids' => [$tagTwo->id],
            'related_post_ids' => [$firstRelated->id, $secondRelated->id],
        ])->assertOk()
            ->assertJsonPath('data.tags.0.id', $tagTwo->id)
            ->assertJsonPath('data.manual_related_posts.0.id', $firstRelated->id);

        // A second save must keep every table section, merged-cell attribute,
        // and rating character intact instead of flattening it to plain text.
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$postId}", [
            ...$payload, 'content' => $updatedTable,
            'tag_ids' => [$tagTwo->id],
            'related_post_ids' => [$firstRelated->id, $secondRelated->id],
        ])->assertOk()->assertJsonPath('data.content', $updatedTable);

        $storedPost = Post::findOrFail($postId);
        $this->assertSame($intro, $storedPost->intro_content);
        $content = $storedPost->content;
        foreach (['<table', '<thead', '<tbody', '<tfoot', '<tr', '<th', '<td', 'colspan', 'rowspan', '★★★★★', '⭐⭐⭐⭐⭐'] as $needle) {
            $this->assertStringContainsString($needle, $content);
        }
    }

    public function test_related_validation_rejects_self_duplicates_drafts_and_wrong_type_and_fallback_is_safe(): void
    {
        $admin = $this->admin();
        $category = $this->category('Tin dự án', 'tin-du-an');
        $current = $this->createPost($category, ['slug' => 'current']);
        $published = $this->createPost($category, ['slug' => 'published-related']);
        $draft = $this->createPost($category, ['slug' => 'draft-related', 'status' => 'draft']);
        $event = $this->createPost($category, ['slug' => 'event-related', 'post_type' => 'event']);
        $payload = [
            'title' => $current->title, 'slug' => $current->slug, 'post_type' => 'news',
            'summary' => $current->summary, 'content' => $current->content, 'status' => 'published',
            'is_featured' => false, 'post_category_id' => $category->id,
        ];

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$current->id}", [...$payload, 'related_post_ids' => [$current->id]])->assertUnprocessable();
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$current->id}", [...$payload, 'related_post_ids' => [$published->id, $published->id]])->assertUnprocessable();
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$current->id}", [...$payload, 'related_post_ids' => [$draft->id]])->assertUnprocessable();
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/posts/{$current->id}", [...$payload, 'related_post_ids' => [$event->id]])->assertUnprocessable();

        $response = $this->getJson('/api/v1/posts/current')->assertOk();
        $ids = collect($response->json('data.inline_related'))->pluck('id');
        $this->assertTrue($ids->contains($published->id));
        $this->assertFalse($ids->contains($draft->id));
        $this->assertFalse($ids->contains($event->id));
        $this->assertFalse($ids->contains($current->id));
        $this->assertSame($ids->count(), $ids->unique()->count());
    }

    public function test_tag_crud_sync_filter_duplicate_and_delete_detach(): void
    {
        $admin = $this->admin();
        $category = $this->category('Tin tức', 'tin-tuc');
        $tag = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/tags', ['name' => '  Hạ tầng Đô thị  '])
            ->assertCreated()->assertJsonPath('data.slug', 'ha-tang-do-thi')->json('data');
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/tags', ['name' => 'hẠ TẦNG ĐÔ THỊ'])->assertUnprocessable();

        $post = $this->createPost($category);
        $post->tags()->sync([$tag['id']]);
        $this->getJson('/api/v1/posts?tag=ha-tang-do-thi')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $post->id);
        $this->getJson('/api/v1/tags?with_count=1')->assertOk()->assertJsonPath('data.0.posts_count', 1);
        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/tags/{$tag['id']}")->assertStatus(409);

        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/posts/{$post->id}")->assertOk();
        $this->assertDatabaseMissing('taggables', ['tag_id' => $tag['id'], 'taggable_id' => $post->id]);
        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/tags/{$tag['id']}")->assertOk();
    }

    public function test_tag_filters_stay_within_news_and_investment_markets(): void
    {
        $category = $this->category('Chủ đề', 'chu-de');
        $tag = Tag::create(['name' => 'Hạ tầng', 'slug' => 'ha-tang']);
        $news = $this->createPost($category, ['slug' => 'tag-news', 'post_type' => 'news']);
        $investment = $this->createPost($category, ['slug' => 'tag-investment', 'post_type' => 'investment']);
        $news->tags()->sync([$tag->id]);
        $investment->tags()->sync([$tag->id]);

        $this->getJson('/api/v1/posts?tag=ha-tang&post_type=news')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $news->id);
        $this->getJson('/api/v1/posts?tag=ha-tang&post_type=investment')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $investment->id);
        $this->getJson('/api/v1/tags?q=ha-tang&post_type=news&with_count=1')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.posts_count', 1);
    }

    public function test_regions_are_normalized_unique_public_only_and_static_route_precedes_slug(): void
    {
        Project::create(['name' => 'Bắc 1', 'slug' => 'bac-1', 'region' => 'Miền Bắc', 'is_published' => true]);
        Project::create(['name' => 'Bắc 2', 'slug' => 'bac-2', 'region' => 'Miền Bắc', 'is_published' => true]);
        Project::create(['name' => 'Nam', 'slug' => 'nam', 'region' => 'Miền Nam', 'is_published' => true]);
        Project::create(['name' => 'Ẩn', 'slug' => 'an', 'region' => 'Miền Trung', 'is_published' => false]);
        $legacyNorth = Project::create(['name' => 'Cũ', 'slug' => 'cu', 'region' => 'Hà Nội', 'province' => 'Hà Nội', 'location' => 'Gia Lâm, Hà Nội', 'is_published' => true]);
        $legacySouth = Project::create(['name' => 'Nam cũ', 'slug' => 'nam-cu', 'region' => 'Thành phố Thủ Đức', 'location' => 'TP. Thủ Đức, TP. Hồ Chí Minh', 'is_published' => true]);
        $unresolved = Project::create(['name' => 'Không rõ', 'slug' => 'khong-ro', 'region' => 'Khu vực lạ', 'location' => 'Chưa cập nhật', 'is_published' => true]);

        $projectCount = Project::count();
        $migration = require database_path('migrations/2026_07_13_000006_enforce_project_regions_from_region_and_province.php');
        $migration->up();
        $migration->up();
        $this->assertSame($projectCount, Project::count());
        $this->assertSame('Miền Bắc', $legacyNorth->fresh()->region);
        $this->assertSame('Miền Nam', $legacySouth->fresh()->region);
        $this->assertNull($unresolved->fresh()->region);
        $this->assertSame('Hà Nội', $legacyNorth->fresh()->province);
        $this->assertSame('Gia Lâm, Hà Nội', $legacyNorth->fresh()->location);

        $this->getJson('/api/v1/projects/regions')->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.value', 'Miền Bắc')
            ->assertJsonPath('data.0.projects_count', 3)
            ->assertJsonPath('data.1.value', 'Miền Nam')
            ->assertJsonPath('data.1.projects_count', 2);
        $this->getJson('/api/v1/projects?region=Mi%E1%BB%81n%20B%E1%BA%AFc')->assertOk()->assertJsonCount(3, 'data');

        $admin = $this->admin();
        $project = Project::where('slug', 'cu')->firstOrFail();
        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/projects/{$project->id}", [
            'name' => $project->name, 'slug' => $project->slug, 'region' => 'mien bac',
            'status' => 'selling', 'sales_status' => 'selling', 'is_published' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('region');

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/projects/{$project->id}", [
            'name' => $project->name, 'slug' => $project->slug, 'region' => 'Miền Bắc',
            'status' => 'selling', 'sales_status' => 'selling', 'is_published' => true,
        ])->assertOk()->assertJsonPath('data.region', 'Miền Bắc');
    }

    public function test_post_pagination_category_tag_and_investment_scope_keep_market_and_events_separate(): void
    {
        $market = $this->category('Tin tức thị trường', 'tin-tuc-thi-truong');
        $investment = $this->category('Tin tức đầu tư', 'tin-tuc-dau-tu');
        foreach (range(1, 11) as $number) $this->createPost($market, ['slug' => "market-{$number}", 'post_type' => $number <= 3 ? 'news' : 'investment']);
        foreach (range(1, 4) as $number) $this->createPost($investment, ['slug' => "investment-{$number}", 'post_type' => $number === 1 ? 'news' : 'investment']);
        $event = $this->createPost($investment, ['slug' => 'event', 'post_type' => 'event']);
        $draft = $this->createPost($investment, ['slug' => 'draft', 'status' => 'draft']);

        $this->getJson('/api/v1/posts?per_page=9&page=2&post_type=news,investment')->assertOk()
            ->assertJsonPath('meta.current_page', 2)->assertJsonPath('meta.last_page', 2)->assertJsonPath('meta.total', 15)->assertJsonCount(6, 'data');
        $investmentResponse = $this->getJson('/api/v1/posts?category=tin-tuc-dau-tu&post_type=news,investment&per_page=20')->assertOk()->assertJsonCount(4, 'data');
        $investmentIds = collect($investmentResponse->json('data'))->pluck('id');
        $this->assertFalse($investmentIds->contains($event->id));
        $this->assertFalse($investmentIds->contains($draft->id));
        $this->getJson('/api/v1/posts?category=tin-tuc-thi-truong&post_type=news,investment&per_page=20')->assertOk()->assertJsonCount(11, 'data');
        $this->getJson('/api/v1/posts?post_type=event')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $event->id);
        $this->getJson('/api/v1/post-categories?post_type=news,investment&exclude_post_type=event')->assertOk()
            ->assertJsonPath('data.0.posts_count', 11)->assertJsonPath('data.1.posts_count', 4);
    }
}
