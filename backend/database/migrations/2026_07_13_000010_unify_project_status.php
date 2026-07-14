<?php

use App\Support\ProjectStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'project_status')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('project_status')
                    ->default(ProjectStatus::COMING_SOON)
                    ->index()
                    ->after('area_text');
            });
        }

        $hasStatus = Schema::hasColumn('projects', 'status');
        $hasSalesStatus = Schema::hasColumn('projects', 'sales_status');

        if (!$hasStatus && !$hasSalesStatus) {
            $this->assertAllStatusesAreValid();
            return;
        }

        if (!$hasStatus || !$hasSalesStatus) {
            throw new RuntimeException('Migration project_status stopped: one legacy status column is missing. No legacy column was dropped.');
        }

        $invalid = [];
        $conflicts = [];

        DB::table('projects')
            ->select(['id', 'name', 'status', 'sales_status'])
            ->orderBy('id')
            ->chunkById(200, function ($projects) use (&$invalid, &$conflicts) {
                foreach ($projects as $project) {
                    $mapped = ProjectStatus::fromLegacy($project->sales_status, $project->status);
                    if ($mapped === null) {
                        $invalid[] = [
                            'id' => $project->id,
                            'name' => $project->name,
                            'status' => $project->status,
                            'sales_status' => $project->sales_status,
                        ];
                        continue;
                    }

                    $salesMapped = ProjectStatus::fromLegacySalesStatus($project->sales_status);
                    $statusMapped = ProjectStatus::fromLegacyStatus($project->status);
                    if ($salesMapped !== null && $statusMapped !== null && $salesMapped !== $statusMapped) {
                        $conflicts[] = [
                            'id' => $project->id,
                            'name' => $project->name,
                            'status' => $project->status,
                            'sales_status' => $project->sales_status,
                            'selected_project_status' => $salesMapped,
                        ];
                    }
                }
            });

        if ($conflicts !== []) {
            Log::warning('Project status migration conflicts; valid sales_status was preferred.', [
                'projects' => $conflicts,
            ]);
        }

        if ($invalid !== []) {
            Log::error('Project status migration stopped because legacy values could not be mapped.', [
                'projects' => $invalid,
            ]);

            throw new RuntimeException(
                'Migration project_status stopped. Unmappable project IDs: '.implode(', ', array_column($invalid, 'id')).'. Legacy columns were not dropped.'
            );
        }

        DB::table('projects')
            ->select(['id', 'status', 'sales_status'])
            ->orderBy('id')
            ->chunkById(200, function ($projects) {
                foreach ($projects as $project) {
                    DB::table('projects')
                        ->where('id', $project->id)
                        ->update([
                            'project_status' => ProjectStatus::fromLegacy($project->sales_status, $project->status),
                        ]);
                }
            });

        $this->assertAllStatusesAreValid();

        $this->dropSingleColumnIndex('projects', 'status');
        $this->dropSingleColumnIndex('projects', 'sales_status');

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['status', 'sales_status']);
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('projects', 'status')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('status')->default('upcoming')->after('area_text');
            });
        }

        if (!Schema::hasColumn('projects', 'sales_status')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('sales_status')->default('coming_soon')->index()->after('status');
            });
        }

        if (Schema::hasColumn('projects', 'project_status')) {
            DB::table('projects')->orderBy('id')->chunkById(200, function ($projects) {
                foreach ($projects as $project) {
                    [$status, $salesStatus] = match ($project->project_status) {
                        ProjectStatus::COMING_SOON => ['upcoming', 'coming_soon'],
                        ProjectStatus::SELLING => ['selling', 'selling'],
                        ProjectStatus::SOLD_OUT => ['selling', 'sold_out'],
                        ProjectStatus::HANDING_OVER => ['completed', 'handing_over'],
                        ProjectStatus::HANDOVER => ['completed', 'handover'],
                        default => throw new RuntimeException("Cannot roll back unknown project_status for project {$project->id}."),
                    };

                    DB::table('projects')->where('id', $project->id)->update([
                        'status' => $status,
                        'sales_status' => $salesStatus,
                    ]);
                }
            });

            $this->dropSingleColumnIndex('projects', 'project_status');
            Schema::table('projects', fn (Blueprint $table) => $table->dropColumn('project_status'));
        }
    }

    private function assertAllStatusesAreValid(): void
    {
        $invalidIds = DB::table('projects')
            ->whereNull('project_status')
            ->orWhereNotIn('project_status', ProjectStatus::values())
            ->pluck('id')
            ->all();

        if ($invalidIds !== []) {
            throw new RuntimeException(
                'Migration project_status stopped after backfill validation. Invalid project IDs: '.implode(', ', $invalidIds)
            );
        }
    }

    private function dropSingleColumnIndex(string $table, string $column): void
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (($index['columns'] ?? []) === [$column]) {
                Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropIndex($index['name']));
                return;
            }
        }
    }
};
