<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectRelatedPostsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_three_related_posts_in_the_selected_order_and_public_payload_is_light(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        $category = PostCategory::create(['name' => 'Tin dự án', 'slug' => 'tin-du-an']);

        $posts = collect([
            $this->createPost($admin, $category, 'Bài thứ nhất', 'bai-thu-nhat', 'news'),
            $this->createPost($admin, $category, 'Bài thứ hai', 'bai-thu-hai', 'investment'),
            $this->createPost($admin, $category, 'Bài thứ ba', 'bai-thu-ba', 'news'),
        ]);
        $project = Project::create([
            'name' => 'Dự án kiểm thử',
            'slug' => 'du-an-kiem-thu',
            'project_status' => 'selling',
            'is_published' => true,
        ]);

        $order = [$posts[1]->id, $posts[2]->id, $posts[0]->id];
        $payload = [
            'name' => $project->name,
            'slug' => $project->slug,
            'project_status' => 'selling',
            'is_published' => true,
            'related_post_ids' => $order,
        ];

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.related_post_ids', $order)
            ->assertJsonPath('data.related_posts.0.id', $order[0])
            ->assertJsonPath('data.related_posts.2.id', $order[2]);

        foreach ($order as $sortOrder => $postId) {
            $this->assertDatabaseHas('project_related_posts', [
                'project_id' => $project->id,
                'post_id' => $postId,
                'sort_order' => $sortOrder,
            ]);
        }

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('data.related_post_ids', $order)
            ->assertJsonPath('data.related_posts.0.id', $order[0])
            ->assertJsonPath('data.related_posts.2.id', $order[2]);

        $public = $this->getJson("/api/v1/projects/{$project->slug}")
            ->assertOk()
            ->assertJsonPath('data.project.related_posts.0.id', $order[0])
            ->assertJsonCount(3, 'data.project.related_posts');

        foreach ($public->json('data.project.related_posts') as $post) {
            $this->assertSame(
                ['id', 'title', 'slug', 'post_type', 'excerpt', 'summary', 'thumbnail', 'category', 'published_at'],
                array_keys($post)
            );
            $this->assertArrayNotHasKey('content', $post);
            $this->assertArrayNotHasKey('media_items', $post);
            $this->assertArrayNotHasKey('tags', $post);
        }
    }

    public function test_admin_can_create_a_project_with_three_related_posts_and_reopen_it(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        $category = PostCategory::create(['name' => 'Tin dự án', 'slug' => 'tin-du-an']);
        $posts = collect([
            $this->createPost($admin, $category, 'Bài tạo mới 1', 'bai-tao-moi-1', 'news'),
            $this->createPost($admin, $category, 'Bài tạo mới 2', 'bai-tao-moi-2', 'investment'),
            $this->createPost($admin, $category, 'Bài tạo mới 3', 'bai-tao-moi-3', 'news'),
        ]);
        $order = [$posts[2]->id, $posts[0]->id, $posts[1]->id];

        $created = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/projects', [
            'name' => 'Dự án tạo mới',
            'slug' => 'du-an-tao-moi',
            'project_status' => 'selling',
            'is_published' => false,
            'related_post_ids' => $order,
        ])->assertCreated()
            ->assertJsonPath('data.related_post_ids', $order)
            ->assertJsonPath('data.related_posts.0.id', $order[0])
            ->assertJsonPath('data.related_posts.2.id', $order[2]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/projects/'.$created->json('data.id'))
            ->assertOk()
            ->assertJsonPath('data.related_post_ids', $order)
            ->assertJsonPath('data.related_posts.0.id', $order[0])
            ->assertJsonPath('data.related_posts.2.id', $order[2]);
    }

    public function test_related_posts_validation_rejects_too_many_duplicates_drafts_and_events(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        $category = PostCategory::create(['name' => 'Tin dự án', 'slug' => 'tin-du-an']);
        $published = collect(range(1, 4))->map(fn ($index) => $this->createPost(
            $admin,
            $category,
            "Bài {$index}",
            "bai-{$index}",
            'news'
        ));
        $draft = $this->createPost($admin, $category, 'Bản nháp', 'ban-nhap', 'news', 'draft');
        $event = $this->createPost($admin, $category, 'Sự kiện', 'su-kien', 'event');
        $project = Project::create(['name' => 'Dự án', 'slug' => 'du-an', 'project_status' => 'selling']);
        $base = ['name' => 'Dự án', 'slug' => 'du-an', 'project_status' => 'selling'];

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/projects/{$project->id}", [
            ...$base,
            'related_post_ids' => $published->pluck('id')->all(),
        ])->assertUnprocessable()->assertJsonValidationErrors('related_post_ids');

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/projects/{$project->id}", [
            ...$base,
            'related_post_ids' => [$published[0]->id, $published[0]->id],
        ])->assertUnprocessable()->assertJsonValidationErrors('related_post_ids.1');

        foreach ([$draft, $event] as $invalidPost) {
            $this->actingAs($admin, 'sanctum')->putJson("/api/v1/projects/{$project->id}", [
                ...$base,
                'related_post_ids' => [$invalidPost->id],
            ])->assertUnprocessable()->assertJsonValidationErrors('related_post_ids.0');
        }
    }

    private function createPost(User $author, PostCategory $category, string $title, string $slug, string $type, string $status = 'published'): Post
    {
        return Post::create([
            'title' => $title,
            'slug' => $slug,
            'post_type' => $type,
            'summary' => "Tóm tắt {$title}",
            'content' => str_repeat("Nội dung nặng {$title}. ", 50),
            'thumbnail' => "/uploads/{$slug}.webp",
            'status' => $status,
            'post_category_id' => $category->id,
            'author_id' => $author->id,
            'published_at' => $status === 'published' ? now() : null,
        ]);
    }
}
