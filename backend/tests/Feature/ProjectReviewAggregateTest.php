<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewAggregateTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_aggregate_uses_the_same_public_scope_as_items(): void
    {
        $project = $this->project();
        $this->review($project, ['rating' => 4]);
        $this->review($project, ['rating' => 5]);
        $this->review($project, ['rating' => 1, 'moderation_status' => 'pending', 'is_published' => false]);

        $this->getJson("/api/v1/projects/{$project->slug}/reviews")
            ->assertOk()->assertJsonPath('data.aggregate.ratingValue', 4.5)
            ->assertJsonPath('data.aggregate.ratingCount', 2)->assertJsonPath('data.aggregate.reviewCount', 2);
    }
}
