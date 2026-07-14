<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->string('color_key', 30)->default('stone');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
            $table->index('is_default');
        });

        $now = now();
        $statuses = [
            ['name' => 'Sắp mở bán', 'slug' => 'coming_soon', 'color_key' => 'amber', 'sort_order' => 10, 'is_default' => true],
            ['name' => 'Đang mở bán', 'slug' => 'selling', 'color_key' => 'emerald', 'sort_order' => 20, 'is_default' => false],
            ['name' => 'Đã hết giỏ hàng', 'slug' => 'sold_out', 'color_key' => 'rose', 'sort_order' => 30, 'is_default' => false],
            ['name' => 'Đang bàn giao', 'slug' => 'handing_over', 'color_key' => 'sky', 'sort_order' => 40, 'is_default' => false],
            ['name' => 'Đã bàn giao', 'slug' => 'handover', 'color_key' => 'stone', 'sort_order' => 50, 'is_default' => false],
        ];

        foreach ($statuses as $status) {
            DB::table('project_statuses')->insert([
                ...$status,
                'description' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $unknownStatuses = DB::table('projects')
            ->whereNotNull('project_status')
            ->where('project_status', '!=', '')
            ->distinct()
            ->pluck('project_status')
            ->reject(fn ($slug) => collect($statuses)->contains('slug', $slug));

        foreach ($unknownStatuses as $index => $slug) {
            DB::table('project_statuses')->insert([
                'name' => Str::headline(str_replace('_', ' ', (string) $slug)),
                'slug' => (string) $slug,
                'description' => 'Trạng thái được bảo toàn từ dữ liệu dự án hiện có.',
                'color_key' => 'stone',
                'sort_order' => 1000 + $index,
                'is_active' => true,
                'is_default' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if ($unknownStatuses->isNotEmpty()) {
            Log::warning('Project status registry preserved previously unknown status slugs.', [
                'slugs' => $unknownStatuses->values()->all(),
            ]);
        }

        $missing = DB::table('projects')
            ->leftJoin('project_statuses', 'project_statuses.slug', '=', 'projects.project_status')
            ->whereNull('project_statuses.id')
            ->pluck('projects.id');

        if ($missing->isNotEmpty()) {
            throw new RuntimeException('Project status registry is incomplete for project IDs: '.$missing->implode(', '));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('project_statuses');
    }
};
