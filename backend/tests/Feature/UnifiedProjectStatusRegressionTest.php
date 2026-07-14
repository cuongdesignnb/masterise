<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Support\ProjectStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UnifiedProjectStatusRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        return $admin;
    }

    private function project(array $overrides = []): Project
    {
        return Project::create(array_merge([
            'name' => 'Dự án '.uniqid(),
            'slug' => 'du-an-'.uniqid(),
            'project_status' => ProjectStatus::COMING_SOON,
            'is_published' => true,
        ], $overrides));
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Dự án API',
            'slug' => 'du-an-api-'.uniqid(),
            'project_status' => ProjectStatus::SELLING,
            'is_published' => false,
        ], $overrides);
    }

    public function test_01_migration_creates_project_status(): void
    {
        $project = $this->project(['project_status' => ProjectStatus::HANDOVER]);
        $migration = require database_path('migrations/2026_07_13_000010_unify_project_status.php');

        $migration->down();
        DB::table('projects')->where('id', $project->id)->update([
            'status' => 'upcoming',
            'sales_status' => 'coming_soon',
        ]);
        $migration->up();

        $this->assertTrue(Schema::hasColumn('projects', 'project_status'));
        $this->assertSame(ProjectStatus::COMING_SOON, Project::findOrFail($project->id)->project_status);
    }

    public function test_02_maps_upcoming_to_coming_soon(): void
    {
        $this->assertSame(ProjectStatus::COMING_SOON, ProjectStatus::fromLegacy(null, 'upcoming'));
    }

    public function test_03_maps_selling_to_selling(): void
    {
        $this->assertSame(ProjectStatus::SELLING, ProjectStatus::fromLegacy(null, 'selling'));
    }

    public function test_04_maps_completed_to_handover(): void
    {
        $this->assertSame(ProjectStatus::HANDOVER, ProjectStatus::fromLegacy(null, 'completed'));
    }

    public function test_05_keeps_sold_out(): void
    {
        $this->assertSame(ProjectStatus::SOLD_OUT, ProjectStatus::fromLegacy('sold_out', 'selling'));
    }

    public function test_06_keeps_handing_over(): void
    {
        $this->assertSame(ProjectStatus::HANDING_OVER, ProjectStatus::fromLegacy('handing_over', 'completed'));
    }

    public function test_07_valid_sales_status_wins_when_legacy_fields_conflict(): void
    {
        $this->assertSame(ProjectStatus::SELLING, ProjectStatus::fromLegacy('selling', 'completed'));
    }

    public function test_08_legacy_status_column_is_removed(): void
    {
        $this->assertFalse(Schema::hasColumn('projects', 'status'));
    }

    public function test_09_legacy_sales_status_column_is_removed(): void
    {
        $this->assertFalse(Schema::hasColumn('projects', 'sales_status'));
    }

    public function test_10_admin_can_create_project_with_project_status(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/projects', $this->payload())
            ->assertCreated()
            ->assertJsonPath('data.project_status', ProjectStatus::SELLING);
    }

    public function test_11_admin_can_update_project_status(): void
    {
        $project = $this->project(['is_published' => false]);

        $this->actingAs($this->admin(), 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $this->payload([
                'name' => $project->name,
                'slug' => $project->slug,
                'project_status' => ProjectStatus::HANDING_OVER,
            ]))
            ->assertOk()
            ->assertJsonPath('data.project_status', ProjectStatus::HANDING_OVER);
    }

    public function test_12_invalid_project_status_is_rejected(): void
    {
        $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/projects', $this->payload(['project_status' => 'invalid']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('project_status');
    }

    public function test_13_public_filter_supports_every_project_status(): void
    {
        foreach (ProjectStatus::values() as $status) {
            $this->project(['name' => 'Public '.$status, 'project_status' => $status]);
        }

        foreach (ProjectStatus::values() as $status) {
            $response = $this->getJson('/api/v1/projects?project_status='.$status)->assertOk();
            $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.project_status', $status);
        }
    }

    public function test_14_admin_filter_supports_every_project_status(): void
    {
        foreach (ProjectStatus::values() as $status) {
            $this->project(['name' => 'Admin '.$status, 'project_status' => $status, 'is_published' => false]);
        }

        foreach (ProjectStatus::values() as $status) {
            $response = $this->actingAs($this->admin(), 'sanctum')
                ->getJson('/api/v1/admin/projects?project_status='.$status)
                ->assertOk();
            $response->assertJsonCount(1, 'data')->assertJsonPath('data.0.project_status', $status);
        }
    }

    public function test_15_filter_does_not_return_other_statuses(): void
    {
        $this->project(['name' => 'Đang bán', 'project_status' => ProjectStatus::SELLING]);
        $this->project(['name' => 'Đã hết', 'project_status' => ProjectStatus::SOLD_OUT]);

        $this->getJson('/api/v1/projects?project_status=sold_out')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Đã hết');
    }

    public function test_16_project_detail_returns_project_status(): void
    {
        $project = $this->project(['project_status' => ProjectStatus::HANDOVER]);

        $this->getJson('/api/v1/projects/'.$project->slug)
            ->assertOk()
            ->assertJsonPath('data.project.project_status', ProjectStatus::HANDOVER);
    }

    public function test_17_api_response_does_not_expose_legacy_fields(): void
    {
        $project = $this->project();
        $data = $this->getJson('/api/v1/projects/'.$project->slug)
            ->assertOk()
            ->json('data.project');

        $this->assertArrayNotHasKey('status', $data);
        $this->assertArrayNotHasKey('sales_status', $data);
    }

    public function test_18_is_published_remains_independent(): void
    {
        $published = $this->project(['name' => 'Published', 'project_status' => ProjectStatus::SELLING]);
        $draft = $this->project(['name' => 'Draft', 'project_status' => ProjectStatus::SELLING, 'is_published' => false]);

        $this->assertTrue($published->is_published);
        $this->assertFalse($draft->is_published);
    }

    public function test_19_draft_project_is_not_exposed_publicly(): void
    {
        $this->project(['name' => 'Draft', 'project_status' => ProjectStatus::SELLING, 'is_published' => false]);

        $this->getJson('/api/v1/projects?project_status=selling')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_20_price_row_status_is_not_affected(): void
    {
        $project = $this->project([
            'price_rows' => [['productType' => 'Căn hộ', 'status' => 'Còn hàng']],
        ]);

        $this->assertSame('Còn hàng', $project->fresh()->price_rows[0]['status']);
    }

    public function test_21_timeline_and_handover_fields_are_not_affected(): void
    {
        $project = $this->project([
            'project_timeline' => [['date' => '2026', 'title' => 'Đang thi công']],
            'handover_year' => 2027,
            'handover_time' => 'Q4/2027',
            'handover_standards' => [['title' => 'Hoàn thiện', 'description' => 'Tiêu chuẩn cao cấp']],
        ])->fresh();

        $this->assertSame('Đang thi công', $project->project_timeline[0]['title']);
        $this->assertSame(2027, $project->handover_year);
        $this->assertSame('Q4/2027', $project->handover_time);
        $this->assertSame('Hoàn thiện', $project->handover_standards[0]['title']);
    }

    public function test_22_legacy_query_aliases_are_temporarily_supported(): void
    {
        $this->project(['name' => 'Legacy alias', 'project_status' => ProjectStatus::HANDOVER]);

        $this->getJson('/api/v1/projects?status=completed')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/projects?sales_status=handover')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_23_migration_keeps_legacy_columns_when_values_are_unmappable(): void
    {
        $project = $this->project();
        $migration = require database_path('migrations/2026_07_13_000010_unify_project_status.php');
        $migration->down();

        DB::table('projects')->where('id', $project->id)->update([
            'status' => 'unknown_status',
            'sales_status' => 'unknown_sales_status',
        ]);

        try {
            $migration->up();
            $this->fail('The migration should stop for unmappable values.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString((string) $project->id, $exception->getMessage());
            $this->assertTrue(Schema::hasColumn('projects', 'status'));
            $this->assertTrue(Schema::hasColumn('projects', 'sales_status'));
        } finally {
            DB::table('projects')->where('id', $project->id)->update([
                'status' => 'selling',
                'sales_status' => 'selling',
            ]);
            $migration->up();
        }
    }
}
