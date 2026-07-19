<?php

namespace Tests\Feature;

use App\Helpers\AiContentHelper;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublicSlugRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private PostCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $this->admin->assignRole('admin');
        $this->category = PostCategory::create(['name' => 'Tin tức', 'slug' => 'tin-tuc-test']);
    }

    public function test_auto_generated_post_slug_gets_next_available_suffix_across_content_types(): void
    {
        Project::create(['name' => 'Trùng slug', 'slug' => 'trung-slug']);
        Post::create($this->postData('Đã có hậu tố', 'trung-slug-2'));

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/posts', [
                ...$this->postPayload('Bài viết mới', 'trung-slug'),
                'slug_is_auto' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'trung-slug-3');
    }

    public function test_manually_entered_post_slug_conflicting_with_project_returns_validation_error(): void
    {
        Project::create(['name' => 'Dự án đã có', 'slug' => 'duong-dan-da-co']);

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/posts', $this->postPayload('Bài viết mới', 'duong-dan-da-co'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug')
            ->assertJsonPath('errors.slug.0', 'Đường dẫn này đã được sử dụng hoặc trùng với đường dẫn hệ thống. Vui lòng chọn slug khác.');
    }

    public function test_manually_entered_project_slug_conflicting_with_post_returns_validation_error(): void
    {
        Post::create($this->postData('Bài đã có', 'bai-da-co'));

        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/projects', [
                'name' => 'Dự án mới',
                'slug' => 'bai-da-co',
                'project_status' => 'selling',
                'is_published' => false,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    public function test_reserved_system_route_is_rejected(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/posts', $this->postPayload('Không được trùng route', 'du-an'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    public function test_ai_generated_slug_uses_the_same_global_collision_check(): void
    {
        Project::create(['name' => 'Dự án AI', 'slug' => 'noi-dung-ai']);

        $this->assertSame('noi-dung-ai-2', AiContentHelper::generateUniqueSlug('Nội dung AI'));
    }

    private function postPayload(string $title, string $slug): array
    {
        return [
            'title' => $title,
            'slug' => $slug,
            'post_type' => 'news',
            'status' => 'draft',
            'post_category_id' => $this->category->id,
        ];
    }

    private function postData(string $title, string $slug): array
    {
        return [
            ...$this->postPayload($title, $slug),
            'author_id' => $this->admin->id,
        ];
    }
}
