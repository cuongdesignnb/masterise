<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProjectSaveProofTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_project_save_returns_and_reloads_fresh_detail_fields(): void
    {
        $admin = User::factory()->create();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $admin->assignRole('admin');

        $project = Project::create([
            'name' => 'Hanoi Seasons Garden',
            'slug' => 'hanoi-seasons-garden',
            'description' => 'Initial description',
            'project_label' => 'Old label',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => true,
            'sort_order' => 0,
            'gallery_title' => 'Old gallery title',
            'gallery' => ['/uploads/old-gallery.jpg'],
            'quick_cards' => [['label' => 'Old quick card', 'value' => '1', 'icon' => 'MapPin']],
            'project_stats' => [['value' => '1', 'label' => 'Old stat']],
            'connectivity' => [['time' => '1 phút', 'label' => 'Old place']],
            'amenity_details' => [['title' => 'Old amenity', 'description' => 'Old', 'image' => '/uploads/old.jpg', 'icon' => 'Sparkles']],
            'floor_tabs' => ['Old tab'],
            'floor_plans' => [['productType' => 'Old', 'name' => 'Old floor', 'area' => '50 m2', 'totalArea' => '60 m2', 'image' => '/uploads/old-floor.jpg']],
            'handover_standards' => [['title' => 'Old standard', 'description' => 'Old', 'image' => '/uploads/old-standard.jpg', 'icon' => 'ClipboardCheck']],
            'price_rows' => [['Old type', '50 m2', '1 tỷ']],
            'policy_cards' => [['title' => 'Old policy', 'description' => 'Old', 'icon' => 'CalendarDays']],
            'project_timeline' => [['date' => 'Q1/2026', 'title' => 'Old milestone']],
            'investment_reasons' => [['title' => 'Old reason', 'description' => 'Old', 'icon' => 'TrendingUp']],
            'project_testimonials' => [['name' => 'Old customer', 'role' => 'Investor', 'content' => 'Old feedback', 'avatar' => '/uploads/avatar.jpg']],
            'project_faqs' => [['question' => 'Old question?', 'answer' => 'Old answer']],
        ]);

        $proofValue = 'Test lưu dữ liệu lúc phpunit';
        $payload = [
            'name' => $project->name,
            'slug' => $project->slug,
            'description' => $project->description,
            'project_label' => 'Lumiere Series',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => true,
            'sort_order' => 0,
            'gallery_label' => 'Proof label',
            'gallery_title' => $proofValue,
            'gallery_description' => 'Proof description',
            'gallery' => ['/uploads/proof-1.jpg', '/uploads/proof-2.jpg'],
            'quick_cards' => [['label' => 'Proof quick card', 'value' => '2', 'icon' => 'MapPin']],
            'project_facts' => [['label' => 'Proof fact', 'value' => 'Fact value', 'icon' => 'Building']],
            'project_stats' => [['value' => '2.000+', 'label' => 'Sản phẩm']],
            'connectivity' => [['time' => '5 phút', 'label' => 'Đến trung tâm']],
            'amenity_details' => [['title' => 'Proof amenity', 'description' => 'Proof', 'image' => '/uploads/proof-amenity.jpg', 'icon' => 'Sparkles']],
            'floor_tabs' => ['Nhà phố', 'Căn hộ'],
            'floor_plans' => [['productType' => 'Nhà phố', 'name' => 'Proof floor', 'area' => '80 m2', 'totalArea' => '120 m2', 'image' => '/uploads/proof-floor.jpg', 'images' => ['/uploads/proof-floor.jpg', '/uploads/proof-floor-2.jpg']]],
            'handover_standards' => [['title' => 'Proof standard', 'description' => 'Proof handover', 'image' => '/uploads/proof-standard.jpg', 'icon' => 'ClipboardCheck']],
            'price_rows' => [['Nhà phố', '80 - 120 m2', '8,9 tỷ']],
            'policy_cards' => [['title' => 'Proof policy', 'description' => 'Proof', 'icon' => 'CalendarDays']],
            'project_timeline' => [['date' => 'Q1/2026', 'title' => 'Proof milestone']],
            'investment_reasons' => [['title' => 'Proof reason', 'description' => 'Proof', 'icon' => 'TrendingUp']],
            'project_testimonials' => [['name' => 'Proof customer', 'role' => 'Nhà đầu tư', 'content' => 'Proof feedback', 'avatar' => '/uploads/proof-avatar.jpg']],
            'project_faqs' => [['question' => 'Proof question?', 'answer' => 'Proof answer']],
            'schema_price' => '8.9',
            'schema_price_currency' => 'VND',
            'schema_availability' => 'InStock',
        ];

        $putResponse = $this
            ->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/projects/{$project->id}", $payload);

        $putResponse
            ->assertOk()
            ->assertJsonPath('data.gallery_title', $proofValue)
            ->assertJsonPath('data.project_label', 'Lumiere Series')
            ->assertJsonPath('data.gallery.0', '/uploads/proof-1.jpg')
            ->assertJsonPath('data.quick_cards.0.label', 'Proof quick card')
            ->assertJsonPath('data.project_stats.0.value', '2.000+')
            ->assertJsonPath('data.schema_price', '8.9');

        $freshResponse = $this
            ->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/projects/{$project->id}");

        $cacheControl = $freshResponse->headers->get('Cache-Control', '');

        $freshResponse
            ->assertOk()
            ->assertJsonPath('data.gallery_title', $proofValue)
            ->assertJsonPath('data.project_label', 'Lumiere Series')
            ->assertJsonPath('data.gallery.1', '/uploads/proof-2.jpg')
            ->assertJsonPath('data.quick_cards.0.label', 'Proof quick card')
            ->assertJsonPath('data.project_facts.0.label', 'Proof fact')
            ->assertJsonPath('data.connectivity.0.time', '5 phút')
            ->assertJsonPath('data.amenity_details.0.image', '/uploads/proof-amenity.jpg')
            ->assertJsonPath('data.floor_tabs.1', 'Mặt bằng / Căn hộ')
            ->assertJsonPath('data.floor_plans.0.name', 'Proof floor')
            ->assertJsonPath('data.floor_plans.0.images.1', '/uploads/proof-floor-2.jpg')
            ->assertJsonPath('data.floor_plan_groups.0.tabs.0.items.0.name', 'Proof floor')
            ->assertJsonPath('data.handover_standards.0.title', 'Proof standard')
            ->assertJsonPath('data.handover_standards.0.image', '/uploads/proof-standard.jpg')
            ->assertJsonPath('data.price_rows.0.2', '8,9 tỷ')
            ->assertJsonPath('data.policy_cards.0.title', 'Proof policy')
            ->assertJsonPath('data.project_timeline.0.title', 'Proof milestone')
            ->assertJsonPath('data.investment_reasons.0.title', 'Proof reason')
            ->assertJsonPath('data.project_testimonials.0.name', 'Proof customer')
            ->assertJsonPath('data.project_faqs.0.answer', 'Proof answer')
            ->assertJsonPath('data.schema_availability', 'InStock');

        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('no-cache', $cacheControl);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'project_label' => 'Lumiere Series',
            'gallery_title' => $proofValue,
            'schema_price' => '8.9',
            'schema_price_currency' => 'VND',
            'schema_availability' => 'InStock',
        ]);
    }

    public function test_public_project_label_query_is_ignored_but_labels_remain_in_response(): void
    {
        Project::create([
            'name' => 'Masteri Collection Project',
            'slug' => 'masteri-collection-project',
            'description' => 'Published project',
            'project_label' => 'Masteri Collection',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => true,
            'sort_order' => 0,
        ]);

        Project::create([
            'name' => 'Lumiere Project',
            'slug' => 'lumiere-project',
            'description' => 'Published project',
            'project_label' => 'Lumiere Series',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => false,
            'is_published' => true,
            'sort_order' => 0,
        ]);

        $this->getJson('/api/v1/projects?project_label=Masteri%20Collection')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['project_label' => 'Masteri Collection'])
            ->assertJsonFragment(['project_label' => 'Lumiere Series']);
    }

    public function test_featured_projects_prioritize_hot_then_manual_sort_order(): void
    {
        Project::create([
            'name' => 'Normal Featured Low Sort',
            'slug' => 'normal-featured-low-sort',
            'description' => 'Normal featured project',
            'project_status' => 'selling',
            'is_featured' => true,
            'is_hot' => false,
            'is_published' => true,
            'sort_order' => 1,
            'open_sale_at' => '2026-01-01',
        ]);

        Project::create([
            'name' => 'Hot Featured Later Sort',
            'slug' => 'hot-featured-later-sort',
            'description' => 'Hot featured project',
            'project_status' => 'selling',
            'is_featured' => true,
            'is_hot' => true,
            'is_published' => true,
            'sort_order' => 5,
            'open_sale_at' => '2026-01-01',
        ]);

        Project::create([
            'name' => 'Hot Featured First Sort',
            'slug' => 'hot-featured-first-sort',
            'description' => 'Hot featured project first',
            'project_status' => 'selling',
            'is_featured' => true,
            'is_hot' => true,
            'is_published' => true,
            'sort_order' => 2,
            'open_sale_at' => '2026-01-01',
        ]);

        Project::create([
            'name' => 'Not Featured',
            'slug' => 'not-featured',
            'description' => 'Should not appear',
            'project_status' => 'selling',
            'is_featured' => false,
            'is_hot' => true,
            'is_published' => true,
            'sort_order' => 0,
        ]);

        $this->getJson('/api/v1/projects/featured?limit=3')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'hot-featured-first-sort')
            ->assertJsonPath('data.1.slug', 'hot-featured-later-sort')
            ->assertJsonPath('data.2.slug', 'normal-featured-low-sort');
    }
}
