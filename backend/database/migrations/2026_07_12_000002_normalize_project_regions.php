<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $aliases = [
            'mien bac' => 'Miền Bắc', 'miền bắc' => 'Miền Bắc',
            'mien trung' => 'Miền Trung', 'miền trung' => 'Miền Trung',
            'mien nam' => 'Miền Nam', 'miền nam' => 'Miền Nam',
            'quoc te' => 'Quốc tế', 'quốc tế' => 'Quốc tế',
        ];

        DB::table('projects')->select('id', 'region')->whereNotNull('region')->orderBy('id')->each(function ($project) use ($aliases) {
            $key = mb_strtolower(trim(preg_replace('/\s+/', ' ', str_replace(['-', '_'], ' ', $project->region))));
            if (isset($aliases[$key]) && $aliases[$key] !== $project->region) {
                DB::table('projects')->where('id', $project->id)->update(['region' => $aliases[$key]]);
            }
        });
    }

    public function down(): void
    {
        // Normalized canonical values are intentionally retained.
    }
};
