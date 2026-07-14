<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('project_categories', 'taxonomy_type')) {
            Schema::table('project_categories', function (Blueprint $table) {
                $table->string('taxonomy_type', 32)
                    ->default('project_type')
                    ->index()
                    ->after('description');
            });
        }

        DB::table('project_categories')
            ->whereIn('slug', ['masterise-colletion', 'lumiere-series'])
            ->update(['taxonomy_type' => 'collection']);

        $normalizations = [
            'can-ho-cao-cap' => ['name' => 'Căn hộ cao cấp'],
            'biet-thu-dinh-thu' => ['name' => 'Biệt thự & dinh thự'],
            'shophouse-commercial' => [
                'name' => 'Shophouse thương mại',
                'slug' => 'shophouse-thuong-mai',
            ],
            'masterise-colletion' => ['name' => 'Masterise Collection'],
        ];

        foreach ($normalizations as $currentSlug => $values) {
            DB::table('project_categories')
                ->where('slug', $currentSlug)
                ->update($values);
        }
    }

    public function down(): void
    {
        DB::table('project_categories')
            ->where('slug', 'shophouse-thuong-mai')
            ->update([
                'name' => 'Nhà Phố Thương Mại (Shophouse)',
                'slug' => 'shophouse-commercial',
            ]);

        DB::table('project_categories')->where('slug', 'can-ho-cao-cap')->update(['name' => 'Căn Hộ Cao Cấp']);
        DB::table('project_categories')->where('slug', 'biet-thu-dinh-thu')->update(['name' => 'Biệt Thự & Dinh Thự']);
        DB::table('project_categories')->where('slug', 'masterise-colletion')->update(['name' => 'Masterise Colletion']);

        if (Schema::hasColumn('project_categories', 'taxonomy_type')) {
            Schema::table('project_categories', function (Blueprint $table) {
                $table->dropIndex(['taxonomy_type']);
                $table->dropColumn('taxonomy_type');
            });
        }
    }
};
