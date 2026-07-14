<?php

use App\Support\ProjectRegionBackfill;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ProjectRegionBackfill::run();
    }

    public function down(): void
    {
        // Assignments are intentionally preserved because later admin edits cannot be reconstructed safely.
    }
};
