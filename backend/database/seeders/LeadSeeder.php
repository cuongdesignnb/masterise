<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;
use App\Models\Project;
use App\Models\User;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing leads first to ensure clean idempotency
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Lead::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        // Get sale agent and projects
        $saleAgent = User::role('sale')->first();
        $projects = Project::all();
        $clientUser = User::role('client')->first();

        $saleId = $saleAgent ? $saleAgent->id : null;
        $clientId = $clientUser ? $clientUser->id : null;

        $statuses = [
            'new', 'assigned', 'called_first_time', 'no_answer', 
            'connected', 'qualified', 'sent_document', 'scheduled_visit', 
            'visited_project', 'negotiating', 'booking', 'deposit', 
            'contract_signed', 'lost', 'invalid'
        ];

        $names = [
            'Trần Văn Long', 'Nguyễn Thị Hương', 'Lê Hoàng Hải', 'Phạm Minh Đức', 
            'Vũ Thị Hồng', 'Đặng Quốc Huy', 'Hoàng Văn Thắng', 'Bùi Thị Mai', 
            'Trịnh Hồng Sơn', 'Đỗ Thành Trung', 'Lý Ngọc Anh', 'Phan Văn Tiến', 
            'Tô Minh Nhật', 'Hồ Quốc Bảo', 'Ngô Thanh Hà', 'Dương Anh Tuấn', 
            'Võ Hoài Nam', 'Mai Thu Thảo', 'Cao Minh Triết', 'Đoàn Phương Nam'
        ];

        for ($i = 0; $i < 20; $i++) {
            $proj = $projects->random();
            $status = $statuses[$i % count($statuses)];
            
            // Assign some leads to clientUser
            $userId = ($i % 5 === 0) ? $clientId : null;

            Lead::create([
                'name' => $names[$i],
                'email' => 'customer' . ($i + 1) . '@example.com',
                'phone' => '0912' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'type' => $i % 2 === 0 ? 'consultation' : 'contact',
                'message' => 'Cần tư vấn chi tiết về dự án ' . $proj->name . ' và nhận bảng giá chi tiết.',
                'status' => $status,
                'project_id' => $proj->id,
                'user_id' => $userId,
                'assigned_to' => ($status !== 'new') ? $saleId : null,
                'utm_source' => $i % 3 === 0 ? 'google' : ($i % 3 === 1 ? 'facebook' : 'direct'),
                'utm_medium' => $i % 3 === 0 ? 'cpc' : ($i % 3 === 1 ? 'social' : 'none'),
                'utm_campaign' => 'spring_2026',
                'landing_page' => 'http://localhost:8746/du-an/' . $proj->slug,
                'referrer' => 'https://google.com',
                'demand_type' => $i % 2 === 0 ? 'Đầu tư' : 'Ở thực',
                'budget_range' => $i % 3 === 0 ? '5 - 10 tỷ' : ($i % 3 === 1 ? '10 - 20 tỷ' : 'Trên 20 tỷ'),
                'product_type' => $i % 3 === 0 ? 'apartment' : ($i % 3 === 1 ? 'villa' : 'shophouse'),
                'score' => rand(10, 90),
                'temperature' => $i % 3 === 0 ? 'hot' : ($i % 3 === 1 ? 'warm' : 'cold'),
                'last_contacted_at' => now()->subDays(rand(1, 10)),
                'next_follow_up_at' => now()->addDays(rand(1, 5)),
            ]);
        }
    }
}
