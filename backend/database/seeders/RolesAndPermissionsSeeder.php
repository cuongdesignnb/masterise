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

        // Extensive permissions list
        $permissions = [
            'dashboard.view',
            
            // Projects
            'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.publish', 'projects.seo',
            
            // Units (Sản phẩm)
            'units.view', 'units.create', 'units.update', 'units.delete', 'units.import', 'units.export', 'units.status.update', 'units.seo',
            
            // Posts
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'posts.seo',
            
            // Landing Pages
            'landing_pages.view', 'landing_pages.create', 'landing_pages.update', 'landing_pages.delete', 'landing_pages.publish', 'landing_pages.seo',
            
            // Media
            'media.view', 'media.upload', 'media.update', 'media.delete',
            
            // Leads
            'leads.view', 'leads.create', 'leads.update', 'leads.assign', 'leads.delete', 'leads.export', 'leads.import',
            
            // Appointments
            'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete', 'appointments.status.update',
            
            // SEO
            'seo.view', 'seo.update', 'redirects.manage', 'sitemap.manage', 'schema.manage', 'seo.audit.view',
            
            // Settings
            'settings.view', 'settings.update',
            
            // Users & Roles
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            
            // Reports & Logs
            'reports.view', 'reports.export',
            'audit_logs.view'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create roles and assign existing permissions
        
        // 1. Super Admin (Implicitly gets all via Gate::before, but assigning for completeness)
        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions($permissions);

        // 2. Admin
        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions($permissions); // Admin gets everything in default config

        // 3. Marketing
        $marketing = Role::findOrCreate('marketing', 'web');
        $marketing->syncPermissions([
            'dashboard.view',
            'projects.view', 'projects.seo',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish', 'posts.seo',
            'landing_pages.view', 'landing_pages.create', 'landing_pages.update', 'landing_pages.delete', 'landing_pages.publish', 'landing_pages.seo',
            'media.view', 'media.upload', 'media.update', 'media.delete',
            'seo.view', 'seo.update', 'redirects.manage', 'sitemap.manage', 'schema.manage',
            'settings.view'
        ]);

        // 4. Sales Manager
        $salesManager = Role::findOrCreate('sale_manager', 'web');
        $salesManager->syncPermissions([
            'dashboard.view',
            'projects.view',
            'units.view', 'units.status.update',
            'leads.view', 'leads.update', 'leads.assign', 'leads.delete', 'leads.export', 'leads.import',
            'appointments.view', 'appointments.update', 'appointments.status.update',
            'reports.view'
        ]);

        // 5. Sales Agent
        $sales = Role::findOrCreate('sale', 'web');
        $sales->syncPermissions([
            'dashboard.view',
            'projects.view',
            'units.view',
            'leads.view', 'leads.update',
            'appointments.view', 'appointments.status.update'
        ]);

        // 6. Customer (Transitional compatibility)
        $customer = Role::findOrCreate('customer', 'web');
        $customer->syncPermissions([]);

        // 7. Client (Standard Client Role)
        $client = Role::findOrCreate('client', 'web');
        $client->syncPermissions([]);
    }
}
