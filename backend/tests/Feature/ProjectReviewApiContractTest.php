<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewApiContractTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_public_resource_does_not_expose_moderation_fields(): void
    {
        $project = $this->project();
        $this->review($project, ['source_url' => 'https://example.test/private']);
        $item = $this->getJson("/api/v1/projects/{$project->slug}/reviews")->assertOk()->json('data.items.0');

        $this->assertSame(['id', 'reviewer_name', 'reviewer_role', 'rating', 'review_body', 'reviewed_at', 'is_verified'], array_keys($item));
        $this->assertArrayNotHasKey('moderation_status', $item);
        $this->assertArrayNotHasKey('source_url', $item);
    }

    public function test_admin_resource_includes_project_summary(): void
    {
        $review = $this->review($this->project());
        $this->actingAs($this->userWithRole('admin'), 'sanctum')
            ->getJson("/api/v1/admin/project-reviews/{$review->id}")
            ->assertOk()->assertJsonPath('data.project.id', $review->project_id);
    }

    public function test_project_detail_uses_the_same_review_bundle_contract(): void
    {
        $project = $this->project();
        $review = $this->review($project);

        $this->getJson("/api/v1/projects/{$project->slug}")
            ->assertOk()
            ->assertJsonPath('data.project.reviews.items.0.id', $review->id)
            ->assertJsonPath('data.project.reviews.aggregate.ratingCount', 1)
            ->assertJsonMissingPath('data.project.reviews.items.0.moderation_status');
    }
}
