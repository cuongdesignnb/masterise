<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewValidationTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_submission_is_disabled_by_default(): void
    {
        $project = $this->project();
        $this->postJson("/api/v1/projects/{$project->id}/reviews", [])->assertNotFound();
    }

    public function test_enabled_submission_requires_content_challenge_and_consent(): void
    {
        Setting::set('public_project_review_submission_enabled', true, 'boolean');
        $project = $this->project();
        $this->postJson("/api/v1/projects/{$project->id}/reviews", [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['reviewer_name', 'rating', 'review_body', 'submission_token', 'consent']);
    }

    public function test_public_submission_is_throttled(): void
    {
        Setting::set('public_project_review_submission_enabled', true, 'boolean');
        $project = $this->project();
        $url = "/api/v1/projects/{$project->id}/reviews";

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $this->postJson($url, [])->assertUnprocessable();
        }
        $this->postJson($url, [])->assertTooManyRequests();
    }
}
