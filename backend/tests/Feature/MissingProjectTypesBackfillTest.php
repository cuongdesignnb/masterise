<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MissingProjectTypesBackfillTest extends TestCase
{
    use RefreshDatabase;

    private const PROJECTS = [
        'masterise-grand-view' => ['Masterise Grand View', 'masterise'],
        'masterise-central-point' => ['Masterise Central Point', 'masterise'],
        'masterise-riverside' => ['Masterise Riverside', 'masterise'],
        'lumiere-riverside' => ['Lumiere Riverside', 'lumiere'],
        'lumiere-midtown' => ['Lumiere Midtown', 'lumiere'],
    ];

    private function migration(): object
    {
        return require database_path('migrations/2026_07_14_000012_assign_missing_project_types.php');
    }

    private function seedFixture(bool $preassignFirstProject = false): array
    {
        $apartment = ProjectCategory::create([
            'name' => 'Căn hộ cao cấp',
            'slug' => 'can-ho-cao-cap',
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        $shophouse = ProjectCategory::create([
            'name' => 'Shophouse thương mại',
            'slug' => 'shophouse-thuong-mai',
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        ProjectCategory::create([
            'name' => 'Biệt thự & dinh thự',
            'slug' => 'biet-thu-dinh-thu',
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        $masterise = ProjectCategory::create([
            'name' => 'Masterise Collection',
            'slug' => 'masterise-colletion',
            'taxonomy_type' => ProjectCategory::TYPE_COLLECTION,
        ]);
        $lumiere = ProjectCategory::create([
            'name' => 'Lumiere Series',
            'slug' => 'lumiere-series',
            'taxonomy_type' => ProjectCategory::TYPE_COLLECTION,
        ]);

        $north = Region::where('slug', 'mien-bac')->firstOrFail();
        $south = Region::where('slug', 'mien-nam')->firstOrFail();
        $northLocation = Location::create([
            'name' => 'Hà Nội Backfill',
            'slug' => 'ha-noi-backfill',
            'region_id' => $north->id,
        ]);
        $southLocation = Location::create([
            'name' => 'TP HCM Backfill',
            'slug' => 'hcm-backfill',
            'region_id' => $south->id,
        ]);

        $projects = collect();
        foreach (self::PROJECTS as $index => $definition) {
            [$name, $collection] = $definition;
            $project = Project::create([
                'name' => $name,
                'slug' => $index,
                'description' => 'Dự án căn hộ cao cấp',
                'scale' => 'Căn hộ cao cấp',
                'project_label' => $index === 'masterise-grand-view' ? 'Mới ra mắt' : null,
                'project_status' => $index === 'lumiere-midtown' ? 'coming_soon' : 'selling',
                'location_id' => str_contains($index, 'lumiere') ? $southLocation->id : $northLocation->id,
                'region' => str_contains($index, 'lumiere') ? $south->name : $north->name,
                'price_min' => 100,
                'price_max' => 200,
                'is_published' => true,
            ]);
            $project->categories()->attach($collection === 'masterise' ? $masterise->id : $lumiere->id);
            $projects->push($project);
        }

        if ($preassignFirstProject) {
            $projects->first()->categories()->attach($apartment->id);
        }

        $draft = Project::create([
            'name' => 'Draft Apartment',
            'slug' => 'draft-apartment-backfill',
            'project_status' => 'selling',
            'price_min' => 100,
            'price_max' => 200,
            'is_published' => false,
        ]);
        $draft->categories()->attach($apartment->id);

        return compact('apartment', 'shophouse', 'masterise', 'lumiere', 'projects', 'draft', 'north', 'south');
    }

    public function test_01_backfill_assigns_all_missing_types_and_preserves_public_behavior(): void
    {
        $fixture = $this->seedFixture();
        $projectCountBefore = Project::count();

        $this->migration()->up();
        $this->migration()->up();

        $targetSlugs = array_keys(self::PROJECTS);
        $this->assertSame(5, Project::whereIn('slug', $targetSlugs)
            ->whereHas('categories', fn ($query) => $query
                ->where('slug', 'can-ho-cao-cap')
                ->where('taxonomy_type', ProjectCategory::TYPE_PROJECT))
            ->count());
        $this->assertSame(5, DB::table('project_type_backfill_20260714')->count());
        $this->assertSame(5, DB::table('project_category_project')
            ->where('project_category_id', $fixture['apartment']->id)
            ->whereIn('project_id', $fixture['projects']->pluck('id'))
            ->count());
        $this->assertSame(5, DB::table('project_category_project')
            ->whereIn('project_category_id', [$fixture['masterise']->id, $fixture['lumiere']->id])
            ->whereIn('project_id', $fixture['projects']->pluck('id'))
            ->count());
        $this->assertSame($projectCountBefore, Project::count());

        $fixture['projects']->first()->categories()->attach($fixture['shophouse']->id);

        $categories = $this->getJson('/api/v1/project-categories')->assertOk();
        $categories->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'can-ho-cao-cap')
            ->assertJsonPath('data.0.projects_count', 5)
            ->assertJsonMissing(['slug' => 'biet-thu-dinh-thu'])
            ->assertJsonMissing(['slug' => 'masterise-colletion'])
            ->assertJsonMissing(['slug' => 'lumiere-series']);

        $filtered = $this->getJson('/api/v1/projects?category=can-ho-cao-cap&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 5)
            ->assertJsonCount(5, 'data');
        $this->assertEqualsCanonicalizing($targetSlugs, collect($filtered->json('data'))->pluck('slug')->all());

        $this->getJson('/api/v1/projects?category=shophouse-thuong-mai&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/projects?category=can-ho-cao-cap&project_label=Khac&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 5);
        $this->getJson('/api/v1/projects?category=can-ho-cao-cap&project_status=selling&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 4);
        $this->getJson('/api/v1/projects?category=can-ho-cao-cap&region=mien-bac&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
        $this->getJson('/api/v1/projects?category=can-ho-cao-cap&price_max=250&per_page=20')
            ->assertOk()
            ->assertJsonPath('meta.total', 5);

        $this->assertSame(0, DB::table('project_category_project')
            ->select('project_id', 'project_category_id', DB::raw('COUNT(*) as relation_count'))
            ->groupBy('project_id', 'project_category_id')
            ->having('relation_count', '>', 1)
            ->count());
    }

    public function test_02_down_only_removes_relations_added_by_this_migration(): void
    {
        $fixture = $this->seedFixture(true);
        $firstProject = $fixture['projects']->first();

        $migration = $this->migration();
        $migration->up();
        $migration->down();

        $this->assertDatabaseHas('project_category_project', [
            'project_id' => $firstProject->id,
            'project_category_id' => $fixture['apartment']->id,
        ]);
        $this->assertSame(0, DB::table('project_category_project')
            ->where('project_category_id', $fixture['apartment']->id)
            ->whereIn('project_id', $fixture['projects']->skip(1)->pluck('id'))
            ->count());
        $this->assertSame(5, DB::table('project_category_project')
            ->whereIn('project_category_id', [$fixture['masterise']->id, $fixture['lumiere']->id])
            ->whereIn('project_id', $fixture['projects']->pluck('id'))
            ->count());
        $this->assertFalse(Schema::hasTable('project_type_backfill_20260714'));
    }

    public function test_03_backfill_processes_available_projects_when_other_expected_slugs_are_missing(): void
    {
        $apartment = ProjectCategory::create([
            'name' => 'Căn hộ cao cấp',
            'slug' => 'can-ho-cao-cap',
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        Project::create([
            'name' => 'Masterise Grand View',
            'slug' => 'masterise-grand-view',
            'project_status' => 'selling',
            'is_published' => true,
        ]);

        Log::spy();
        $this->migration()->up();

        $this->assertSame(1, DB::table('project_category_project')
            ->where('project_category_id', $apartment->id)
            ->count());
        $this->assertSame(1, DB::table('project_type_backfill_20260714')->count());
        Log::shouldHaveReceived('warning')->once();
    }

    public function test_04_backfill_ignores_unrelated_production_projects(): void
    {
        $category = ProjectCategory::create([
            'name' => 'Căn hộ cao cấp',
            'slug' => 'can-ho-cao-cap',
            'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
        ]);
        $unrelated = Project::create([
            'name' => 'Dự án production khác',
            'slug' => 'du-an-production-khac',
            'project_status' => 'selling',
            'is_published' => true,
        ]);

        $this->migration()->up();
        $this->migration()->up();

        $this->assertDatabaseMissing('project_category_project', [
            'project_id' => $unrelated->id,
            'project_category_id' => $category->id,
        ]);
        $this->assertSame(0, DB::table('project_type_backfill_20260714')->count());
    }

    public function test_05_missing_category_is_logged_and_skipped_safely(): void
    {
        $project = Project::create([
            'name' => 'Masterise Grand View',
            'slug' => 'masterise-grand-view',
            'project_status' => 'selling',
            'is_published' => true,
        ]);

        Log::spy();
        $this->migration()->up();

        $this->assertSame(0, DB::table('project_category_project')->where('project_id', $project->id)->count());
        $this->assertSame(0, DB::table('project_type_backfill_20260714')->count());
        Log::shouldHaveReceived('warning')->twice();
    }

    public function test_06_empty_projects_table_is_a_safe_no_op(): void
    {
        $this->assertSame(0, Project::count());

        $this->migration()->up();
        $this->migration()->up();

        $this->assertTrue(Schema::hasTable('project_type_backfill_20260714'));
        $this->assertSame(0, DB::table('project_type_backfill_20260714')->count());
    }
}
