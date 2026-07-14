<?php

use App\Support\ProjectFloorPlanStructure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'floor_plan_groups')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->json('floor_plan_groups')->nullable()->after('floor_plans');
            });
        }

        DB::table('projects')
            ->whereNull('floor_plan_groups')
            ->where(function ($query) {
                $query->whereNotNull('floor_tabs')->orWhereNotNull('floor_plans');
            })
            ->orderBy('id')
            ->chunkById(100, function ($projects) {
                foreach ($projects as $project) {
                    $groups = ProjectFloorPlanStructure::fromLegacy($project->floor_tabs, $project->floor_plans);
                    if ($groups !== []) {
                        DB::table('projects')->where('id', $project->id)->update([
                            'floor_plan_groups' => json_encode($groups, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        ]);
                    }
                }
            });
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'floor_plan_groups')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('floor_plan_groups');
            });
        }
    }
};
