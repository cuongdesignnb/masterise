<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'post_type')) {
                $table->string('post_type')->default('news')->after('slug');
            }

            if (!Schema::hasColumn('posts', 'event_start_at')) {
                $table->timestamp('event_start_at')->nullable()->after('published_at');
            }

            if (!Schema::hasColumn('posts', 'event_end_at')) {
                $table->timestamp('event_end_at')->nullable()->after('event_start_at');
            }

            if (!Schema::hasColumn('posts', 'event_location')) {
                $table->string('event_location')->nullable()->after('event_end_at');
            }

            if (!Schema::hasColumn('posts', 'event_register_url')) {
                $table->string('event_register_url')->nullable()->after('event_location');
            }

            $table->index('post_type');
            $table->index(['status', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['post_type']);
            $table->dropIndex(['status', 'published_at']);
            $table->dropColumn([
                'post_type',
                'event_start_at',
                'event_end_at',
                'event_location',
                'event_register_url',
            ]);
        });
    }
};
