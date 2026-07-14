<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectTypeVsLabelRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        return $admin;
    }

    private function category(string $slug, array $overrides = []): ProjectCategory
    {
        return ProjectCategory::create(array_merge([
            'name' => str($slug)->replace('-', ' ')->title()->toString(),
            'slug' => $slug,
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ], $overrides));
    }

    private function project(array $overrides = [], array $categories = []): Project
    {
        $project = Project::create(array_merge([
            'name' => 'Dự án '.uniqid(),
            'slug' => 'du-an-'.uniqid(),
            'project_status' => 'selling',
            'is_published' => true,
            'price_min' => 100,
            'price_max' => 200,
        ], $overrides));
        $project->categories()->sync(collect($categories)->map(fn ($category) => $category->id)->all());

        return $project;
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dự án API',
            'slug' => 'du-an-api-'.uniqid(),
            'project_status' => 'selling',
            'is_published' => false,
        ], $overrides);
    }

    public function test_01_public_category_endpoint_returns_dynamic_project_types_only(): void
    {
        $type = $this->category('can-ho');
        $collection = $this->category('lumiere-series', ['taxonomy_type' => ProjectCategory::TYPE_COLLECTION]);
        $this->project([], [$type, $collection]);

        $this->getJson('/api/v1/project-categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'can-ho');
    }

    public function test_02_category_count_only_counts_published_projects(): void
    {
        $type = $this->category('can-ho');
        $this->project([], [$type]);
        $this->project(['is_published' => false], [$type]);

        $this->getJson('/api/v1/project-categories')->assertJsonPath('data.0.projects_count', 1);
    }

    public function test_03_draft_only_category_is_not_exposed_publicly(): void
    {
        $type = $this->category('draft-only');
        $this->project(['is_published' => false], [$type]);

        $this->getJson('/api/v1/project-categories')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_04_category_slug_filter_returns_matching_project(): void
    {
        $apartment = $this->category('can-ho');
        $villa = $this->category('biet-thu');
        $expected = $this->project([], [$apartment]);
        $this->project([], [$villa]);

        $this->getJson('/api/v1/projects?category=can-ho')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_05_project_outside_selected_category_is_not_returned(): void
    {
        $apartment = $this->category('can-ho');
        $villa = $this->category('biet-thu');
        $outside = $this->project([], [$villa]);
        $this->project([], [$apartment]);

        $this->getJson('/api/v1/projects?category=can-ho')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonMissingPath('data.1')
            ->assertJsonPath('data.0.categories.0.slug', 'can-ho');
    }

    public function test_06_project_with_multiple_categories_appears_once(): void
    {
        $apartment = $this->category('can-ho');
        $shophouse = $this->category('shophouse');
        $this->project([], [$apartment, $shophouse]);

        $this->getJson('/api/v1/projects?category=can-ho')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 1);
    }

    public function test_07_category_without_published_projects_is_hidden(): void
    {
        $this->category('empty');
        $this->getJson('/api/v1/project-categories')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_08_project_label_does_not_change_category_filter_results(): void
    {
        $type = $this->category('can-ho');
        $this->project(['project_label' => 'Mới ra mắt'], [$type]);
        $this->project(['project_label' => 'Phiên bản giới hạn'], [$type]);

        $this->getJson('/api/v1/projects?category=can-ho')->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_09_public_project_label_query_is_ignored(): void
    {
        $type = $this->category('can-ho');
        $this->project(['project_label' => 'Mới ra mắt'], [$type]);
        $this->project(['project_label' => 'Tâm điểm đầu tư'], [$type]);

        $this->getJson('/api/v1/projects?project_label=M%E1%BB%9Bi%20ra%20m%E1%BA%AFt')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_10_api_still_returns_project_label_for_marketing_badge(): void
    {
        $project = $this->project(['project_label' => 'Mới ra mắt']);

        $this->getJson("/api/v1/projects/{$project->slug}")
            ->assertOk()
            ->assertJsonPath('data.project.project_label', 'Mới ra mắt');
    }

    public function test_11_admin_create_syncs_project_types(): void
    {
        $type = $this->category('can-ho');
        $response = $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/projects', $this->payload(['category_ids' => [$type->id]]))
            ->assertCreated();

        $this->assertDatabaseHas('project_category_project', [
            'project_id' => $response->json('data.id'),
            'project_category_id' => $type->id,
        ]);
    }

    public function test_12_admin_update_replaces_project_types(): void
    {
        $old = $this->category('can-ho');
        $new = $this->category('biet-thu');
        $project = $this->project(['is_published' => false], [$old]);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload([
                'name' => $project->name,
                'slug' => $project->slug,
                'category_ids' => [$new->id],
            ]))
            ->assertOk();

        $this->assertEquals([$new->id], $project->fresh()->categories()->pluck('project_categories.id')->all());
    }

    public function test_13_admin_reload_keeps_selected_project_types(): void
    {
        $type = $this->category('can-ho');
        $project = $this->project(['is_published' => false], [$type]);

        $this->actingAs($this->admin(), 'sanctum')
            ->getJson("/api/v1/admin/projects/{$project->id}")
            ->assertOk()
            ->assertJsonPath('data.categories.0.id', $type->id);
    }

    public function test_14_duplicate_category_slug_is_rejected(): void
    {
        $this->category('can-ho');

        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/project-categories', ['name' => 'Loại hình khác', 'slug' => 'can-ho'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    public function test_15_used_category_cannot_be_deleted(): void
    {
        $type = $this->category('can-ho');
        $this->project([], [$type]);

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/v1/project-categories/{$type->id}")
            ->assertStatus(400);
    }

    public function test_16_project_status_filter_combines_with_category(): void
    {
        $type = $this->category('can-ho');
        $expected = $this->project(['project_status' => 'selling'], [$type]);
        $this->project(['project_status' => 'handover'], [$type]);

        $this->getJson('/api/v1/projects?category=can-ho&project_status=selling')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_17_region_filter_combines_with_category(): void
    {
        $type = $this->category('can-ho');
        $north = Region::where('slug', 'mien-bac')->firstOrFail();
        $south = Region::where('slug', 'mien-nam')->firstOrFail();
        $northLocation = Location::create(['name' => 'Hà Nội', 'slug' => 'ha-noi-test', 'region_id' => $north->id]);
        $southLocation = Location::create(['name' => 'TP HCM', 'slug' => 'hcm-test', 'region_id' => $south->id]);
        $expected = $this->project(['location_id' => $northLocation->id, 'region' => $north->name], [$type]);
        $this->project(['location_id' => $southLocation->id, 'region' => $south->name], [$type]);

        $this->getJson('/api/v1/projects?category=can-ho&region=mien-bac')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_18_price_filter_combines_with_category(): void
    {
        $type = $this->category('can-ho');
        $expected = $this->project(['price_min' => 100, 'price_max' => 200], [$type]);
        $this->project(['price_min' => 500, 'price_max' => 600], [$type]);

        $this->getJson('/api/v1/projects?category=can-ho&price_max=250')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_19_category_name_is_unique_case_insensitively_and_slug_can_be_generated(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/project-categories', ['name' => 'Can Ho Moi', 'slug' => ''])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'can-ho-moi');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/project-categories', ['name' => 'can ho moi', 'slug' => 'can-ho-moi-2'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_20_updating_project_types_preserves_collection_relations(): void
    {
        $oldType = $this->category('can-ho');
        $newType = $this->category('biet-thu');
        $collection = $this->category('lumiere-series', [
            'taxonomy_type' => ProjectCategory::TYPE_COLLECTION,
        ]);
        $project = $this->project(['is_published' => false], [$oldType, $collection]);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload([
                'name' => $project->name,
                'slug' => $project->slug,
                'category_ids' => [$newType->id],
            ]))
            ->assertOk();

        $this->assertDatabaseMissing('project_category_project', [
            'project_id' => $project->id,
            'project_category_id' => $oldType->id,
        ]);
        $this->assertDatabaseHas('project_category_project', [
            'project_id' => $project->id,
            'project_category_id' => $newType->id,
        ]);
        $this->assertDatabaseHas('project_category_project', [
            'project_id' => $project->id,
            'project_category_id' => $collection->id,
        ]);
    }
}
