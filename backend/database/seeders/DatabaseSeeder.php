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

        // 7. Run Homepage Content Seeder
        $this->call(HomepageContentSeeder::class);

        // 8. Run public news, investment and event content seeder
        $this->call(PostContentSeeder::class);

        // 9. Seed System Settings (Idempotent)
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

        // 10. Seed SEO Meta for Static pages (Idempotent)
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

        SeoMeta::updateOrCreate(
            ['path' => '/du-an'],
            [
                'title' => 'Du an Masterise Homes - Can ho cao cap va bat dong san hang sang',
                'description' => 'Danh sach du an Masterise Homes theo dong san pham, trang thai mo ban va thoi gian mo ban moi nhat.',
                'keywords' => 'du an masterise homes, can ho cao cap, lumiere series',
            ]
        );

        SeoMeta::updateOrCreate(
            ['path' => '/tin-tuc'],
            [
                'title' => 'Tin tuc Masterise Homes - Cap nhat thi truong va du an moi',
                'description' => 'Tin tuc moi nhat ve Masterise Homes, thi truong bat dong san cao cap va cac du an dang quan tam.',
                'keywords' => 'tin tuc masterise homes, bat dong san cao cap',
            ]
        );

        SeoMeta::updateOrCreate(
            ['path' => '/dau-tu'],
            [
                'title' => 'Co hoi dau tu Masterise Homes - Su kien, chinh sach va phan tich',
                'description' => 'Cap nhat co hoi dau tu, su kien mo ban, chinh sach ban hang va phan tich gia tri tu Masterise Homes.',
                'keywords' => 'dau tu masterise homes, co hoi dau tu, su kien mo ban',
            ]
        );
    }
}
