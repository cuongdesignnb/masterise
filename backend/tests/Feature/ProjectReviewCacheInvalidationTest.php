<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewCacheInvalidationTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_moderation_increments_project_cache_versions(): void
    {
        $project = $this->project();
        $review = $this->review($project, ['moderation_status' => 'pending', 'is_published' => false]);
        $this->actingAs($this->userWithRole('admin'), 'sanctum')
            ->postJson("/api/v1/admin/project-reviews/{$review->id}/approve")->assertOk();

        $this->assertSame(2, Cache::get("public-content-version:project-{$project->slug}"));
        $this->assertSame(2, Cache::get("public-content-version:project-reviews-{$project->slug}"));
    }
}
