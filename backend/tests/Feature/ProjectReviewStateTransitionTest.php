<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewStateTransitionTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_pending_and_rejected_reviews_cannot_remain_published(): void
    {
        $project = $this->project();
        foreach (['pending', 'rejected'] as $status) {
            $review = $this->review($project, ['moderation_status' => $status, 'is_published' => true]);
            $this->assertFalse($review->fresh()->is_published);
        }
    }

    public function test_admin_update_rejects_illegal_published_pending_state(): void
    {
        $review = $this->review($this->project());
        $this->actingAs($this->userWithRole('admin'), 'sanctum')
            ->putJson("/api/v1/admin/project-reviews/{$review->id}", ['moderation_status' => 'pending', 'is_published' => true])
            ->assertUnprocessable()->assertJsonValidationErrors('is_published');
    }
}
