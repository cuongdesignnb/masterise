<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    private array $permissions = [
        'career_jobs.view', 'career_jobs.create', 'career_jobs.update', 'career_jobs.delete',
        'career_applications.view', 'career_applications.update', 'career_applications.delete',
        'career_applications.download_cv', 'career_settings.manage',
    ];

    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        foreach ($this->permissions as $name) Permission::findOrCreate($name, 'web');
        foreach (['super_admin', 'admin'] as $roleName) {
            if ($role = Role::where('name', $roleName)->where('guard_name', 'web')->first()) $role->givePermissionTo($this->permissions);
        }
        $recruiter = Role::findOrCreate('recruiter', 'web');
        $recruiter->syncPermissions(array_values(array_diff($this->permissions, ['career_applications.delete', 'career_settings.manage'])));
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Role::where('name', 'recruiter')->where('guard_name', 'web')->delete();
        Permission::whereIn('name', $this->permissions)->where('guard_name', 'web')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
