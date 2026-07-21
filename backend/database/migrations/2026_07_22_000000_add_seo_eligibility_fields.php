<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->string('event_location_name')->nullable();
            $table->string('event_street_address')->nullable();
            $table->string('event_locality')->nullable();
            $table->string('event_region')->nullable();
            $table->string('event_postal_code')->nullable();
            $table->string('event_country', 2)->nullable();
            $table->string('event_attendance_mode')->nullable();
            $table->string('event_status')->nullable();
            $table->string('event_organizer_name')->nullable();
            $table->string('event_organizer_url')->nullable();
            $table->string('event_online_url')->nullable();
            $table->decimal('event_price', 15, 2)->nullable();
            $table->string('event_currency', 3)->nullable();
            $table->string('event_availability')->nullable();
        });

        Schema::table('career_jobs', function (Blueprint $table): void {
            $table->string('schema_street_address')->nullable();
            $table->string('schema_locality')->nullable();
            $table->string('schema_region')->nullable();
            $table->string('schema_postal_code')->nullable();
            $table->string('schema_country', 2)->nullable();
            $table->string('schema_applicant_country', 2)->nullable();
            $table->string('schema_salary_unit')->nullable();
            $table->boolean('schema_direct_apply')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->dropColumn([
                'event_location_name', 'event_street_address', 'event_locality', 'event_region',
                'event_postal_code', 'event_country', 'event_attendance_mode', 'event_status',
                'event_organizer_name', 'event_organizer_url', 'event_online_url', 'event_price',
                'event_currency', 'event_availability',
            ]);
        });
        Schema::table('career_jobs', function (Blueprint $table): void {
            $table->dropColumn([
                'schema_street_address', 'schema_locality', 'schema_region', 'schema_postal_code',
                'schema_country', 'schema_applicant_country', 'schema_salary_unit', 'schema_direct_apply',
            ]);
        });
    }
};
