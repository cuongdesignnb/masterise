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
            $table->string('utm_content')->nullable()->after('utm_campaign');
            $table->string('utm_term')->nullable()->after('utm_content');
            $table->string('landing_page')->nullable()->after('utm_term');
            $table->text('referrer')->nullable()->after('landing_page');
            
            $table->string('demand_type')->nullable()->after('type');
            $table->string('budget_range')->nullable()->after('demand_type');
            $table->string('product_type')->nullable()->after('budget_range');
            
            $table->integer('score')->default(0)->after('message');
            $table->string('temperature')->default('cold')->after('score');
            
            $table->timestamp('last_contacted_at')->nullable()->after('assigned_to');
            $table->timestamp('next_follow_up_at')->nullable()->after('last_contacted_at');
            
            $table->string('visitor_id')->nullable()->after('user_id');

            // Index fields for fast search/filtering in CRM
            $table->index('phone');
            $table->index('visitor_id');
            $table->index('status');
            $table->index('temperature');
            $table->index('utm_source');
            $table->index('utm_campaign');
            $table->index('next_follow_up_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['phone']);
            $table->dropIndex(['visitor_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['temperature']);
            $table->dropIndex(['utm_source']);
            $table->dropIndex(['utm_campaign']);
            $table->dropIndex(['next_follow_up_at']);

            $table->dropColumn([
                'utm_content', 'utm_term', 'landing_page', 'referrer',
                'demand_type', 'budget_range', 'product_type',
                'score', 'temperature', 'last_contacted_at', 'next_follow_up_at',
                'visitor_id'
            ]);
        });
    }
};
