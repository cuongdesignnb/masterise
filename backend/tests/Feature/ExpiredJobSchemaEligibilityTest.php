<?php

namespace Tests\Feature;

use App\Models\CareerJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpiredJobSchemaEligibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_and_closed_jobs_are_not_publicly_visible(): void
    {
        $expired = CareerJob::create(['title' => 'Expired', 'slug' => 'expired-job', 'code' => 'EXP', 'department' => 'SEO', 'location' => 'Hanoi', 'employment_type' => 'full_time', 'status' => 'published', 'is_published' => true, 'application_deadline' => now()->subDay()]);
        $closed = CareerJob::create(['title' => 'Closed', 'slug' => 'closed-job', 'code' => 'CLS', 'department' => 'SEO', 'location' => 'Hanoi', 'employment_type' => 'full_time', 'status' => 'closed', 'is_published' => true]);
        $this->assertFalse($expired->accepting_applications);
        $this->assertFalse($closed->accepting_applications);
        $this->getJson('/api/v1/career/jobs/expired-job')->assertNotFound();
        $this->getJson('/api/v1/career/jobs/closed-job')->assertNotFound();
    }
}
