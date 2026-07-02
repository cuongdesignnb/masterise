<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'detail_gallery')) {
                $table->json('detail_gallery')->nullable()->after('gallery_description');
            }
            if (!Schema::hasColumn('projects', 'detail_gallery_label')) {
                $table->string('detail_gallery_label')->nullable()->after('detail_gallery');
            }
            if (!Schema::hasColumn('projects', 'detail_gallery_title')) {
                $table->string('detail_gallery_title')->nullable()->after('detail_gallery_label');
            }
            if (!Schema::hasColumn('projects', 'detail_gallery_description')) {
                $table->text('detail_gallery_description')->nullable()->after('detail_gallery_title');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            foreach (['detail_gallery_description', 'detail_gallery_title', 'detail_gallery_label', 'detail_gallery'] as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
