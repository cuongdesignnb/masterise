<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Project;
use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DynamicRegionsRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');
        return $admin;
    }

    private function region(string $slug = 'mien-bac'): Region
    {
        return Region::where('slug', $slug)->firstOrFail();
    }

    private function location(?Region $region = null, array $overrides = []): Location
    {
        $region ??= $this->region();
        return Location::create(array_merge([
            'region_id' => $region->id,
            'name' => 'Vị trí Hà Nội',
            'slug' => 'vi-tri-ha-noi-'.uniqid(),
            'province' => 'Hà Nội',
        ], $overrides));
    }

    private function projectPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dự án kiểm thử',
            'slug' => 'du-an-kiem-thu-'.uniqid(),
            'project_status' => 'selling',
            'is_published' => false,
        ], $overrides);
    }

    public function test_01_admin_can_create_region(): void
    {
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/regions', [
            'name' => 'Đông Nam Bộ',
            'description' => 'Vùng mở rộng',
            'sort_order' => 50,
            'is_active' => true,
        ])->assertCreated()->assertJsonPath('data.slug', 'dong-nam-bo');

        $this->assertDatabaseHas('regions', ['name' => 'Đông Nam Bộ', 'slug' => 'dong-nam-bo']);
    }

    public function test_02_region_name_is_unique_case_insensitively(): void
    {
        Region::create(['name' => 'Đông Nam Bộ', 'slug' => 'dong-nam-bo']);

        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/regions', [
            'name' => 'đông nam bộ',
            'slug' => 'dong-nam-bo-2',
        ])->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_03_region_slug_is_unique(): void
    {
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/regions', [
            'name' => 'Vùng khác',
            'slug' => 'mien-bac',
        ])->assertUnprocessable()->assertJsonValidationErrors('slug');
    }

    public function test_04_admin_can_update_region_without_implicitly_changing_slug(): void
    {
        $region = $this->region();
        $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/regions/{$region->id}", [
            'name' => 'Bắc Bộ',
            'sort_order' => 5,
            'is_active' => true,
        ])->assertOk()->assertJsonPath('data.slug', 'mien-bac');

        $this->assertDatabaseHas('regions', ['id' => $region->id, 'name' => 'Bắc Bộ', 'slug' => 'mien-bac']);
    }

    public function test_05_admin_can_deactivate_region(): void
    {
        $region = $this->region();
        $this->actingAs($this->admin(), 'sanctum')->putJson("/api/v1/regions/{$region->id}", [
            'name' => $region->name,
            'slug' => $region->slug,
            'sort_order' => $region->sort_order,
            'is_active' => false,
        ])->assertOk()->assertJsonPath('data.is_active', false);
    }

    public function test_06_used_region_cannot_be_deleted(): void
    {
        $region = $this->region();
        $this->location($region);

        $this->actingAs($this->admin(), 'sanctum')
            ->deleteJson("/api/v1/regions/{$region->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Không thể xóa vùng miền đang có vị trí hoặc dự án. Hãy chuyển dữ liệu sang vùng khác trước.');
    }

    public function test_07_admin_can_create_location_with_active_region(): void
    {
        $region = $this->region();
        $response = $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/locations', [
            'region_id' => $region->id,
            'name' => 'Lumière Hanoi Seasons',
            'province' => 'Hà Nội',
        ]);

        $response->assertCreated()->assertJsonPath('data.region.slug', 'mien-bac');
        $this->assertDatabaseHas('locations', ['name' => 'Lumière Hanoi Seasons', 'region_id' => $region->id]);
    }

    public function test_08_location_cannot_be_created_without_region(): void
    {
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/locations', [
            'name' => 'Vị trí thiếu vùng',
        ])->assertUnprocessable()->assertJsonValidationErrors('region_id');
    }

    public function test_09_location_index_returns_region_and_projects_count(): void
    {
        $location = $this->location();
        Project::create($this->projectPayload(['location_id' => $location->id, 'region' => 'Miền Bắc']));

        $this->getJson('/api/v1/locations?all=true')
            ->assertOk()
            ->assertJsonPath('data.0.region.slug', 'mien-bac')
            ->assertJsonPath('data.0.projects_count', 1);
    }

    public function test_10_locations_can_be_filtered_by_region_slug(): void
    {
        $this->location($this->region('mien-bac'), ['name' => 'Vị trí Bắc']);
        $this->location($this->region('mien-nam'), ['name' => 'Vị trí Nam', 'province' => 'Hồ Chí Minh']);

        $this->getJson('/api/v1/locations?region=mien-bac&all=true')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Vị trí Bắc');
    }

    public function test_11_project_derives_region_from_location(): void
    {
        $location = $this->location($this->region('mien-nam'), ['province' => 'Hồ Chí Minh']);

        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/projects', $this->projectPayload([
            'location_id' => $location->id,
        ]))->assertCreated()
            ->assertJsonPath('data.region', 'Miền Nam')
            ->assertJsonPath('data.region_details.slug', 'mien-nam');
    }

    public function test_12_frontend_cannot_override_location_region(): void
    {
        $location = $this->location($this->region('mien-bac'));

        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/projects', $this->projectPayload([
            'location_id' => $location->id,
            'region' => 'Miền Nam',
        ]))->assertCreated()->assertJsonPath('data.region', 'Miền Bắc');
    }

    public function test_13_new_project_cannot_be_published_without_location_region(): void
    {
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/projects', $this->projectPayload([
            'is_published' => true,
        ]))->assertUnprocessable()->assertJsonValidationErrors('location_id');
    }

    public function test_14_public_projects_can_be_filtered_by_region_slug(): void
    {
        $north = $this->location($this->region('mien-bac'));
        $south = $this->location($this->region('mien-nam'), ['province' => 'Hồ Chí Minh']);
        Project::create($this->projectPayload(['name' => 'Dự án Bắc', 'location_id' => $north->id, 'region' => 'Miền Bắc', 'is_published' => true]));
        Project::create($this->projectPayload(['name' => 'Dự án Nam', 'location_id' => $south->id, 'region' => 'Miền Nam', 'is_published' => true]));

        $this->getJson('/api/v1/projects?region=mien-bac')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Dự án Bắc');
    }

    public function test_15_public_region_count_only_includes_published_projects(): void
    {
        $location = $this->location($this->region('mien-bac'));
        Project::create($this->projectPayload(['location_id' => $location->id, 'region' => 'Miền Bắc', 'is_published' => true]));
        Project::create($this->projectPayload(['location_id' => $location->id, 'region' => 'Miền Bắc', 'is_published' => false]));

        $this->getJson('/api/v1/regions?all=true&active=true&with_count=true')
            ->assertOk()->assertJsonPath('data.0.slug', 'mien-bac')->assertJsonPath('data.0.projects_count', 1);
    }

    public function test_16_inactive_region_is_not_exposed_in_public_filter(): void
    {
        $region = $this->region('mien-bac');
        $region->update(['is_active' => false]);

        $this->getJson('/api/v1/regions?all=true&active=true&with_count=true')
            ->assertOk()
            ->assertJsonMissing(['slug' => 'mien-bac']);
    }

    public function test_17_legacy_location_is_backfilled_safely(): void
    {
        $location = Location::create(['name' => 'Legacy Hà Nội', 'slug' => 'legacy-ha-noi', 'province' => 'Hà Nội']);
        $project = Project::create($this->projectPayload([
            'location_id' => $location->id,
            'region' => 'Hà Nội',
        ]));

        $migration = require database_path('migrations/2026_07_13_000009_seed_and_backfill_regions.php');
        $migration->up();

        $this->assertSame('mien-bac', $location->fresh()->region->slug);
        $this->assertSame('Miền Bắc', $project->fresh()->region);
    }

    public function test_18_conflicting_legacy_regions_are_not_overwritten(): void
    {
        $location = Location::create(['name' => 'Legacy xung đột', 'slug' => 'legacy-xung-dot']);
        Project::create($this->projectPayload(['location_id' => $location->id, 'region' => 'Miền Bắc']));
        Project::create($this->projectPayload(['location_id' => $location->id, 'region' => 'Miền Nam']));

        $migration = require database_path('migrations/2026_07_13_000009_seed_and_backfill_regions.php');
        $migration->up();

        $this->assertNull($location->fresh()->region_id);
    }
}
