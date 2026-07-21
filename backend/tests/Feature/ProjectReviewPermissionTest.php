<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectReviewPermissionTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_admin_review_routes_enforce_authentication_and_roles(): void
    {
        $this->getJson('/api/v1/admin/project-reviews')->assertUnauthorized();
        $this->actingAs($this->userWithRole('customer'), 'sanctum')->getJson('/api/v1/admin/project-reviews')->assertForbidden();
        $this->actingAs($this->userWithRole('marketing'), 'sanctum')->getJson('/api/v1/admin/project-reviews')->assertOk();
    }
}
