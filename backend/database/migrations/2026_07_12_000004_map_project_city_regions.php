<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        $normalize = static function (?string $value): string {
            $value = mb_strtolower(trim((string) $value));
            $value = str_replace(['-', '_'], ' ', $value);
            return trim((string) preg_replace('/\s+/u', ' ', $value));
        };

        $directMappings = [
            'miền bắc' => 'Miền Bắc', 'mien bac' => 'Miền Bắc',
            'miền trung' => 'Miền Trung', 'mien trung' => 'Miền Trung',
            'miền nam' => 'Miền Nam', 'mien nam' => 'Miền Nam',
            'quốc tế' => 'Quốc tế', 'quoc te' => 'Quốc tế',
            'hà nội' => 'Miền Bắc', 'ha noi' => 'Miền Bắc',
            'thành phố thủ đức' => 'Miền Nam', 'thanh pho thu duc' => 'Miền Nam',
            'tp. thủ đức' => 'Miền Nam', 'tp thủ đức' => 'Miền Nam', 'tp.thủ đức' => 'Miền Nam',
            'quận 1' => 'Miền Nam', 'quận1' => 'Miền Nam',
            'tp.hcm' => 'Miền Nam', 'tp hcm' => 'Miền Nam',
            'hồ chí minh' => 'Miền Nam', 'ho chi minh' => 'Miền Nam',
        ];

        $locationEvidence = [
            'Miền Bắc' => ['hà nội', 'ha noi', 'hưng yên', 'hung yen'],
            'Miền Nam' => ['thủ đức', 'thu duc', 'quận 1', 'quan 1', 'tp. hồ chí minh', 'tp hồ chí minh', 'ho chi minh', 'tp.hcm', 'tp hcm'],
        ];

        $updated = 0;
        $unresolvedIds = [];

        DB::table('projects')
            ->select('id', 'region', 'province', 'location')
            ->orderBy('id')
            ->each(function ($project) use ($normalize, $directMappings, $locationEvidence, &$updated, &$unresolvedIds) {
                $regionKey = $normalize($project->region);
                $resolved = $directMappings[$regionKey] ?? null;

                if ($resolved === null) {
                    $evidence = $normalize(implode(' ', array_filter([$project->province, $project->location])));
                    foreach ($locationEvidence as $canonicalRegion => $needles) {
                        if (collect($needles)->contains(fn ($needle) => str_contains($evidence, $needle))) {
                            $resolved = $canonicalRegion;
                            break;
                        }
                    }
                }

                if ($resolved === null) {
                    $unresolvedIds[] = (int) $project->id;
                }

                if ($resolved !== $project->region) {
                    DB::table('projects')->where('id', $project->id)->update(['region' => $resolved]);
                    $updated++;
                }
            });

        Log::info('Project city regions normalized', [
            'updated_count' => $updated,
            'unresolved_project_ids' => $unresolvedIds,
        ]);
    }

    public function down(): void
    {
        // City labels cannot be reconstructed safely from a canonical region.
    }
};
