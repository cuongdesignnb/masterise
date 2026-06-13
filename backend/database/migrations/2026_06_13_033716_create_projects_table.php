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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('location')->nullable();
            $table->string('region')->nullable(); // e.g., 'Thành phố Thủ Đức'
            $table->decimal('price_min', 15, 2)->nullable();
            $table->decimal('price_max', 15, 2)->nullable();
            $table->string('price_text')->nullable(); // e.g. 'Từ 100 triệu/m2' or 'Từ 5 tỷ'
            $table->string('status')->default('upcoming'); // upcoming, selling, completed
            $table->integer('handover_year')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('thumbnail')->nullable();
            $table->text('gallery')->nullable(); // JSON array of image URLs
            $table->string('brochure_url')->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->string('area_size')->nullable(); // e.g., '117.4 ha'
            $table->string('developer')->nullable(); // e.g., 'Masterise Homes'
            $table->string('scale')->nullable(); // e.g., '10000 apartments'
            $table->text('amenities')->nullable(); // JSON array of amenity codes/names
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
