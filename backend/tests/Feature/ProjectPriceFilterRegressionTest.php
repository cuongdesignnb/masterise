<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Region;
use App\Models\User;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectPriceFilterRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function project(array $overrides = []): Project
    {
        return Project::create(array_merge([
            'name' => 'Dự án '.uniqid(),
            'slug' => 'du-an-'.uniqid(),
            'project_status' => 'selling',
            'is_published' => true,
        ], $overrides));
    }

    private function category(string $slug = 'can-ho-cao-cap'): ProjectCategory
    {
        return ProjectCategory::create([
            'name' => str($slug)->replace('-', ' ')->title()->toString(),
            'slug' => $slug,
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
    }

    private function admin(): User
    {
        $admin = User::factory()->create();
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        return $admin;
    }

    private function assertRangeContains(string $range, Project $expected): void
    {
        $response = $this->getJson("/api/v1/projects?price_range={$range}&per_page=100")
            ->assertOk();

        $this->assertContains($expected->id, collect($response->json('data'))->pluck('id')->all());
    }

    public function test_01_under_5_uses_starting_price_only(): void
    {
        $expected = $this->project(['price_min' => 4_999_999_999, 'price_max' => 80_000_000_000]);
        $this->project(['price_min' => 5_000_000_000]);

        $this->getJson('/api/v1/projects?price_range=under-5')->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_02_five_billion_boundary_belongs_to_5_10_only(): void
    {
        $project = $this->project(['price_min' => 5_000_000_000]);
        $this->assertRangeContains('5-10', $project);
        $this->getJson('/api/v1/projects?price_range=under-5')->assertJsonMissing(['id' => $project->id]);
    }

    public function test_03_ten_billion_boundary_belongs_to_10_20(): void
    {
        $project = $this->project(['price_min' => 10_000_000_000]);
        $this->assertRangeContains('10-20', $project);
        $this->getJson('/api/v1/projects?price_range=5-10')->assertJsonMissing(['id' => $project->id]);
    }

    public function test_04_twenty_billion_boundary_belongs_to_20_50(): void
    {
        $project = $this->project(['price_min' => 20_000_000_000]);
        $this->assertRangeContains('20-50', $project);
        $this->getJson('/api/v1/projects?price_range=10-20')->assertJsonMissing(['id' => $project->id]);
    }

    public function test_05_fifty_billion_boundary_belongs_to_above_50(): void
    {
        $project = $this->project(['price_min' => 50_000_000_000]);
        $this->assertRangeContains('above-50', $project);
        $this->getJson('/api/v1/projects?price_range=20-50')->assertJsonMissing(['id' => $project->id]);
    }

    public function test_06_each_project_belongs_to_exactly_one_range(): void
    {
        $project = $this->project(['price_min' => 7_200_000_000, 'price_max' => 60_000_000_000]);
        $matches = 0;

        foreach (['under-5', '5-10', '10-20', '20-50', 'above-50'] as $range) {
            $ids = collect($this->getJson("/api/v1/projects?price_range={$range}")->json('data'))->pluck('id');
            $matches += $ids->contains($project->id) ? 1 : 0;
        }

        $this->assertSame(1, $matches);
    }

    public function test_07_project_without_price_is_excluded_from_specific_range(): void
    {
        $project = $this->project(['price_min' => null]);
        $this->getJson('/api/v1/projects?price_range=under-5')->assertJsonMissing(['id' => $project->id]);
    }

    public function test_08_project_without_price_is_included_without_price_filter(): void
    {
        $project = $this->project(['price_min' => null]);
        $this->getJson('/api/v1/projects')->assertJsonFragment(['id' => $project->id]);
    }

    public function test_09_category_combines_with_price_range(): void
    {
        $category = $this->category();
        $expected = $this->project(['price_min' => 5_500_000_000]);
        $expected->categories()->sync([$category->id]);
        $this->project(['price_min' => 5_500_000_000]);

        $this->getJson('/api/v1/projects?category=can-ho-cao-cap&price_range=5-10')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_10_region_combines_with_price_range(): void
    {
        $north = Region::where('slug', 'mien-bac')->firstOrFail();
        $south = Region::where('slug', 'mien-nam')->firstOrFail();
        $northLocation = Location::create(['name' => 'Hà Nội test', 'slug' => 'ha-noi-price', 'region_id' => $north->id]);
        $southLocation = Location::create(['name' => 'HCM test', 'slug' => 'hcm-price', 'region_id' => $south->id]);
        $expected = $this->project(['price_min' => 12_000_000_000, 'location_id' => $northLocation->id]);
        $this->project(['price_min' => 12_000_000_000, 'location_id' => $southLocation->id]);

        $this->getJson('/api/v1/projects?region=mien-bac&price_range=10-20')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_11_project_status_combines_with_price_range(): void
    {
        $expected = $this->project(['price_min' => 12_000_000_000, 'project_status' => 'selling']);
        $this->project(['price_min' => 12_000_000_000, 'project_status' => 'handover']);

        $this->getJson('/api/v1/projects?project_status=selling&price_range=10-20')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expected->id);
    }

    public function test_12_total_price_validation_rejects_negative_and_inverted_values(): void
    {
        $payload = ['name' => 'Giá lỗi', 'slug' => 'gia-loi', 'project_status' => 'selling', 'price_min' => 10, 'price_max' => 5];
        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/projects', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('price_max');

        $payload['slug'] = 'gia-am';
        $payload['price_min'] = -1;
        $payload['price_max'] = null;
        $this->postJson('/api/v1/projects', $payload)->assertJsonValidationErrors('price_min');
    }

    public function test_13_price_per_sqm_validation_rejects_negative_and_inverted_values(): void
    {
        $payload = [
            'name' => 'Giá m2 lỗi', 'slug' => 'gia-m2-loi', 'project_status' => 'selling',
            'price_per_sqm_min' => 100_000_000, 'price_per_sqm_max' => 90_000_000,
        ];

        $this->actingAs($this->admin(), 'sanctum')->postJson('/api/v1/projects', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('price_per_sqm_max');
    }

    public function test_14_create_save_reload_keeps_prices_and_generates_display_text(): void
    {
        $payload = [
            'name' => 'Dự án lưu giá', 'slug' => 'du-an-luu-gia', 'project_status' => 'selling',
            'price_min' => 5_500_000_000, 'price_max' => 8_000_000_000,
            'price_per_sqm_min' => 100_000_000, 'price_per_sqm_max' => 120_000_000,
            'price_text' => '', 'is_published' => false,
        ];

        $response = $this->actingAs($this->admin(), 'sanctum')
            ->postJson('/api/v1/projects', $payload)
            ->assertCreated()
            ->assertJsonPath('data.price_text', 'Từ 5,5 tỷ');

        $this->getJson('/api/v1/admin/projects/'.$response->json('data.id'))
            ->assertOk()
            ->assertJsonPath('data.price_min', '5500000000.00')
            ->assertJsonPath('data.price_per_sqm_min', '100000000.00');
    }

    public function test_15_migration_moves_legacy_sqm_price_and_sets_total_price_by_slug(): void
    {
        $project = $this->project([
            'slug' => 'the-global-city', 'price_min' => 100_000_000, 'price_max' => 150_000_000,
            'price_text' => 'Từ 8,9 tỷ/căn',
        ]);
        $migration = require database_path('migrations/2026_07_14_000013_normalize_project_prices.php');
        $migration->up();

        $project->refresh();
        $this->assertSame('8900000000.00', $project->price_min);
        $this->assertNull($project->price_max);
        $this->assertSame('100000000.00', $project->price_per_sqm_min);
        $this->assertSame('150000000.00', $project->price_per_sqm_max);
    }

    public function test_16_project_seeder_creates_normalized_price_data(): void
    {
        $this->seed(ProjectSeeder::class);

        $globalCity = Project::where('slug', 'the-global-city')->firstOrFail();
        $this->assertSame('8900000000.00', $globalCity->price_min);
        $this->assertSame('100000000.00', $globalCity->price_per_sqm_min);
        $this->assertNull($globalCity->price_max);
        $this->assertNull(Project::where('slug', 'lumiere-midtown')->firstOrFail()->price_min);
    }

    public function test_17_price_sort_puts_null_last_in_both_directions(): void
    {
        $low = $this->project(['price_min' => 4_000_000_000]);
        $high = $this->project(['price_min' => 50_000_000_000]);
        $null = $this->project(['price_min' => null]);

        $ascending = collect($this->getJson('/api/v1/projects?sort_by=price_min&sort_order=asc')->json('data'))->pluck('id')->all();
        $descending = collect($this->getJson('/api/v1/projects?sort_by=price_min&sort_order=desc')->json('data'))->pluck('id')->all();

        $this->assertSame([$low->id, $high->id, $null->id], $ascending);
        $this->assertSame([$high->id, $low->id, $null->id], $descending);
    }

    public function test_18_api_never_uses_price_text_for_range_filtering(): void
    {
        $wrongText = $this->project(['price_min' => 55_000_000_000, 'price_text' => 'Từ 4 tỷ/căn']);
        $expected = $this->project(['price_min' => 4_000_000_000, 'price_text' => 'Từ 60 triệu/m²']);

        $this->getJson('/api/v1/projects?price_range=under-5')
            ->assertJsonFragment(['id' => $expected->id])
            ->assertJsonMissing(['id' => $wrongText->id]);
    }

    public function test_19_invalid_price_range_is_rejected(): void
    {
        $this->getJson('/api/v1/projects?price_range=invalid')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('price_range');
    }
}
