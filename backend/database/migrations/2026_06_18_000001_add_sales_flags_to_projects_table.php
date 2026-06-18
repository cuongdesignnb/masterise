<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'open_sale_at')) {
                $table->timestamp('open_sale_at')->nullable()->after('sales_status');
            }

            if (!Schema::hasColumn('projects', 'is_hot')) {
                $table->boolean('is_hot')->default(false)->after('is_featured');
            }

            $table->index('open_sale_at');
            $table->index('is_hot');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['open_sale_at']);
            $table->dropIndex(['is_hot']);
            $table->dropColumn(['open_sale_at', 'is_hot']);
        });
    }
};
