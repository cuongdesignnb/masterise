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
        Schema::table('leads', function (Blueprint $table) {
            $table->string('lead_source_position')->nullable();
            $table->foreignId('vr_scene_id')->nullable()->constrained('project_vr_scenes')->onDelete('set null');
            $table->string('vr_scene_title')->nullable();
            $table->foreignId('vr_hotspot_id')->nullable()->constrained('project_vr_hotspots')->onDelete('set null');
            $table->string('vr_hotspot_title')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['vr_scene_id']);
            $table->dropForeign(['vr_hotspot_id']);
            $table->dropColumn([
                'lead_source_position',
                'vr_scene_id',
                'vr_scene_title',
                'vr_hotspot_id',
                'vr_hotspot_title'
            ]);
        });
    }
};
