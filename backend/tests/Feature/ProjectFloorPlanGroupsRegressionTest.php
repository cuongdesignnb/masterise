<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Support\ProjectFloorPlanStructure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectFloorPlanGroupsRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::findOrCreate('admin', 'web');
        $admin->assignRole('admin');
        return $admin;
    }

    private function project(): Project
    {
        return Project::create([
            'name' => 'Floor Plan Test',
            'slug' => 'floor-plan-test',
            'description' => 'Regression test',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => false,
            'sort_order' => 0,
        ]);
    }

    private function payload(Project $project, array $extra = []): array
    {
        return array_merge([
            'name' => $project->name,
            'slug' => $project->slug,
            'description' => $project->description,
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => false,
            'sort_order' => 0,
        ], $extra);
    }

    public function test_migration_adds_canonical_column_and_legacy_conversion_preserves_tabs_items_and_images(): void
    {
        $this->assertTrue(Schema::hasColumn('projects', 'floor_plan_groups'));

        $groups = ProjectFloorPlanStructure::fromLegacy(
            ['Căn hộ', 'Biệt thự'],
            [
                [
                    'productType' => 'Căn hộ',
                    'name' => 'Căn 2PN',
                    'image' => '/uploads/primary.jpg',
                    'images' => ['/uploads/primary.jpg', '/uploads/second.jpg'],
                    'gallery' => ['/uploads/second.jpg', '/uploads/third.jpg'],
                ],
                ['name' => 'Không phân tab', 'photos' => ['/uploads/free.jpg']],
            ]
        );

        $this->assertSame('Mặt bằng', $groups[0]['label']);
        $this->assertSame(['Căn hộ', 'Biệt thự', 'Sản phẩm'], array_column($groups[0]['tabs'], 'label'));
        $this->assertSame(
            ['/uploads/primary.jpg', '/uploads/second.jpg', '/uploads/third.jpg'],
            $groups[0]['tabs'][0]['items'][0]['images']
        );
        $this->assertSame('Không phân tab', $groups[0]['tabs'][2]['items'][0]['name']);
    }

    public function test_migration_backfills_legacy_rows_without_overwriting_legacy_columns(): void
    {
        $project = Project::create([
            'name' => 'Legacy migration row',
            'slug' => 'legacy-migration-row',
            'description' => 'Legacy data',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => false,
            'sort_order' => 0,
            'floor_tabs' => ['Căn hộ'],
            'floor_plans' => [[
                'productType' => 'Căn hộ',
                'name' => 'Legacy A1',
                'image' => '/uploads/cover.jpg',
                'gallery' => ['/uploads/cover.jpg', '/uploads/detail.jpg'],
            ]],
            'floor_plan_groups' => null,
        ]);

        $migration = require database_path('migrations/2026_07_14_000014_add_floor_plan_groups_to_projects_table.php');
        $migration->up();

        $fresh = $project->fresh();
        $this->assertSame(['Căn hộ'], $fresh->floor_tabs);
        $this->assertSame('Legacy A1', $fresh->floor_plans[0]['name']);
        $this->assertSame('Căn hộ', $fresh->floor_plan_groups[0]['tabs'][0]['label']);
        $this->assertSame(
            ['/uploads/cover.jpg', '/uploads/detail.jpg'],
            $fresh->floor_plan_groups[0]['tabs'][0]['items'][0]['images']
        );
    }

    public function test_canonical_save_reload_dual_writes_legacy_and_keeps_stable_keys(): void
    {
        $project = $this->project();
        $groups = [[
            'key' => 'can-ho-group',
            'label' => 'Căn hộ',
            'tabs' => [[
                'key' => 'hai-phong-ngu',
                'label' => '2 phòng ngủ',
                'items' => [[
                    'key' => 'unit-a2',
                    'productType' => 'Căn góc',
                    'name' => 'Căn A2',
                    'area' => '72 m²',
                    'totalArea' => '78 m²',
                    'description' => 'Ban công rộng',
                    'price' => 'Từ 8 tỷ',
                    'bedrooms' => '2',
                    'status' => 'Còn hàng',
                    'images' => ['/uploads/a.jpg', '/uploads/b.jpg'],
                ]],
            ]],
        ], [
            'key' => 'biet-thu-group',
            'label' => 'Biệt thự',
            'tabs' => [[
                'key' => 'song-lap',
                'label' => 'Song lập',
                'items' => [[
                    'key' => 'villa-b1',
                    'productType' => 'Biệt thự',
                    'name' => 'Villa B1',
                    'area' => '220 m²',
                    'totalArea' => '350 m²',
                    'description' => '',
                    'price' => 'Liên hệ',
                    'bedrooms' => '4',
                    'status' => 'Còn hàng',
                    'images' => ['/uploads/villa.jpg'],
                ]],
            ]],
        ]];

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload($project, ['floor_plan_groups' => $groups]))
            ->assertOk()
            ->assertJsonPath('data.floor_plan_groups.0.key', 'can-ho-group')
            ->assertJsonPath('data.floor_plan_groups.0.tabs.0.items.0.images.1', '/uploads/b.jpg')
            ->assertJsonPath('data.floor_tabs.0', 'Căn hộ / 2 phòng ngủ')
            ->assertJsonPath('data.floor_plans.0.productType', 'Căn hộ / 2 phòng ngủ')
            ->assertJsonPath('data.floor_plans.0.images.1', '/uploads/b.jpg')
            ->assertJsonPath('data.floor_plan_groups.1.tabs.0.items.0.key', 'villa-b1')
            ->assertJsonPath('data.floor_tabs.1', 'Biệt thự / Song lập');

        $saved = $project->fresh();
        $this->assertSame('unit-a2', $saved->floor_plan_groups[0]['tabs'][0]['items'][0]['key']);

        $groups[0]['label'] = 'Căn hộ cao cấp';
        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload($project, ['floor_plan_groups' => $groups]))
            ->assertOk()
            ->assertJsonPath('data.floor_plan_groups.0.key', 'can-ho-group')
            ->assertJsonPath('data.floor_plan_groups.0.label', 'Căn hộ cao cấp');
    }

    public function test_legacy_only_request_is_converted_but_canonical_wins_when_both_are_present(): void
    {
        $project = $this->project();
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload($project, [
                'floor_tabs' => ['Legacy tab'],
                'floor_plans' => [[
                    'productType' => 'Legacy tab',
                    'name' => 'Legacy item',
                    'image' => '/uploads/legacy.jpg',
                    'images' => ['/uploads/legacy.jpg', '/uploads/legacy-2.jpg'],
                ]],
            ]))
            ->assertOk()
            ->assertJsonPath('data.floor_plan_groups.0.tabs.0.items.0.name', 'Legacy item')
            ->assertJsonPath('data.floor_plan_groups.0.tabs.0.items.0.images.1', '/uploads/legacy-2.jpg');

        $canonical = [[
            'key' => 'new-group',
            'label' => 'New group',
            'tabs' => [[
                'key' => 'new-tab',
                'label' => 'New tab',
                'items' => [[
                    'key' => 'new-item',
                    'productType' => '',
                    'name' => 'Canonical item',
                    'area' => '',
                    'totalArea' => '',
                    'description' => '',
                    'price' => '',
                    'bedrooms' => '',
                    'status' => '',
                    'images' => ['/uploads/new.jpg'],
                ]],
            ]],
        ]];

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload($project, [
                'floor_plan_groups' => $canonical,
                'floor_tabs' => ['Must not win'],
                'floor_plans' => [['name' => 'Must not win']],
            ]))
            ->assertOk()
            ->assertJsonPath('data.floor_plan_groups.0.tabs.0.items.0.name', 'Canonical item')
            ->assertJsonPath('data.floor_tabs.0', 'New group / New tab');
    }

    public function test_nested_validation_rejects_duplicate_keys_and_invalid_images(): void
    {
        $project = $this->project();
        $invalid = [
            [
                'key' => 'duplicate',
                'label' => 'One',
                'tabs' => [[
                    'key' => 'tab',
                    'label' => 'Tab',
                    'items' => [[
                        'key' => 'item',
                        'name' => 'Item',
                        'images' => ['javascript:alert(1)'],
                    ]],
                ]],
            ],
            ['key' => 'duplicate', 'label' => 'Two', 'tabs' => []],
        ];

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload($project, ['floor_plan_groups' => $invalid]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'floor_plan_groups.1.key',
                'floor_plan_groups.0.tabs.0.items.0.images.0',
            ]);
    }
}
