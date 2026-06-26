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
            'status' => 'selling',
            'sales_status' => 'selling',
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
            'status' => 'selling',
            'sales_status' => 'selling',
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
            'floor_plans' => [['productType' => 'Nhà phố', 'name' => 'Proof floor', 'area' => '80 m2', 'totalArea' => '120 m2', 'image' => '/uploads/proof-floor.jpg']],
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
            ->assertJsonPath('data.gallery.1', '/uploads/proof-2.jpg')
            ->assertJsonPath('data.quick_cards.0.label', 'Proof quick card')
            ->assertJsonPath('data.project_facts.0.label', 'Proof fact')
            ->assertJsonPath('data.connectivity.0.time', '5 phút')
            ->assertJsonPath('data.amenity_details.0.image', '/uploads/proof-amenity.jpg')
            ->assertJsonPath('data.floor_tabs.1', 'Căn hộ')
            ->assertJsonPath('data.floor_plans.0.name', 'Proof floor')
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
            'gallery_title' => $proofValue,
            'schema_price' => '8.9',
            'schema_price_currency' => 'VND',
            'schema_availability' => 'InStock',
        ]);
    }
}
