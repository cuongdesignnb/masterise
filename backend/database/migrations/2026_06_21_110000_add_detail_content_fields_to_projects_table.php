<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'hero_subtitle')) {
                $table->string('hero_subtitle')->nullable()->after('content');
            }
            if (!Schema::hasColumn('projects', 'badge_text')) {
                $table->string('badge_text')->nullable()->after('hero_subtitle');
            }
            if (!Schema::hasColumn('projects', 'quick_cards')) {
                $table->json('quick_cards')->nullable()->after('highlight_points');
            }
            if (!Schema::hasColumn('projects', 'project_facts')) {
                $table->json('project_facts')->nullable()->after('quick_cards');
            }
            if (!Schema::hasColumn('projects', 'project_stats')) {
                $table->json('project_stats')->nullable()->after('project_facts');
            }
            if (!Schema::hasColumn('projects', 'gallery_label')) {
                $table->string('gallery_label')->nullable()->after('gallery');
            }
            if (!Schema::hasColumn('projects', 'gallery_title')) {
                $table->string('gallery_title')->nullable()->after('gallery_label');
            }
            if (!Schema::hasColumn('projects', 'gallery_description')) {
                $table->text('gallery_description')->nullable()->after('gallery_title');
            }
            if (!Schema::hasColumn('projects', 'connectivity')) {
                $table->json('connectivity')->nullable()->after('nearby_places');
            }
            if (!Schema::hasColumn('projects', 'amenity_details')) {
                $table->json('amenity_details')->nullable()->after('amenities');
            }
            if (!Schema::hasColumn('projects', 'floor_tabs')) {
                $table->json('floor_tabs')->nullable()->after('amenity_details');
            }
            if (!Schema::hasColumn('projects', 'floor_plans')) {
                $table->json('floor_plans')->nullable()->after('floor_tabs');
            }
            if (!Schema::hasColumn('projects', 'price_rows')) {
                $table->json('price_rows')->nullable()->after('floor_plans');
            }
            if (!Schema::hasColumn('projects', 'policy_cards')) {
                $table->json('policy_cards')->nullable()->after('booking_policy');
            }
            if (!Schema::hasColumn('projects', 'project_timeline')) {
                $table->json('project_timeline')->nullable()->after('policy_cards');
            }
            if (!Schema::hasColumn('projects', 'investment_reasons')) {
                $table->json('investment_reasons')->nullable()->after('project_timeline');
            }
            if (!Schema::hasColumn('projects', 'project_testimonials')) {
                $table->json('project_testimonials')->nullable()->after('investment_reasons');
            }
            if (!Schema::hasColumn('projects', 'project_faqs')) {
                $table->json('project_faqs')->nullable()->after('project_testimonials');
            }
            if (!Schema::hasColumn('projects', 'schema_price')) {
                $table->string('schema_price')->nullable()->after('project_faqs');
            }
            if (!Schema::hasColumn('projects', 'schema_price_currency')) {
                $table->string('schema_price_currency', 10)->default('VND')->after('schema_price');
            }
            if (!Schema::hasColumn('projects', 'schema_availability')) {
                $table->string('schema_availability')->nullable()->after('schema_price_currency');
            }
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'hero_subtitle',
                'badge_text',
                'quick_cards',
                'project_facts',
                'project_stats',
                'gallery_label',
                'gallery_title',
                'gallery_description',
                'connectivity',
                'amenity_details',
                'floor_tabs',
                'floor_plans',
                'price_rows',
                'policy_cards',
                'project_timeline',
                'investment_reasons',
                'project_testimonials',
                'project_faqs',
                'schema_price',
                'schema_price_currency',
                'schema_availability',
            ]);
        });
    }
};
