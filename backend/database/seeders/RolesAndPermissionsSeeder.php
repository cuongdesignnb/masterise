<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'dashboard.view',
            'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.publish', 'projects.seo',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'posts.seo',
            'media.view', 'media.upload', 'media.delete',
            'leads.view', 'leads.create', 'leads.update', 'leads.assign', 'leads.delete', 'leads.export',
            'users.view', 'users.create', 'users.update', 'users.delete',
            'seo.view', 'seo.update', 'redirects.manage', 'sitemap.manage',
            'settings.view', 'settings.update',
            'reports.view'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create roles and assign existing permissions
        
        // 1. Super Admin
        $superAdminRole = Role::findOrCreate('super_admin', 'web');
        // Super Admin gets all permissions implicitly via Gate::before in AuthServiceProvider, but assigning them is also fine.

        // 2. Admin
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->givePermissionTo([
            'dashboard.view',
            'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.publish', 'projects.seo',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'posts.seo',
            'media.view', 'media.upload', 'media.delete',
            'leads.view', 'leads.create', 'leads.update', 'leads.assign', 'leads.delete', 'leads.export',
            'users.view', 'users.create', 'users.update',
            'seo.view', 'seo.update',
            'settings.view'
        ]);

        // 3. Marketing
        $marketingRole = Role::findOrCreate('marketing', 'web');
        $marketingRole->givePermissionTo([
            'dashboard.view',
            'projects.view', 'projects.seo',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'posts.seo',
            'media.view', 'media.upload', 'media.delete',
            'seo.view', 'seo.update', 'redirects.manage', 'sitemap.manage'
        ]);

        // 4. Sales Manager
        $salesManagerRole = Role::findOrCreate('sale_manager', 'web');
        $salesManagerRole->givePermissionTo([
            'dashboard.view',
            'projects.view',
            'leads.view', 'leads.update', 'leads.assign', 'leads.delete', 'leads.export',
            'reports.view'
        ]);

        // 5. Sales Agent
        $salesRole = Role::findOrCreate('sale', 'web');
        $salesRole->givePermissionTo([
            'dashboard.view',
            'projects.view',
            'leads.view', 'leads.update'
        ]);

        // 6. Customer
        $customerRole = Role::findOrCreate('customer', 'web');
        $customerRole->givePermissionTo([
            'dashboard.view'
        ]);
    }
}
