<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSeoReviewFixtures;
use Tests\TestCase;

class ProjectVideoMetadataValidationTest extends TestCase
{
    use RefreshDatabase, BuildsSeoReviewFixtures;

    public function test_indexable_project_video_requires_search_eligible_metadata(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/projects', [
                'name' => 'Video Metadata Project',
                'slug' => 'video-metadata-project',
                'description' => 'Project video validation fixture.',
                'project_status' => 'selling',
                'is_published' => false,
                'video_url' => 'https://www.youtube.com/watch?v=abcDEF12345',
                'video_is_indexable' => true,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['video_title', 'video_description', 'video_upload_date']);
    }

    public function test_valid_indexable_project_video_metadata_is_persisted(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/projects', [
                'name' => 'Eligible Video Project',
                'slug' => 'eligible-video-project',
                'description' => 'Project video validation fixture.',
                'project_status' => 'selling',
                'is_published' => false,
                'video_url' => 'https://www.youtube.com/watch?v=abcDEF12345',
                'video_title' => 'Eligible project video',
                'video_description' => 'Full project video description.',
                'video_upload_date' => '2026-07-24',
                'video_duration_seconds' => 135,
                'video_is_indexable' => true,
            ])
            ->assertCreated();

        $project = Project::where('slug', 'eligible-video-project')->firstOrFail();

        $this->assertTrue($project->video_is_indexable);
        $this->assertSame('eligible-video-project', $project->video_slug);
        $this->assertSame('Eligible project video', $project->video_title);
        $this->assertSame(135, $project->video_duration_seconds);
    }
}
