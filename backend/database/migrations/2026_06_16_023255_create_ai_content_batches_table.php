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
        Schema::create('ai_content_batches', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('status')->default('draft'); // draft, queued, processing, completed, partially_failed, failed, cancelled
            $table->integer('keywords_count')->default(0);
            $table->integer('generated_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->foreignId('default_category_id')->nullable()->constrained('post_categories')->nullOnDelete();
            $table->foreignId('default_author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('schedule_mode')->nullable(); // none, cyclic
            $table->timestamp('schedule_start_at')->nullable();
            $table->integer('schedule_interval_minutes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Indexes
            $table->index(['status', 'created_at']);
            $table->index('created_by');
            $table->index('schedule_start_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_content_batches');
    }
};
