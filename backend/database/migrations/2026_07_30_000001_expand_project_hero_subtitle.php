<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('projects', 'hero_subtitle')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->text('hero_subtitle')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('projects', 'hero_subtitle')) {
            return;
        }

        $hasLongValues = DB::table('projects')
            ->whereNotNull('hero_subtitle')
            ->pluck('hero_subtitle')
            ->contains(fn ($value) => mb_strlen((string) $value) > 255);

        if ($hasLongValues) {
            throw new RuntimeException('Cannot shrink projects.hero_subtitle while values longer than 255 characters exist.');
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->string('hero_subtitle', 255)->nullable()->change();
        });
    }
};
