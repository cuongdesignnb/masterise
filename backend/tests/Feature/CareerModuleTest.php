<?php

namespace Tests\Feature;

use App\Jobs\SendCareerApplicationEmails;
use App\Models\CareerApplication;
use App\Models\CareerJob;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CareerModuleTest extends TestCase
{
    use RefreshDatabase;

    private function job(array $overrides = []): CareerJob
    {
        return CareerJob::create(array_merge([
            'title' => 'Chuyên viên Kinh doanh', 'slug' => 'chuyen-vien-kinh-doanh-'.uniqid(),
            'code' => 'TD-'.strtoupper(substr(uniqid(), -6)), 'department' => 'Kinh doanh',
            'location' => 'Hà Nội', 'employment_type' => 'full_time', 'vacancies' => 2,
            'status' => 'published', 'is_published' => true, 'published_at' => now()->subDay(),
            'application_deadline' => now()->addMonth(), 'description' => '<p>Mô tả công việc.</p>',
        ], $overrides));
    }

    public function test_public_only_returns_active_published_jobs(): void
    {
        $visible = $this->job();
        $this->job(['status' => 'draft', 'is_published' => false]);
        $this->job(['application_deadline' => now()->subDay()]);
        $this->getJson('/api/v1/career/jobs')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $visible->id);
    }

    public function test_public_filters_and_search_are_applied_by_backend(): void
    {
        $this->job(['title' => 'Kiến trúc sư', 'department' => 'Thiết kế', 'location' => 'TP. Hồ Chí Minh']);
        $this->job(['title' => 'Chuyên viên Pháp lý', 'department' => 'Pháp lý', 'location' => 'Hà Nội']);
        $this->getJson('/api/v1/career/jobs?q=Kiến&department=Thiết%20kế&location=TP.%20Hồ%20Chí%20Minh')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Kiến trúc sư');
        $this->getJson('/api/v1/career/jobs?department=Không%20tồn%20tại')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_detail_returns_related_and_no_private_application_data(): void
    {
        $job = $this->job(['slug' => 'vi-tri-kiem-tra']); $this->job(['department' => $job->department]);
        $this->getJson('/api/v1/career/jobs/vi-tri-kiem-tra')->assertOk()
            ->assertJsonPath('data.job.code', $job->code)->assertJsonCount(1, 'data.related')->assertJsonMissingPath('data.job.cv_path');
    }

    public function test_valid_application_is_saved_privately_and_email_job_is_queued(): void
    {
        Storage::fake('local'); Bus::fake(); $job = $this->job();
        $response = $this->post('/api/v1/career/jobs/'.$job->id.'/apply', [
            'full_name' => 'Nguyễn Văn An', 'email' => 'an@example.com', 'phone' => '0912345678',
            'consent' => '1', 'cv' => UploadedFile::fake()->create('CV-Nguyen-Van-An.pdf', 120, 'application/pdf'),
        ], ['Accept' => 'application/json']);
        $response->assertCreated()->assertJsonStructure(['data' => ['application_code']]);
        $application = CareerApplication::firstOrFail();
        Storage::disk('local')->assertExists($application->getRawOriginal('cv_path'));
        $this->assertNotSame('CV-Nguyen-Van-An.pdf', basename($application->getRawOriginal('cv_path')));
        $this->assertDatabaseHas('career_application_activities', ['application_id' => $application->id, 'action' => 'submitted']);
        Bus::assertDispatched(SendCareerApplicationEmails::class);
    }

    public function test_application_validation_rejects_missing_or_invalid_identity_fields(): void
    {
        $job = $this->job();
        $this->postJson('/api/v1/career/jobs/'.$job->id.'/apply', [])->assertUnprocessable()->assertJsonValidationErrors(['full_name', 'email', 'phone', 'consent', 'cv']);
        $this->postJson('/api/v1/career/jobs/'.$job->id.'/apply', ['full_name' => 'A', 'email' => 'sai-email', 'phone' => 'abc', 'consent' => true])
            ->assertUnprocessable()->assertJsonValidationErrors(['full_name', 'email', 'phone']);
    }

    public function test_cv_wrong_mime_and_oversize_are_rejected(): void
    {
        Storage::fake('local'); $job = $this->job();
        $base = ['full_name' => 'Nguyễn Văn An', 'email' => 'an@example.com', 'phone' => '0912345678', 'consent' => '1'];
        $this->post('/api/v1/career/jobs/'.$job->id.'/apply', [...$base, 'cv' => UploadedFile::fake()->create('cv.exe', 10, 'application/x-msdownload')], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cv');
        $this->post('/api/v1/career/jobs/'.$job->id.'/apply', [...$base, 'cv' => UploadedFile::fake()->create('cv.pdf', 11000, 'application/pdf')], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cv');
    }

    public function test_closed_job_does_not_accept_application(): void
    {
        $job = $this->job(['status' => 'closed', 'is_published' => false]);
        $this->postJson('/api/v1/career/jobs/'.$job->id.'/apply', [])->assertUnprocessable()->assertJsonPath('message', 'Vị trí này hiện không nhận hồ sơ.');
    }

    public function test_duplicate_application_is_blocked_for_one_hour(): void
    {
        Storage::fake('local'); Bus::fake(); $job = $this->job();
        $payload = ['full_name' => 'Nguyễn Văn An', 'email' => 'duplicate@example.com', 'phone' => '0912345678', 'consent' => '1', 'cv' => UploadedFile::fake()->create('cv.pdf', 50, 'application/pdf')];
        $this->post('/api/v1/career/jobs/'.$job->id.'/apply', $payload, ['Accept' => 'application/json'])->assertCreated();
        $payload['cv'] = UploadedFile::fake()->create('cv.pdf', 50, 'application/pdf');
        $this->post('/api/v1/career/jobs/'.$job->id.'/apply', $payload, ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_public_settings_do_not_expose_hr_or_smtp_credentials(): void
    {
        Setting::set('career_settings', ['recipient_emails' => ['hr@example.com']], 'json');
        $this->getJson('/api/v1/settings/public')->assertOk()->assertJsonMissing(['hr@example.com'])->assertJsonMissingPath('data.career_settings');
        $this->getJson('/api/v1/career/options')->assertOk()->assertJsonMissing(['hr@example.com']);
    }

    public function test_cv_download_requires_authentication_and_permission(): void
    {
        Storage::fake('local'); $application = CareerApplication::create(['application_code' => 'UV-TEST-01', 'full_name' => 'Ứng viên', 'email' => 'uv@example.com', 'phone' => '0912345678', 'cv_original_name' => 'cv.pdf', 'cv_path' => 'career-cvs/test.pdf', 'cv_mime' => 'application/pdf', 'cv_size' => 100, 'status' => 'new', 'consent_at' => now()]); Storage::disk('local')->put('career-cvs/test.pdf', 'pdf');
        $this->getJson('/api/v1/admin/career/applications/'.$application->id.'/cv')->assertUnauthorized();
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/career/applications/'.$application->id.'/cv')->assertForbidden();
        Permission::findOrCreate('career_applications.download_cv', 'web'); $user->givePermissionTo('career_applications.download_cv');
        $this->actingAs($user, 'sanctum')->get('/api/v1/admin/career/applications/'.$application->id.'/cv')->assertOk();
    }

    public function test_status_change_records_activity_and_unicode_remains_intact(): void
    {
        $application = CareerApplication::create(['application_code' => 'UV-TEST-02', 'full_name' => 'Đỗ Thị Hương', 'email' => 'huong@example.com', 'phone' => '0987654321', 'status' => 'new', 'consent_at' => now()]);
        $user = User::factory()->create(); foreach (['career_applications.update'] as $name) { Permission::findOrCreate($name, 'web'); $user->givePermissionTo($name); }
        $this->actingAs($user, 'sanctum')->patchJson('/api/v1/admin/career/applications/'.$application->id, ['status' => 'reviewing', 'note' => 'Hồ sơ phù hợp bước đầu.'])
            ->assertOk()->assertJsonPath('data.full_name', 'Đỗ Thị Hương')->assertJsonPath('data.status_label', 'Đang xem xét');
        $this->assertDatabaseHas('career_application_activities', ['application_id' => $application->id, 'old_status' => 'new', 'new_status' => 'reviewing', 'note' => 'Hồ sơ phù hợp bước đầu.']);
    }
}
