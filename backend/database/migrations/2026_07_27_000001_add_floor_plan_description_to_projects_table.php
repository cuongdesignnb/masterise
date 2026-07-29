<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('projects', 'floor_plan_description')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->text('floor_plan_description')->nullable()->after('floor_plan_groups');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'floor_plan_description')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('floor_plan_description');
            });
        }
    }
};
