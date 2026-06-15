<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\SeoMeta;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run Roles and Permissions Seeder
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Run User Seeder
        $this->call(UserSeeder::class);

        // 3. Run Category Seeder
        $this->call(ProjectCategorySeeder::class);

        // 4. Run Project Seeder
        $this->call(ProjectSeeder::class);

        // 5. Run VR Tour Seeder if it exists
        if (class_exists(\Database\Seeders\ProjectVrTourSeeder::class)) {
            $this->call(ProjectVrTourSeeder::class);
        }

        // 6. Run Lead Seeder
        $this->call(LeadSeeder::class);

        // 7. Seed System Settings (Idempotent)
        Setting::set('company_name', 'Masterise Homes');
        Setting::set('company_address', 'Tòa nhà Masterise, Thảo Điền, Thành phố Thủ Đức, TP. HCM');
        Setting::set('hotline', '028 39 159 159');
        Setting::set('email', 'sales@masterisehomes.com');
        Setting::set('social_links', [
            'facebook' => 'https://facebook.com/masterisehomes',
            'youtube' => 'https://youtube.com/masterisehomes',
            'linkedin' => 'https://linkedin.com/company/masterisehomes',
        ], 'json');
        Setting::set('homepage_meta', [
            'hero_title' => 'Sống Trải Nghiệm Cùng Masterise Homes',
            'hero_description' => 'Kiến tạo phong cách sống đẳng cấp thế giới với các dự án bất động sản hàng hiệu hàng đầu Việt Nam.',
            'hero_video_url' => 'https://www.w3schools.com/html/mov_bbb.mp4',
        ], 'json');

        // 8. Seed SEO Meta for Static pages (Idempotent)
        SeoMeta::updateOrCreate(
            ['path' => '/'],
            [
                'title' => 'Masterise Homes - Kiến Tạo Phong Cách Sống Hàng Hiệu',
                'description' => 'Trang chủ chính thức của Masterise Homes Việt Nam. Khám phá các dự án bất động sản cao cấp, căn hộ hàng hiệu Marriott, The Global City.',
                'keywords' => 'masterise homes, bat dong san, the global city, grand marina saigon',
            ]
        );
        
        SeoMeta::updateOrCreate(
            ['path' => '/gioi-thieu'],
            [
                'title' => 'Giới Thiệu Về Chúng Tôi | Masterise Homes',
                'description' => 'Masterise Homes - nhà phát triển bất động sản quốc tế tiên phong áp dụng các tiêu chuẩn toàn cầu vào việc phát triển, vận hành các sản phẩm bất động sản tại Việt Nam.',
                'keywords' => 'gioi thieu masterise homes, ve chung toi',
            ]
        );
        
        SeoMeta::updateOrCreate(
            ['path' => '/lien-he'],
            [
                'title' => 'Liên Hệ Với Masterise Homes | Dịch Vụ Khách Hàng',
                'description' => 'Liên hệ ngay với bộ phận chăm sóc khách hàng và phòng kinh doanh Masterise Homes để nhận tư vấn chi tiết về các dự án bất động sản.',
                'keywords' => 'lien he masterise homes, hotline masterise homes',
            ]
        );
    }
}
