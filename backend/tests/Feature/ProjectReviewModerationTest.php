<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewModerationTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_admin_can_approve_and_reject_with_reason(): void
    {
        $admin = $this->userWithRole('admin');
        $review = $this->review($this->project(), ['moderation_status' => 'pending', 'is_published' => false]);

        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/project-reviews/{$review->id}/approve")
            ->assertOk()->assertJsonPath('data.moderation_status', 'approved')->assertJsonPath('data.is_published', true);
        $this->actingAs($admin, 'sanctum')->postJson("/api/v1/admin/project-reviews/{$review->id}/reject", ['reason' => 'Không đủ bằng chứng'])
            ->assertOk()->assertJsonPath('data.moderation_status', 'rejected')->assertJsonPath('data.is_published', false);
    }
}
