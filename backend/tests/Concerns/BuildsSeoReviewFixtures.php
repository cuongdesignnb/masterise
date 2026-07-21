<?php

namespace Tests\Concerns;

use App\Models\Project;
use App\Models\ProjectReview;
use App\Models\User;
use Spatie\Permission\Models\Role;

trait BuildsSeoReviewFixtures
{
    protected function project(array $overrides = []): Project
    {
        return Project::create(array_merge([
            'name' => 'SEO RC3 Project',
            'slug' => 'seo-rc3-project-'.uniqid(),
            'project_status' => 'selling',
            'description' => 'Project used for isolated review contract testing.',
            'is_published' => true,
            'published_at' => now()->subDay(),
        ], $overrides));
    }

    protected function review(Project $project, array $overrides = []): ProjectReview
    {
        return ProjectReview::create(array_merge([
            'project_id' => $project->id,
            'reviewer_name' => 'Public Reviewer',
            'reviewer_role' => 'Khách hàng',
            'rating' => 4.5,
            'review_body' => 'Nội dung đánh giá hợp lệ và đủ dài.',
            'reviewed_at' => now()->subHour(),
            'source_type' => 'admin',
            'is_verified' => true,
            'moderation_status' => 'approved',
            'is_published' => true,
        ], $overrides));
    }

    protected function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        $user->assignRole($role);
        return $user;
    }
}
