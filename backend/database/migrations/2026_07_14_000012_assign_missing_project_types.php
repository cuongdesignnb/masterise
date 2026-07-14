<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const AUDIT_TABLE = 'project_type_backfill_20260714';

    private const ASSIGNMENTS = [
        'masterise-grand-view' => ['can-ho-cao-cap'],
        'masterise-central-point' => ['can-ho-cao-cap'],
        'masterise-riverside' => ['can-ho-cao-cap'],
        'lumiere-riverside' => ['can-ho-cao-cap'],
        'lumiere-midtown' => ['can-ho-cao-cap'],
    ];

    public function up(): void
    {
        if (!Schema::hasTable(self::AUDIT_TABLE)) {
            Schema::create(self::AUDIT_TABLE, function (Blueprint $table) {
                $table->string('project_slug');
                $table->string('category_slug');
                $table->timestamp('assigned_at');
                $table->primary(['project_slug', 'category_slug']);
            });
        }

        if (DB::table('projects')->count() === 0) {
            Log::info('Missing project type backfill skipped on an empty projects table.');
            return;
        }

        $projectSlugs = array_keys(self::ASSIGNMENTS);
        $projects = DB::table('projects')
            ->whereIn('slug', $projectSlugs)
            ->get(['id', 'slug'])
            ->keyBy('slug');
        $missingProjects = array_values(array_diff($projectSlugs, $projects->keys()->all()));

        if ($missingProjects !== []) {
            throw new RuntimeException(
                'Missing expected projects for project type backfill: '.implode(', ', $missingProjects)
            );
        }

        $categorySlugs = array_values(array_unique(array_merge(...array_values(self::ASSIGNMENTS))));
        $categories = DB::table('project_categories')
            ->whereIn('slug', $categorySlugs)
            ->where('taxonomy_type', 'project_type')
            ->get(['id', 'slug'])
            ->keyBy('slug');
        $missingCategories = array_values(array_diff($categorySlugs, $categories->keys()->all()));

        if ($missingCategories !== []) {
            throw new RuntimeException(
                'Missing expected project type categories: '.implode(', ', $missingCategories)
            );
        }

        $addedRelations = DB::transaction(function () use ($projects, $categories): int {
            $added = 0;

            foreach (self::ASSIGNMENTS as $projectSlug => $assignedCategorySlugs) {
                $projectId = $projects[$projectSlug]->id;

                foreach ($assignedCategorySlugs as $categorySlug) {
                    $categoryId = $categories[$categorySlug]->id;
                    $exists = DB::table('project_category_project')
                        ->where('project_id', $projectId)
                        ->where('project_category_id', $categoryId)
                        ->exists();

                    if (!$exists) {
                        DB::table('project_category_project')->insert([
                            'project_id' => $projectId,
                            'project_category_id' => $categoryId,
                        ]);
                        DB::table(self::AUDIT_TABLE)->insertOrIgnore([
                            'project_slug' => $projectSlug,
                            'category_slug' => $categorySlug,
                            'assigned_at' => now(),
                        ]);
                        $added++;
                    }

                    $assigned = DB::table('project_category_project')
                        ->where('project_id', $projectId)
                        ->where('project_category_id', $categoryId)
                        ->exists();

                    if (!$assigned) {
                        throw new RuntimeException(
                            "Failed to assign project type {$categorySlug} to {$projectSlug}."
                        );
                    }
                }
            }

            return $added;
        });

        Log::info('Missing project type backfill completed', [
            'relations_added' => $addedRelations,
            'projects_checked' => count(self::ASSIGNMENTS),
        ]);
    }

    public function down(): void
    {
        if (!Schema::hasTable(self::AUDIT_TABLE)) {
            return;
        }

        $removedRelations = DB::transaction(function (): int {
            $removed = 0;
            $assignments = DB::table(self::AUDIT_TABLE)->get();

            foreach ($assignments as $assignment) {
                $projectId = DB::table('projects')->where('slug', $assignment->project_slug)->value('id');
                $categoryId = DB::table('project_categories')
                    ->where('slug', $assignment->category_slug)
                    ->where('taxonomy_type', 'project_type')
                    ->value('id');

                if ($projectId && $categoryId) {
                    $removed += DB::table('project_category_project')
                        ->where('project_id', $projectId)
                        ->where('project_category_id', $categoryId)
                        ->delete();
                }
            }

            return $removed;
        });

        Schema::drop(self::AUDIT_TABLE);

        Log::info('Missing project type backfill rolled back', [
            'relations_removed' => $removedRelations,
        ]);
    }
};
