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
        Schema::create('ai_generation_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // single_article, article_with_image, bulk_item
            $table->string('status')->default('pending'); // pending, queued, processing, completed, failed, cancelled
            $table->string('provider')->default('openai');
            $table->string('text_model')->nullable();
            $table->string('image_model')->nullable();
            $table->string('input_title')->nullable();
            $table->text('input_keywords')->nullable();
            $table->longText('prompt')->nullable();
            $table->json('response_metadata')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('tokens_input')->nullable();
            $table->integer('tokens_output')->nullable();
            $table->decimal('estimated_cost', 12, 6)->nullable();
            $table->foreignId('post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained('ai_content_batches')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['batch_id', 'status']);
            $table->index('post_id');
            $table->index('created_by');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_generation_jobs');
    }
};
