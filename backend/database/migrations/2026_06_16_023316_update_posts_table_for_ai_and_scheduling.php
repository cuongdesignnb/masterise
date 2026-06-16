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
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'ai_generated')) {
                $table->boolean('ai_generated')->default(false);
            }
            if (!Schema::hasColumn('posts', 'ai_generation_job_id')) {
                $table->unsignedBigInteger('ai_generation_job_id')->nullable();
            }
            if (!Schema::hasColumn('posts', 'ai_prompt')) {
                $table->longText('ai_prompt')->nullable();
            }
            if (!Schema::hasColumn('posts', 'source_keyword')) {
                $table->string('source_keyword')->nullable();
            }
            if (!Schema::hasColumn('posts', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable();
            }

            // Indexes
            $table->index(['status', 'scheduled_at']);
            $table->index('ai_generated');
            $table->index('source_keyword');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['posts_status_scheduled_at_index']);
            $table->dropIndex(['posts_ai_generated_index']);
            $table->dropIndex(['posts_source_keyword_index']);

            $table->dropColumn([
                'ai_generated',
                'ai_generation_job_id',
                'ai_prompt',
                'source_keyword',
                'scheduled_at'
            ]);
        });
    }
};
