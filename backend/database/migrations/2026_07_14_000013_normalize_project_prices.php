<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const PRICE_MAPPING = [
        'the-global-city' => [8_900_000_000, null, 100_000_000, 150_000_000],
        'masteri-centre-point' => [5_500_000_000, null, 60_000_000, 80_000_000],
        'grand-marina-saigon' => [25_000_000_000, null, 350_000_000, 450_000_000],
        'lumiere-boulevard' => [5_500_000_000, null, 50_000_000, 70_000_000],
        'masteri-waterfront' => [4_800_000_000, null, 55_000_000, 75_000_000],
        'masterise-grand-view' => [6_800_000_000, null, null, null],
        'masterise-central-point' => [7_200_000_000, null, null, null],
        'masterise-riverside' => [8_500_000_000, null, null, null],
        'lumiere-riverside' => [7_900_000_000, null, null, null],
        'lumiere-midtown' => [null, null, null, null],
    ];

    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'price_per_sqm_min')) {
                $table->decimal('price_per_sqm_min', 15, 2)->nullable()->after('price_max');
            }
            if (!Schema::hasColumn('projects', 'price_per_sqm_max')) {
                $table->decimal('price_per_sqm_max', 15, 2)->nullable()->after('price_per_sqm_min');
            }
        });

        $updated = DB::transaction(function (): int {
            $count = 0;

            foreach (self::PRICE_MAPPING as $slug => [$min, $max, $sqmMin, $sqmMax]) {
                $count += DB::table('projects')->where('slug', $slug)->update([
                    'price_min' => $min,
                    'price_max' => $max,
                    'price_per_sqm_min' => $sqmMin,
                    'price_per_sqm_max' => $sqmMax,
                    'updated_at' => now(),
                ]);
            }

            return $count;
        });

        Log::info('Project prices normalized', [
            'projects_updated' => $updated,
            'mapping_count' => count(self::PRICE_MAPPING),
        ]);
    }

    public function down(): void
    {
        DB::transaction(function (): void {
            foreach (self::PRICE_MAPPING as $slug => [, , $sqmMin, $sqmMax]) {
                DB::table('projects')->where('slug', $slug)->update([
                    'price_min' => $sqmMin,
                    'price_max' => $sqmMax,
                    'updated_at' => now(),
                ]);
            }
        });

        Schema::table('projects', function (Blueprint $table) {
            $columns = array_values(array_filter(
                ['price_per_sqm_min', 'price_per_sqm_max'],
                fn (string $column) => Schema::hasColumn('projects', $column)
            ));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
