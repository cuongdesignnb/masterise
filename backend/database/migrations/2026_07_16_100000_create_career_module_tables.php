<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('career_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('code')->unique();
            $table->string('department')->index();
            $table->string('location')->index();
            $table->string('employment_type')->default('full_time')->index();
            $table->string('workplace_type')->nullable();
            $table->string('experience_level')->nullable();
            $table->decimal('salary_min', 15, 2)->nullable();
            $table->decimal('salary_max', 15, 2)->nullable();
            $table->string('salary_currency', 8)->default('VND');
            $table->string('salary_text')->nullable();
            $table->unsignedInteger('vacancies')->default(1);
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('responsibilities')->nullable();
            $table->longText('requirements')->nullable();
            $table->longText('benefits')->nullable();
            $table->longText('working_time')->nullable();
            $table->longText('additional_information')->nullable();
            $table->dateTime('application_deadline')->nullable()->index();
            $table->dateTime('published_at')->nullable()->index();
            $table->dateTime('closed_at')->nullable();
            $table->string('status')->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_published')->default(false)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->text('thumbnail')->nullable();
            $table->text('banner_image')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_keywords')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('career_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_code')->unique();
            $table->foreignId('career_job_id')->nullable()->constrained('career_jobs')->nullOnDelete();
            $table->string('full_name');
            $table->string('email')->index();
            $table->string('phone')->index();
            $table->longText('cover_letter')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->text('experience_summary')->nullable();
            $table->string('expected_salary')->nullable();
            $table->date('available_from')->nullable();
            $table->string('cv_original_name')->nullable();
            $table->string('cv_path')->nullable();
            $table->string('cv_mime')->nullable();
            $table->unsignedBigInteger('cv_size')->nullable();
            $table->string('status')->default('new')->index();
            $table->string('source')->default('website');
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->dateTime('consent_at');
            $table->longText('admin_notes')->nullable();
            $table->dateTime('notification_sent_at')->nullable();
            $table->dateTime('confirmation_sent_at')->nullable();
            $table->text('email_error')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['career_job_id', 'created_at']);
        });

        Schema::create('career_application_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('career_applications')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        $now = now();
        DB::table('settings')->updateOrInsert(['key' => 'career_page_content'], [
            'value' => json_encode([
                'eyebrow' => 'Cơ hội nghề nghiệp',
                'title' => 'Kiến tạo tương lai cùng Masterise Homes',
                'description' => 'Khám phá môi trường làm việc chuyên nghiệp và những cơ hội phát triển dài hạn.',
                'hero_image' => null,
                'benefits' => [],
                'process' => ['Gửi hồ sơ', 'Sàng lọc', 'Phỏng vấn', 'Nhận kết quả', 'Onboarding'],
                'cta_title' => 'Chưa tìm thấy vị trí phù hợp?',
                'cta_description' => 'Hãy gửi hồ sơ để chúng tôi liên hệ khi có cơ hội phù hợp.',
                'allow_general_application' => false,
                'seo_title' => 'Tuyển dụng | Masterise Homes',
                'seo_description' => 'Cơ hội nghề nghiệp và các vị trí đang tuyển dụng tại Masterise Homes.',
            ], JSON_UNESCAPED_UNICODE),
            'type' => 'json', 'created_at' => $now, 'updated_at' => $now,
        ]);
        DB::table('settings')->updateOrInsert(['key' => 'career_settings'], [
            'value' => json_encode([
                'recipient_emails' => [], 'cc_emails' => [], 'bcc_emails' => [],
                'cv_required' => true, 'cv_max_mb' => 10,
                'cv_extensions' => ['pdf', 'doc', 'docx'], 'retention_days' => 365,
                'confirmation_email_enabled' => true, 'status_email_enabled' => false,
                'status_email_events' => ['shortlisted', 'interviewing', 'offered', 'rejected'],
                'email_signature' => 'Trân trọng,\nĐội ngũ Tuyển dụng Masterise Homes',
                'response_time' => '5-7 ngày làm việc',
                'privacy_policy_url' => '/chuyen-trang/chinh-sach-bao-mat',
                'departments' => [], 'locations' => [],
            ], JSON_UNESCAPED_UNICODE),
            'type' => 'json', 'created_at' => $now, 'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('career_application_activities');
        Schema::dropIfExists('career_applications');
        Schema::dropIfExists('career_jobs');
        DB::table('settings')->whereIn('key', ['career_page_content', 'career_settings'])->delete();
    }
};
