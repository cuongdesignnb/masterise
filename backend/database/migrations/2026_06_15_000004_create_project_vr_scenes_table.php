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
        Schema::create('project_vr_scenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('project_vr_tours')->onDelete('cascade');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('panorama_url');
            $table->string('thumbnail_url')->nullable();
            $table->string('scene_type')->default('other'); // overview, lobby, amenity, apartment, etc.
            $table->decimal('initial_yaw', 8, 4)->default(0);
            $table->decimal('initial_pitch', 8, 4)->default(0);
            $table->decimal('initial_zoom', 8, 4)->default(50);
            $table->boolean('autorotate')->default(true);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['tour_id', 'slug']);
            $table->index(['tour_id', 'is_active']);
            $table->index(['project_id', 'is_active']);
            $table->index(['sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_vr_scenes');
    }
};
