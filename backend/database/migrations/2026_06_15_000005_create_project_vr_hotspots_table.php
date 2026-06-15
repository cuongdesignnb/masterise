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
        Schema::create('project_vr_hotspots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scene_id')->constrained('project_vr_scenes')->onDelete('cascade');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('type'); // info, navigation, lead, media, map
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('yaw', 8, 4); // in degrees
            $table->decimal('pitch', 8, 4); // in degrees
            $table->string('icon')->nullable();
            $table->foreignId('target_scene_id')->nullable()->constrained('project_vr_scenes')->onDelete('set null');
            $table->string('media_url')->nullable();
            $table->string('cta_type')->nullable(); // price_form, schedule_visit, zalo, hotline
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['scene_id', 'is_active']);
            $table->index(['project_id', 'type']);
            $table->index('target_scene_id');
            $table->index(['sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_vr_hotspots');
    }
};
