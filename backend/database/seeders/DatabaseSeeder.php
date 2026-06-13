<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ProjectCategory;
use App\Models\Project;
use App\Models\PostCategory;
use App\Models\Post;
use App\Models\Setting;
use App\Models\Lead;
use App\Models\Appointment;
use App\Models\SeoMeta;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run Roles and Permissions Seeder
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Create Users
        $password = Hash::make('admin123');

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@masterise.com',
            'password' => $password,
            'phone' => '0901111111',
            'status' => 'active',
        ]);
        $superAdmin->assignRole('super_admin');

        $marketing = User::create([
            'name' => 'Marketing Specialist',
            'email' => 'marketing@masterise.com',
            'password' => $password,
            'phone' => '0902222222',
            'status' => 'active',
        ]);
        $marketing->assignRole('marketing');

        $saleManager = User::create([
            'name' => 'Sales Manager',
            'email' => 'manager@masterise.com',
            'password' => $password,
            'phone' => '0903333333',
            'status' => 'active',
        ]);
        $saleManager->assignRole('sale_manager');

        $saleAgent = User::create([
            'name' => 'Sales Consultant',
            'email' => 'sale@masterise.com',
            'password' => $password,
            'phone' => '0904444444',
            'status' => 'active',
        ]);
        $saleAgent->assignRole('sale');

        $customer = User::create([
            'name' => 'Khách Hàng Demo',
            'email' => 'customer@gmail.com',
            'password' => Hash::make('customer123'),
            'phone' => '0988888888',
            'status' => 'active',
        ]);
        $customer->assignRole('customer');
        $customer->customerProfile()->create([
            'preferred_regions' => ['Thành phố Thủ Đức', 'Quận 1'],
            'preferred_types' => ['apartment', 'villa'],
            'preferred_status' => ['selling'],
            'budget_min' => 5000000000,
            'budget_max' => 15000000000,
            'notes' => 'Tìm căn hộ 2 phòng ngủ hướng Đông Nam.',
        ]);

        // 3. Create Settings
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

        // Create SEO Meta for Static pages
        SeoMeta::create([
            'path' => '/',
            'title' => 'Masterise Homes - Kiến Tạo Phong Cách Sống Hàng Hiệu',
            'description' => 'Trang chủ chính thức của Masterise Homes Việt Nam. Khám phá các dự án bất động sản cao cấp, căn hộ hàng hiệu Marriott, The Global City.',
            'keywords' => 'masterise homes, bat dong san, the global city, grand marina saigon',
        ]);
        SeoMeta::create([
            'path' => '/gioi-thieu',
            'title' => 'Giới Thiệu Về Chúng Tôi | Masterise Homes',
            'description' => 'Masterise Homes - nhà phát triển bất động sản quốc tế tiên phong áp dụng các tiêu chuẩn toàn cầu vào việc phát triển, vận hành các sản phẩm bất động sản tại Việt Nam.',
            'keywords' => 'gioi thieu masterise homes, ve chung toi',
        ]);
        SeoMeta::create([
            'path' => '/lien-he',
            'title' => 'Liên Hệ Với Masterise Homes | Dịch Vụ Khách Hàng',
            'description' => 'Liên hệ ngay với bộ phận chăm sóc khách hàng và phòng kinh doanh Masterise Homes để nhận tư vấn chi tiết về các dự án bất động sản.',
            'keywords' => 'lien he masterise homes, hotline masterise homes',
        ]);

        // 4. Create Project Categories
        $catApartment = ProjectCategory::create([
            'name' => 'Căn Hộ Cao Cấp',
            'slug' => 'can-ho-cao-cap',
            'description' => 'Các dự án căn hộ cao cấp, căn hộ hàng hiệu (Branded Residences) hợp tác với Marriott International.',
        ]);

        $catVilla = ProjectCategory::create([
            'name' => 'Biệt Thự & Dinh Thự',
            'slug' => 'biet-thu-dinh-thu',
            'description' => 'Biệt thự sinh thái, dinh thực hạng sang ven sông đẳng cấp thượng lưu.',
        ]);

        $catShophouse = ProjectCategory::create([
            'name' => 'Nhà Phố Thương Mại (Shophouse)',
            'slug' => 'shophouse-commercial',
            'description' => 'Nhà phố thương mại, shophouse mặt tiền kinh doanh sầm uất tại các đại đô thị.',
        ]);

        // 5. Create Projects
        $p1 = Project::create([
            'name' => 'The Global City',
            'slug' => 'the-global-city',
            'description' => 'Đại đô thị chuẩn quốc tế được thiết kế bởi Foster + Partners, tọa lạc tại trung tâm mới của TP. HCM.',
            'content' => 'The Global City là khu đô thị phức hợp hiện đại chuẩn quốc tế đầu tiên của Việt Nam được thiết kế và quy hoạch bởi Công ty kiến trúc hàng đầu thế giới Foster + Partners từ Anh Quốc. Dự án sở hữu quy mô 117,4 ha tọa lạc ngay tại phường An Phú, TP. Thủ Đức, TP. HCM.',
            'location' => 'Đường Đỗ Xuân Hợp, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
            'region' => 'Thành phố Thủ Đức',
            'price_min' => 100000000,
            'price_max' => 150000000,
            'price_text' => 'Từ 100 triệu/m2',
            'status' => 'selling',
            'handover_year' => 2026,
            'is_featured' => true,
            'thumbnail' => '/images/projects/tgc-thumb.jpg',
            'gallery' => [
                '/images/projects/tgc-1.jpg',
                '/images/projects/tgc-2.jpg',
                '/images/projects/tgc-3.jpg',
            ],
            'brochure_url' => '/documents/tgc-brochure.pdf',
            'lat' => 10.796349,
            'lng' => 106.772591,
            'area_size' => '117.4 ha',
            'developer' => 'Masterise Homes',
            'scale' => '10,000 căn hộ & 1,800 shophouse/villas',
            'amenities' => ['Kênh đào nhạc nước 2km', 'Trung tâm thương mại 123,000m2', 'Trường học quốc tế', 'Bệnh viện quốc tế', 'Công viên cây xanh rộng lớn'],
        ]);
        $p1->categories()->attach([$catApartment->id, $catShophouse->id]);
        $p1->seoMeta()->create([
            'title' => 'The Global City | Đại Đô Thị Chuẩn Quốc Tế Foster+Partners',
            'description' => 'Khám phá dự án The Global City Masterise Homes tại An Phú, Quận 2. Bảng giá chủ đầu tư mới nhất, chính sách ưu đãi shophouse, căn hộ cao cấp.',
            'keywords' => 'the global city, du an global city, shophouse global city',
        ]);

        $p2 = Project::create([
            'name' => 'Grand Marina Saigon',
            'slug' => 'grand-marina-saigon',
            'description' => 'Dự án căn hộ hàng hiệu Marriott lớn nhất thế giới, tọa lạc tại vị trí độc tôn Bến Nghé, Quận 1.',
            'content' => 'Grand Marina, Saigon là khu căn hộ hàng hiệu Marriott International quy mô lớn nhất thế giới, đánh dấu bước chuyển mình lịch sử của Việt Nam trong phân khúc bất động sản cao cấp toàn cầu. Dự án ôm trọn dải ven sông Sài Gòn thơ mộng tại trung tâm Quận 1.',
            'location' => 'Số 2 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
            'region' => 'Quận 1',
            'price_min' => 350000000,
            'price_max' => 450000000,
            'price_text' => 'Từ 350 triệu/m2',
            'status' => 'selling',
            'handover_year' => 2025,
            'is_featured' => true,
            'thumbnail' => '/images/projects/gms-thumb.jpg',
            'gallery' => [
                '/images/projects/gms-1.jpg',
                '/images/projects/gms-2.jpg',
            ],
            'brochure_url' => '/documents/gms-brochure.pdf',
            'lat' => 10.785467,
            'lng' => 106.707253,
            'area_size' => '10 ha',
            'developer' => 'Masterise Homes',
            'scale' => '4,000 căn hộ hàng hiệu',
            'amenities' => ['Bến du thuyền', 'Hồ bơi tràn bờ view sông', 'Rạp chiếu phim cá nhân', 'Dịch vụ tiền sảnh Marriott 24/7', 'Nhà hàng 5 sao'],
        ]);
        $p2->categories()->attach([$catApartment->id]);
        $p2->seoMeta()->create([
            'title' => 'Grand Marina Saigon | Căn Hộ Hàng Hiệu Marriott Quận 1',
            'description' => 'Grand Marina Saigon - Biểu tượng phong cách sống thượng lưu tại trung tâm Quận 1. Độc quyền căn hộ hàng hiệu Marriott lớn nhất thế giới.',
            'keywords' => 'grand marina saigon, marriott branded residences, can ho branded residence q1',
        ]);

        $p3 = Project::create([
            'name' => 'Masteri Centre Point',
            'slug' => 'masteri-centre-point',
            'description' => 'Khu căn hộ khép kín cao cấp nằm tại trung tâm đại đô thị Vinhomes Grand Park, TP. Thủ Đức.',
            'content' => 'Masteri Centre Point là khu căn hộ compound cao cấp khép kín bậc nhất, tọa lạc tại trái tim của đại đô thị Vinhomes Grand Park, mang lại cho cư dân đặc quyền tận hưởng không gian sống tiện nghi, an ninh và ngập tràn sắc xanh.',
            'location' => 'Trung tâm Vinhomes Grand Park, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
            'region' => 'Thành phố Thủ Đức',
            'price_min' => 60000000,
            'price_max' => 80000000,
            'price_text' => 'Từ 60 triệu/m2',
            'status' => 'completed',
            'handover_year' => 2023,
            'is_featured' => false,
            'thumbnail' => '/images/projects/mcp-thumb.jpg',
            'gallery' => [
                '/images/projects/mcp-1.jpg',
            ],
            'lat' => 10.840248,
            'lng' => 106.843793,
            'area_size' => '7 ha',
            'developer' => 'Masterise Homes',
            'scale' => '5,000 căn hộ',
            'amenities' => ['Hồ bơi phi thuyền 2 tầng', 'Khu vui chơi trẻ em Kid zone', 'Phòng Gym trong nhà', 'Vườn nướng BBQ ven sông'],
        ]);
        $p3->categories()->attach([$catApartment->id]);

        $p4 = Project::create([
            'name' => 'Masteri West Heights',
            'slug' => 'masteri-west-heights',
            'description' => 'Dự án căn hộ cao cấp ven hồ tại trung tâm Smart City Tây Mỗ, Hà Nội.',
            'content' => 'Masteri West Heights nâng tầm chuẩn mực sống quốc tế tại Tây Mỗ, Hà Nội. Tọa lạc đối diện hồ trung tâm 4,8 ha của đại đô thị thông minh Smart City, dự án mang lại tầm nhìn khoáng đạt và hệ tiện ích 22 đặc quyền nội khu.',
            'location' => 'Khu đô thị Vinhomes Smart City, Tây Mỗ, Nam Từ Liêm, Hà Nội',
            'region' => 'Hà Nội',
            'price_min' => 70000000,
            'price_max' => 90000000,
            'price_text' => 'Từ 70 triệu/m2',
            'status' => 'completed',
            'handover_year' => 2024,
            'is_featured' => false,
            'thumbnail' => '/images/projects/mwh-thumb.jpg',
            'gallery' => [],
            'lat' => 21.008453,
            'lng' => 105.742398,
            'area_size' => '3.1 ha',
            'developer' => 'Masterise Homes',
            'scale' => '3,599 căn hộ',
            'amenities' => ['Hồ bơi tầng thượng', 'Vườn trên không', 'Phòng lọc không khí sạch', 'Rạp chiếu phim gia đình'],
        ]);
        $p4->categories()->attach([$catApartment->id]);

        // 6. Create Post Categories
        $pCatNews = PostCategory::create([
            'name' => 'Tin Tức & Sự Kiện',
            'slug' => 'tin-tuc-su-kien',
            'description' => 'Cập nhật tin tức doanh nghiệp, sự kiện mở bán và các hoạt động cộng đồng nổi bật.',
        ]);

        $pCatGuide = PostCategory::create([
            'name' => 'Hướng Dẫn Mua Nhà',
            'slug' => 'huong-dan-mua-nha',
            'description' => 'Cẩm nang pháp lý, kinh nghiệm vay tài chính, quy trình mua căn hộ cho người mua nhà.',
        ]);

        // 7. Create Posts
        $post1 = Post::create([
            'title' => 'Masterise Homes Hợp Tác Chiến Lược Với Các Đối Tác Anh Quốc',
            'slug' => 'masterise-homes-hop-tac-chien-luoc-anh-quoc',
            'summary' => 'Sự kiện ký kết hợp tác giữa Masterise Homes và các đối tác thiết kế, quy hoạch đô thị hàng đầu tại Vương Quốc Anh.',
            'content' => '<p>Masterise Homes chính thức công bố ký kết hợp tác với Foster + Partners cùng nhiều tên tuổi lớn của ngành kiến trúc Anh Quốc nhằm mục tiêu đưa The Global City trở thành khu đô thị thông minh kiểu mẫu đẳng cấp quốc tế tại khu vực Đông Nam Á.</p><p>Hợp tác này cam kết mang tới tiêu chuẩn sống xanh, bền vững cùng những giải pháp công nghệ thông minh vận hành trọn vẹn khu đô thị.</p>',
            'thumbnail' => '/images/news/news-1.jpg',
            'status' => 'published',
            'is_featured' => true,
            'post_category_id' => $pCatNews->id,
            'author_id' => $superAdmin->id,
            'published_at' => now(),
        ]);
        $post1->seoMeta()->create([
            'title' => 'Masterise Homes Hợp Tác Với Đối Tác Kiến Trúc Anh Quốc',
            'description' => 'Masterise Homes bắt tay cùng Foster+Partners kiến tạo đại đô thị The Global City chuẩn quốc tế. Cập nhật tin tức doanh nghiệp mới nhất.',
        ]);

        $post2 = Post::create([
            'title' => 'Cẩm Nang Thủ Tục Vay Mua Nhà Trả Góp Cần Biết',
            'slug' => 'cam-nang-thu-tuc-vay-mua-nha-tra-gop',
            'summary' => 'Chi tiết các hồ sơ, quy trình thẩm định, điều kiện và kinh nghiệm chọn gói vay tài chính phù hợp khi mua căn hộ.',
            'content' => '<p>Mua nhà trả góp qua ngân hàng là giải pháp tài chính tối ưu cho nhiều gia đình trẻ hiện nay. Tuy nhiên, quy trình chuẩn bị hồ sơ vay thế chấp bất động sản thế nào để duyệt nhanh và hưởng lãi suất ưu đãi nhất?</p><p>Bài viết này hướng dẫn chi tiết từ thủ tục chứng minh thu nhập đến lựa chọn thời gian vay phù hợp.</p>',
            'thumbnail' => '/images/news/news-2.jpg',
            'status' => 'published',
            'is_featured' => false,
            'post_category_id' => $pCatGuide->id,
            'author_id' => $marketing->id,
            'published_at' => now()->subDays(2),
        ]);
        $post2->seoMeta()->create([
            'title' => 'Hướng Dẫn Thủ Tục Vay Ngân Hàng Mua Bất Động Sản Trả Góp',
            'description' => 'Xem chi tiết cẩm nang vay vốn ngân hàng mua căn hộ Masterise Homes. Lãi suất, điều kiện, quy trình hồ sơ duyệt nhanh.',
        ]);

        // 8. Create Leads
        Lead::create([
            'name' => 'Nguyễn Văn A',
            'email' => 'vana@gmail.com',
            'phone' => '0901234567',
            'type' => 'contact',
            'message' => 'Tôi cần tư vấn hotline phòng kinh doanh.',
            'status' => 'new',
            'assigned_to' => $saleAgent->id,
        ]);

        Lead::create([
            'name' => 'Trần Thị B',
            'email' => 'thib@gmail.com',
            'phone' => '0987654321',
            'type' => 'consultation',
            'message' => 'Cần nhận bảng giá căn hộ 2 phòng ngủ The Global City.',
            'status' => 'contacted',
            'project_id' => $p1->id,
            'user_id' => $customer->id,
            'assigned_to' => $saleAgent->id,
        ]);

        // 9. Booked Appointment
        Appointment::create([
            'user_id' => $customer->id,
            'project_id' => $p1->id,
            'appointment_date' => '2026-06-20',
            'appointment_time' => '09:00:00',
            'notes' => 'Hẹn gặp tại nhà mẫu để xem sa bàn dự án The Global City.',
            'status' => 'confirmed',
            'assigned_to' => $saleAgent->id,
        ]);
    }
}
