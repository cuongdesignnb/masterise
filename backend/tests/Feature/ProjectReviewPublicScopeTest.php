<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewPublicScopeTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_only_approved_and_published_reviews_are_public(): void
    {
        $project = $this->project();
        $visible = $this->review($project);
        $this->review($project, ['moderation_status' => 'pending', 'is_published' => true, 'reviewer_name' => 'Pending']);
        $this->review($project, ['moderation_status' => 'rejected', 'is_published' => true, 'reviewer_name' => 'Rejected']);
        $this->review($project, ['moderation_status' => 'approved', 'is_published' => false, 'reviewer_name' => 'Unpublished']);

        $this->getJson("/api/v1/projects/{$project->slug}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data.items')
            ->assertJsonPath('data.items.0.id', $visible->id);
    }

    public function test_unpublished_project_has_no_public_review_endpoint(): void
    {
        $project = $this->project(['is_published' => false]);
        $this->review($project);
        $this->getJson("/api/v1/projects/{$project->slug}/reviews")->assertNotFound();
    }
}
