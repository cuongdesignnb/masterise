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

        // 9. Run static page seeder
        $this->call(StaticPageSeeder::class);

        // 10. Seed System Settings (Idempotent)
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

        Setting::set('about_page_collections', [
            [
                "id" => "brand-residence",
                "title" => "Brand Residence",
                "subtitle" => "Bất động sản hàng hiệu hàng đầu thế giới",
                "description" => "Tiên phong kiến tạo chuẩn sống hiệu xa xỉ bậc nhất tại Việt Nam. Sự hợp tác chiến lược cùng tập đoàn Marriott International mang đến những căn hộ mang tính di sản, được vận hành chuyên nghiệp theo tiêu chuẩn toàn cầu.",
                "image" => "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop",
                "features" => [
                    "Quản lý bởi Marriott & Ritz-Carlton",
                    "Vị trí độc bản tại các trung tâm tài chính",
                    "Đặc quyền thượng lưu chuẩn khách sạn 5 sao"
                ],
                "link" => "/du-an?q=grand+marina"
            ],
            [
                "id" => "lumiere-series",
                "title" => "Lumiere Series",
                "subtitle" => "Phong cách sống tinh tế và duy mỹ",
                "description" => "Bộ sưu tập các công trình căn hộ cao cấp với thiết kế kiến trúc xanh độc đáo mặt ngoài. Lumiere Series mang lại không gian sống hòa quyện cùng thiên nhiên, đề cao tính thẩm mỹ và sức khỏe thể chất lẫn tinh thần.",
                "image" => "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop",
                "features" => [
                    "Kiến trúc xanh đương đại biểu tượng",
                    "Hệ thống tiện ích chăm sóc sức khỏe",
                    "Nội thất tinh tế nhập khẩu cao cấp"
                ],
                "link" => "/du-an?q=lumiere"
            ],
            [
                "id" => "masteri-collection",
                "title" => "Masteri Collection",
                "subtitle" => "Nâng tầm trải nghiệm sống hiện đại",
                "description" => "Không gian sống chuẩn quốc tế kết hợp cùng tiện nghi hiện đại tại vị trí trung tâm các siêu đô thị. Masteri Collection cung cấp các căn hộ lý tưởng cho gia đình năng động với giá trị bền vững và cộng đồng văn minh.",
                "image" => "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1200&auto=format&fit=crop",
                "features" => [
                    "Không gian sống tối ưu, ngập tràn ánh sáng",
                    "Vị trí kết nối giao thông đồng bộ",
                    "Tiêu chuẩn bàn giao chuẩn quốc tế"
                ],
                "link" => "/du-an?q=masteri"
            ]
        ], 'json');

        Setting::set('footer_navigation', [
            [
                'title' => 'MASTERISE HOMES',
                'links' => [
                    ['label' => 'Trang chủ', 'href' => '/'],
                    ['label' => 'Giới thiệu', 'href' => '/gioi-thieu'],
                    ['label' => 'Dự án', 'href' => '/du-an'],
                    ['label' => 'Tin tức', 'href' => '/tin-tuc'],
                    ['label' => 'Đầu tư', 'href' => '/dau-tu'],
                    ['label' => 'Liên hệ', 'href' => '/lien-he']
                ]
            ],
            [
                'title' => 'DỰ ÁN',
                'links' => [
                    ['label' => 'Masterise Collection', 'href' => '/du-an?category=masterise-colletion'],
                    ['label' => 'Lumiere Series', 'href' => '/du-an?category=lumiere-series'],
                    ['label' => 'Sắp mở bán', 'href' => '/du-an?sales_status=coming_soon'],
                    ['label' => 'Đang mở bán', 'href' => '/du-an?sales_status=selling']
                ]
            ],
            [
                'title' => 'THÔNG TIN',
                'links' => [
                    ['label' => 'Tin tức', 'href' => '/tin-tuc'],
                    ['label' => 'Đầu tư', 'href' => '/dau-tu'],
                    ['label' => 'Chuyên trang', 'href' => '/chuyen-trang'],
                    ['label' => 'Chính sách bảo mật', 'href' => '/chuyen-trang/chinh-sach-bao-mat'],
                    ['label' => 'Điều khoản sử dụng', 'href' => '/chuyen-trang/dieu-khoan-su-dung']
                ]
            ]
        ], 'json');

        // Seed default AI settings if not exist or if they are invalid defaults
        if (!Setting::get('ai_text_model') || Setting::get('ai_text_model') === 'gpt-5.4-mini') {
            Setting::set('ai_text_model', 'gpt-4o-mini');
        }
        if (!Setting::get('ai_image_model') || Setting::get('ai_image_model') === 'gpt-image-2') {
            Setting::set('ai_image_model', 'gpt-image-1');
        }

        // 11. Seed SEO Meta for Static pages (Idempotent)
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
