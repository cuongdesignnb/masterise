<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectDetailConsultLeadTest extends TestCase
{
    use RefreshDatabase;

    private const INTEREST_OPTIONS = [
        'Studio',
        '1BR, 1BR+, 1BR+1MR',
        '2BR, 2BR+, 2BR+1MR',
        '3BR, 3BR+, 3BR+1MR, 3BR Lift',
        '4BR, 4BR Lift, Duplex, Penthouse',
    ];

    public function test_project_detail_form_records_fixed_interest_group_and_project(): void
    {
        Role::create(['name' => 'sale', 'guard_name' => 'web']);

        $project = Project::create([
            'name' => 'LUMIÈRE Test Project',
            'slug' => 'lumiere-test-project',
            'project_status' => 'selling',
            'is_published' => true,
        ]);

        foreach (self::INTEREST_OPTIONS as $index => $interest) {
            $response = $this->postJson('/api/v1/leads', [
                'name' => 'Khách hàng '.($index + 1),
                'phone' => '09000000'.($index + 1),
                'type' => 'consultation',
                'project_id' => $project->id,
                'demand_type' => $interest,
                'product_type' => $interest,
                'lead_source_position' => 'project_detail_consult_form',
            ]);

            $response
                ->assertCreated()
                ->assertJsonPath('data.project_id', $project->id)
                ->assertJsonPath('data.demand_type', $interest)
                ->assertJsonPath('data.product_type', $interest);

            $this->assertDatabaseHas('leads', [
                'phone' => '09000000'.($index + 1),
                'project_id' => $project->id,
                'demand_type' => $interest,
                'product_type' => $interest,
                'lead_source_position' => 'project_detail_consult_form',
            ]);
        }
    }

    public function test_project_detail_form_rejects_dynamic_interest_and_missing_project(): void
    {
        $this->postJson('/api/v1/leads', [
            'name' => 'Khách hàng sai dữ liệu',
            'phone' => '0912345678',
            'type' => 'consultation',
            'demand_type' => 'Tab lấy từ mặt bằng',
            'product_type' => 'Tab lấy từ mặt bằng',
            'lead_source_position' => 'project_detail_consult_form',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['project_id', 'demand_type', 'product_type']);
    }
}
