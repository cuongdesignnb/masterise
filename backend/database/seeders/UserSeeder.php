<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Super Admin
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@masterise.local'],
            [
                'name' => 'Super Admin',
                'password' => $password,
                'phone' => '0900000001',
                'status' => 'active',
            ]
        );
        $superAdmin->syncRoles(['super_admin']);

        // 2. Sale Manager
        $saleManager = User::updateOrCreate(
            ['email' => 'manager@masterise.local'],
            [
                'name' => 'Sales Manager',
                'password' => $password,
                'phone' => '0900000002',
                'status' => 'active',
            ]
        );
        $saleManager->syncRoles(['sale_manager']);

        // 3. Sale Consultant
        $saleAgent = User::updateOrCreate(
            ['email' => 'sale@masterise.local'],
            [
                'name' => 'Sales Consultant',
                'password' => $password,
                'phone' => '0900000003',
                'status' => 'active',
            ]
        );
        $saleAgent->syncRoles(['sale']);

        // 4. Client
        $client = User::updateOrCreate(
            ['email' => 'client@masterise.local'],
            [
                'name' => 'Khách Hàng Demo',
                'password' => $password,
                'phone' => '0900000004',
                'status' => 'active',
            ]
        );
        $client->syncRoles(['customer', 'client']);
        
        $client->customerProfile()->updateOrCreate(
            ['user_id' => $client->id],
            [
                'phone' => '0900000004',
                'preferred_regions' => ['Thành phố Thủ Đức', 'Quận 1'],
                'preferred_types' => ['apartment', 'villa'],
                'preferred_status' => ['selling'],
                'budget_min' => 5000000000,
                'budget_max' => 15000000000,
                'notes' => 'Tìm căn hộ 2 phòng ngủ hướng Đông Nam.',
            ]
        );
    }
}
