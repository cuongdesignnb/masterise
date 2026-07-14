<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\ProjectStatusDefinition;
use App\Models\Region;
use App\Models\User;
use App\Support\ProjectRegionBackfill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DynamicProjectStatusAndRegionFilterTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        return $admin;
    }

    private function location(string $regionSlug = 'mien-nam', string $suffix = ''): Location
    {
        $region = Region::where('slug', $regionSlug)->firstOrFail();
        return Location::create([
            'region_id' => $region->id,
            'name' => 'Vị trí '.$regionSlug.$suffix,
            'slug' => 'vi-tri-'.$regionSlug.'-'.uniqid(),
            'province' => $regionSlug === 'mien-bac' ? 'Hà Nội' : 'Hồ Chí Minh',
        ]);
    }

    private function project(array $overrides = []): Project
    {
        $location = $overrides['location_id'] ?? $this->location();
        return Project::create(array_merge([
            'name' => 'Dự án '.uniqid(),
            'slug' => 'du-an-'.uniqid(),
            'project_status' => 'selling',
            'location_id' => $location,
            'region' => 'Miền Nam',
            'price_min' => 8_000_000_000,
            'is_published' => true,
        ], $overrides));
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dự án API '.uniqid(),
            'slug' => 'du-an-api-'.uniqid(),
            'project_status' => 'selling',
            'is_published' => false,
        ], $overrides);
    }

    public function test_01_migration_seeds_five_legacy_statuses_and_one_default(): void
    {
        $this->assertSame(5, ProjectStatusDefinition::count());
        $this->assertSame(1, ProjectStatusDefinition::where('is_default', true)->count());
        $this->assertTrue(ProjectStatusDefinition::where('slug', 'coming_soon')->value('is_default'));
        $this->assertEqualsCanonicalizing(
            ['coming_soon', 'selling', 'sold_out', 'handing_over', 'handover'],
            ProjectStatusDefinition::pluck('slug')->all(),
        );
    }

    public function test_02_admin_can_create_dynamic_status_and_duplicates_are_rejected(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/project-statuses', [
            'name' => 'Đang nhận booking',
            'color_key' => 'violet',
            'sort_order' => 25,
            'is_active' => true,
        ])->assertCreated()->assertJsonPath('data.slug', 'dang_nhan_booking');

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/project-statuses', [
            'name' => 'Đang nhận booking',
            'slug' => 'dang_nhan_booking_khac',
            'color_key' => 'blue',
        ])->assertUnprocessable()->assertJsonValidationErrors('name');

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/project-statuses', [
            'name' => 'Tên khác',
            'slug' => 'dang_nhan_booking',
            'color_key' => 'blue',
        ])->assertUnprocessable()->assertJsonValidationErrors('slug');
    }

    public function test_03_admin_can_update_name_color_order_and_change_default(): void
    {
        $status = ProjectStatusDefinition::where('slug', 'selling')->firstOrFail();
        $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/project-statuses/{$status->id}", [
            'name' => 'Đang phân phối',
            'slug' => $status->slug,
            'color_key' => 'blue',
            'sort_order' => 12,
            'is_active' => true,
            'is_default' => true,
        ])->assertOk()->assertJsonPath('data.name', 'Đang phân phối')->assertJsonPath('data.color_key', 'blue');

        $this->assertSame(1, ProjectStatusDefinition::where('is_default', true)->count());
        $this->assertTrue($status->fresh()->is_default);
    }

    public function test_04_unused_status_can_be_deleted_but_used_and_default_statuses_are_blocked(): void
    {
        $unused = ProjectStatusDefinition::create([
            'name' => 'Tạm ngưng', 'slug' => 'paused', 'color_key' => 'orange', 'is_active' => true,
        ]);
        $admin = $this->admin();
        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/project-statuses/{$unused->id}")->assertOk();

        $used = ProjectStatusDefinition::where('slug', 'selling')->firstOrFail();
        $this->project();
        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/project-statuses/{$used->id}")
            ->assertStatus(409)->assertJsonPath('projects_count', 1);

        $default = ProjectStatusDefinition::where('is_default', true)->firstOrFail();
        $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/project-statuses/{$default->id}")->assertStatus(409);
    }

    public function test_05_used_slug_is_locked_and_published_status_cannot_be_disabled(): void
    {
        $status = ProjectStatusDefinition::where('slug', 'selling')->firstOrFail();
        $this->project();
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/project-statuses/{$status->id}", [
            'name' => $status->name,
            'slug' => 'renamed-selling',
            'color_key' => $status->color_key,
            'sort_order' => $status->sort_order,
            'is_active' => true,
            'is_default' => false,
        ])->assertUnprocessable()->assertJsonValidationErrors('slug');

        $this->actingAs($admin, 'sanctum')->putJson("/api/v1/project-statuses/{$status->id}", [
            'name' => $status->name,
            'slug' => $status->slug,
            'color_key' => $status->color_key,
            'sort_order' => $status->sort_order,
            'is_active' => false,
            'is_default' => false,
        ])->assertStatus(409);
    }

    public function test_06_project_accepts_active_dynamic_status_and_rejects_unknown_or_inactive_status(): void
    {
        ProjectStatusDefinition::create([
            'name' => 'Đang giữ chỗ', 'slug' => 'booking', 'color_key' => 'violet', 'is_active' => true,
        ]);
        ProjectStatusDefinition::create([
            'name' => 'Nội bộ', 'slug' => 'internal', 'color_key' => 'stone', 'is_active' => false,
        ]);
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/projects', $this->payload(['project_status' => 'booking']))
            ->assertCreated()->assertJsonPath('data.project_status_detail.name', 'Đang giữ chỗ');
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/projects', $this->payload(['project_status' => 'missing']))
            ->assertUnprocessable()->assertJsonValidationErrors('project_status');
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/projects', $this->payload(['project_status' => 'internal']))
            ->assertUnprocessable()->assertJsonValidationErrors('project_status');
    }

    public function test_07_public_status_endpoint_only_returns_active_and_counts_published_projects(): void
    {
        $this->project(['is_published' => true]);
        $this->project(['is_published' => false]);
        ProjectStatusDefinition::where('slug', 'sold_out')->update(['is_active' => false]);

        $response = $this->getJson('/api/v1/project-statuses?active=true&with_count=true')->assertOk();
        $response->assertJsonMissing(['slug' => 'sold_out']);
        $selling = collect($response->json('data'))->firstWhere('slug', 'selling');
        $this->assertSame(1, $selling['projects_count']);
    }

    public function test_08_dynamic_status_filter_and_legacy_aliases_work(): void
    {
        ProjectStatusDefinition::create([
            'name' => 'Đang booking', 'slug' => 'booking', 'color_key' => 'violet', 'is_active' => true,
        ]);
        $expected = $this->project(['project_status' => 'booking']);
        $this->project(['project_status' => 'selling']);

        $this->getJson('/api/v1/projects?project_status=booking')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $expected->id)
            ->assertJsonPath('data.0.project_status_detail.color_key', 'violet');
        $this->getJson('/api/v1/projects?status=completed')->assertOk();
        $this->getJson('/api/v1/projects?project_status=does-not-exist')->assertUnprocessable();
    }

    public function test_09_region_endpoint_counts_only_published_and_filter_does_not_mix_regions(): void
    {
        $north = $this->location('mien-bac');
        $south = $this->location('mien-nam');
        $expected = $this->project(['name' => 'Dự án Bắc', 'location_id' => $north->id, 'region' => 'Miền Bắc']);
        $this->project(['name' => 'Dự án Nam', 'location_id' => $south->id]);
        $this->project(['name' => 'Bản nháp Bắc', 'location_id' => $north->id, 'region' => 'Miền Bắc', 'is_published' => false]);

        $this->getJson('/api/v1/projects/regions')->assertOk()
            ->assertJsonFragment(['value' => 'mien-bac', 'projects_count' => 1])
            ->assertJsonFragment(['value' => 'mien-nam', 'projects_count' => 1])
            ->assertJsonMissing(['value' => 'mien-trung']);
        $this->getJson('/api/v1/projects?region=mien-bac')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_10_region_combines_with_status_category_and_price_without_duplicates(): void
    {
        $north = $this->location('mien-bac');
        $category = ProjectCategory::create([
            'name' => 'Căn hộ QA', 'slug' => 'can-ho-qa', 'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        $expected = $this->project([
            'location_id' => $north->id,
            'region' => 'Miền Bắc',
            'project_status' => 'selling',
            'price_min' => 12_000_000_000,
        ]);
        $expected->categories()->attach($category->id);
        $other = $this->project(['location_id' => $north->id, 'region' => 'Miền Bắc', 'project_status' => 'handover', 'price_min' => 12_000_000_000]);
        $other->categories()->attach($category->id);

        $this->getJson('/api/v1/projects?region=mien-bac&project_status=selling&category=can-ho-qa&price_range=10-20')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_11_backfill_assigns_all_published_projects_and_reuses_matching_location(): void
    {
        Project::create([
            'name' => 'Legacy A', 'slug' => 'legacy-a', 'project_status' => 'selling',
            'region' => 'TP. Hồ Chí Minh', 'location' => 'Thảo Điền, TP. Thủ Đức', 'is_published' => true,
        ]);
        Project::create([
            'name' => 'Legacy B', 'slug' => 'legacy-b', 'project_status' => 'selling',
            'region' => 'TP. Hồ Chí Minh', 'location' => 'Thảo Điền, TP. Thủ Đức', 'is_published' => true,
        ]);

        ProjectRegionBackfill::run();

        $this->assertSame(0, Project::where('is_published', true)->whereNull('location_id')->count());
        $this->assertSame(0, Project::where('is_published', true)->whereHas('locationRelation', fn ($query) => $query->whereNull('region_id'))->count());
        $this->assertSame(1, Location::where('slug', 'thao-dien-tp-thu-duc')->count());
    }

    public function test_12_status_color_is_restricted_to_the_safe_palette(): void
    {
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/project-statuses', [
            'name' => 'Màu không an toàn',
            'slug' => 'unsafe_color',
            'color_key' => 'custom-danger-color',
        ])->assertUnprocessable()->assertJsonValidationErrors('color_key');
    }
}
