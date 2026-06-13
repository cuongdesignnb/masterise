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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('code')->nullable()->after('slug');
            $table->unsignedBigInteger('developer_id')->nullable()->after('code');
            $table->unsignedBigInteger('location_id')->nullable()->after('developer_id');
            
            $table->string('address')->nullable()->after('location');
            $table->string('province')->nullable()->after('address');
            $table->string('district')->nullable()->after('province');
            $table->string('ward')->nullable()->after('district');
            
            $table->decimal('area_min', 8, 2)->nullable()->after('price_text');
            $table->decimal('area_max', 8, 2)->nullable()->after('area_min');
            $table->string('area_text')->nullable()->after('area_max');
            
            $table->string('sales_status')->default('coming_soon')->after('status');
            $table->string('handover_time')->nullable()->after('handover_year');
            $table->string('legal_status')->nullable()->after('handover_time');
            $table->string('ownership_type')->nullable()->after('legal_status');
            $table->string('construction_density')->nullable()->after('ownership_type');
            
            $table->string('total_area')->nullable()->after('construction_density');
            $table->integer('total_units')->nullable()->after('total_area');
            $table->integer('total_blocks')->nullable()->after('total_units');
            $table->integer('total_floors')->nullable()->after('total_blocks');
            
            $table->text('highlight_points')->nullable()->after('content'); // JSON array of points
            $table->text('nearby_places')->nullable()->after('highlight_points'); // JSON array
            $table->text('payment_policy')->nullable()->after('nearby_places');
            $table->text('sales_policy')->nullable()->after('payment_policy');
            $table->text('booking_policy')->nullable()->after('sales_policy');
            
            $table->string('banner_image')->nullable()->after('thumbnail');
            $table->string('video_url')->nullable()->after('brochure_url');
            $table->string('virtual_tour_url')->nullable()->after('video_url');
            
            $table->boolean('is_published')->default(false)->after('is_featured');
            $table->timestamp('published_at')->nullable()->after('is_published');
            $table->integer('sort_order')->default(0)->after('published_at');

            // Add indexes for optimized search performance
            $table->index('developer_id');
            $table->index('location_id');
            $table->index('sales_status');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['developer_id']);
            $table->dropIndex(['location_id']);
            $table->dropIndex(['sales_status']);
            $table->dropIndex(['is_published']);

            $table->dropColumn([
                'code', 'developer_id', 'location_id', 'address', 'province', 'district', 'ward',
                'area_min', 'area_max', 'sales_status', 'handover_time', 'legal_status', 'ownership_type',
                'construction_density', 'total_area', 'total_units', 'total_blocks', 'total_floors',
                'highlight_points', 'nearby_places', 'payment_policy', 'sales_policy', 'booking_policy',
                'banner_image', 'video_url', 'virtual_tour_url', 'is_published', 'published_at', 'sort_order'
            ]);
        });
    }
};
