<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('reviewer_name');
            $table->string('reviewer_role')->nullable();
            $table->decimal('rating', 2, 1);
            $table->text('review_body');
            $table->dateTime('reviewed_at');
            $table->string('source_type')->default('website');
            $table->string('source_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('moderation_status')->default('pending'); // pending, approved, rejected
            $table->boolean('is_published')->default(false);
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->dateTime('approved_at')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('project_id');
            $table->index(['project_id', 'moderation_status', 'is_published'], 'project_reviews_published_idx');
            $table->index('reviewed_at');
            $table->index('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_reviews');
    }
};
