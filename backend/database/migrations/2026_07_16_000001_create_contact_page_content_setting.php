<?php

use App\Support\ContactPageContent;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ContactPageContent::ensureSetting();
    }

    public function down(): void
    {
        // Preserve administrator content because it cannot be reconstructed safely.
    }
};
