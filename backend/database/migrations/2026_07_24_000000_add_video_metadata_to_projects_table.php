<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'video_title')) {
                $table->string('video_title')->nullable()->after('video_url');
            }
            if (!Schema::hasColumn('projects', 'video_description')) {
                $table->text('video_description')->nullable()->after('video_title');
            }
            if (!Schema::hasColumn('projects', 'video_thumbnail_url')) {
                $table->string('video_thumbnail_url', 2048)->nullable()->after('video_description');
            }
            if (!Schema::hasColumn('projects', 'video_upload_date')) {
                $table->dateTime('video_upload_date')->nullable()->after('video_thumbnail_url');
            }
            if (!Schema::hasColumn('projects', 'video_duration_seconds')) {
                $table->unsignedInteger('video_duration_seconds')->nullable()->after('video_upload_date');
            }
            if (!Schema::hasColumn('projects', 'video_slug')) {
                $table->string('video_slug')->nullable()->unique()->after('video_duration_seconds');
            }
            if (!Schema::hasColumn('projects', 'video_is_indexable')) {
                $table->boolean('video_is_indexable')->default(false)->after('video_slug');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'video_slug')) {
                $table->dropUnique('projects_video_slug_unique');
            }
            foreach ([
                'video_is_indexable',
                'video_slug',
                'video_duration_seconds',
                'video_upload_date',
                'video_thumbnail_url',
                'video_description',
                'video_title',
            ] as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
