<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        $columns = [
            'thumbnail',
            'banner_image',
            'brochure_url',
            'video_url',
            'virtual_tour_url',
            'map_image_url',
        ];

        foreach ($columns as $column) {
            if (Schema::hasColumn('projects', $column)) {
                DB::statement("ALTER TABLE projects MODIFY {$column} TEXT NULL");
            }
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        $columns = [
            'thumbnail',
            'banner_image',
            'brochure_url',
            'video_url',
            'virtual_tour_url',
            'map_image_url',
        ];

        foreach ($columns as $column) {
            if (Schema::hasColumn('projects', $column)) {
                DB::statement("ALTER TABLE projects MODIFY {$column} VARCHAR(255) NULL");
            }
        }
    }
};
