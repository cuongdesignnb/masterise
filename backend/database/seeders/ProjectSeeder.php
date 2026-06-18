<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;
use App\Models\ProjectCategory;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get categories
        $catApartment = ProjectCategory::where('slug', 'can-ho-cao-cap')->first();
        $catVilla = ProjectCategory::where('slug', 'biet-thu-dinh-thu')->first();
        $catShophouse = ProjectCategory::where('slug', 'shophouse-commercial')->first();

        // 1. The Global City
        $p1 = Project::updateOrCreate(
            ['slug' => 'the-global-city'],
            [
                'name' => 'The Global City',
                'description' => 'Đại đô thị chuẩn quốc tế được thiết kế bởi Foster + Partners, tọa lạc tại trung tâm mới của TP. HCM.',
                'content' => 'The Global City là khu đô thị phức hợp hiện đại chuẩn quốc tế đầu tiên của Việt Nam được thiết kế và quy hoạch bởi Công ty kiến trúc hàng đầu thế giới Foster + Partners từ Anh Quốc. Dự án sở hữu quy mô 117,4 ha tọa lạc ngay tại phường An Phú, TP. Thủ Đức, TP. HCM.',
                'location' => 'Đường Đỗ Xuân Hợp, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh',
                'region' => 'Thành phố Thủ Đức',
                'address' => 'Đỗ Xuân Hợp, P. An Phú, TP. Thủ Đức, TP. HCM',
                'price_min' => 100000000.00,
                'price_max' => 150000000.00,
                'price_text' => 'Từ 8,9 tỷ/căn',
                'area_size' => '117,4 ha',
                'developer' => 'Masterise Homes',
                'scale' => 'Nhà phố, Biệt thự, Căn hộ, Shophouse',
                'status' => 'selling',
                'sales_status' => 'selling',
                'handover_year' => 2026,
                'handover_time' => 'Q1/2026',
                'legal_status' => 'Sổ hồng từng căn',
                'ownership_type' => 'Lâu dài',
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now(),
                'thumbnail' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
                'banner_image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=88&w=2000&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=88&w=1400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=88&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=88&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=88&w=900&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?q=88&w=900&auto=format&fit=crop',
                ],
                'highlight_points' => [
                    'Thiết kế bởi Foster + Partners từ Anh Quốc',
                    'Kênh đào nhạc nước quy mô hàng đầu Đông Nam Á',
                    'Trung tâm thương mại hạng sang rộng 123.000 m2',
                    'Hệ thống trường học và bệnh viện chuẩn quốc tế',
                ],
                'nearby_places' => [
                    '2 phút đến đường Liên Phường',
                    '5 phút đến tuyến Metro Thủ Thiêm - Long Thành',
                    '10 phút đến trung tâm Quận 1',
                    '15 phút đến sân bay Quốc tế Long Thành',
                ],
                'payment_policy' => 'Thanh toán linh hoạt lên đến 36 tháng, chiết khấu hấp dẫn cho khách hàng thanh toán sớm.',
                'sales_policy' => 'Hỗ trợ vay ngân hàng lên tới 70% giá trị căn hộ, hỗ trợ lãi suất 0% trong vòng 24 tháng.',
                'booking_policy' => 'Booking giữ chỗ chỉ với 100 triệu/căn, hoàn tiền 100% nếu không chọn được căn ưng ý.',
                'virtual_tour_url' => 'https://kuula.co/share/collection/7K98F',
                'amenities' => ['Trees', 'Waves', 'GraduationCap', 'Store', 'Dumbbell', 'ShieldCheck'],
            ]
        );
        if ($catApartment && $catShophouse) {
            $p1->categories()->sync([$catApartment->id, $catShophouse->id]);
        }
        $p1->seoMeta()->updateOrCreate(
            ['seoable_id' => $p1->id, 'seoable_type' => get_class($p1)],
            [
                'title' => 'The Global City | Đại Đô Thị Chuẩn Quốc Tế Foster+Partners',
                'description' => 'Khám phá dự án The Global City Masterise Homes tại An Phú, Quận 2. Bảng giá chủ đầu tư mới nhất, chính sách ưu đãi shophouse, căn hộ cao cấp.',
                'keywords' => 'the global city, du an global city, shophouse global city',
            ]
        );

        // 2. Masteri Centre Point
        $p2 = Project::updateOrCreate(
            ['slug' => 'masteri-centre-point'],
            [
                'name' => 'Masteri Centre Point',
                'description' => 'Khu căn hộ compound khép kín cao cấp nằm tại trung tâm đại đô thị Vinhomes Grand Park.',
                'content' => 'Masteri Centre Point là khu căn hộ compound cao cấp khép kín bậc nhất, tọa lạc tại trái tim của đại đô thị Vinhomes Grand Park, mang lại cho cư dân đặc quyền tận hưởng không gian sống tiện nghi, an ninh và ngập tràn sắc xanh.',
                'location' => 'Trung tâm Vinhomes Grand Park, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
                'region' => 'Thành phố Thủ Đức',
                'address' => 'Vinhomes Grand Park, P. Long Bình, TP. Thủ Đức, TP. HCM',
                'price_min' => 60000000.00,
                'price_max' => 80000000.00,
                'price_text' => 'Từ 5,5 tỷ/căn',
                'area_size' => '7 ha',
                'developer' => 'Masterise Homes',
                'scale' => 'Căn hộ cao cấp, Duplex, Penthouse',
                'status' => 'completed',
                'sales_status' => 'handover',
                'handover_year' => 2023,
                'handover_time' => 'Q4/2023',
                'legal_status' => 'Sổ hồng lâu dài',
                'ownership_type' => 'Lâu dài',
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now(),
                'thumbnail' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
                'banner_image' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop'
                ],
                'highlight_points' => [
                    'Khu compound khép kín an ninh 24/7',
                    'Hồ bơi phi thuyền 2 tầng độc đáo',
                    'Bàn giao trang thiết bị cao cấp quốc tế Kohlers, Hafele',
                ],
                'nearby_places' => [
                    '1 phút đến công viên Ánh Sáng 36ha',
                    '2 phút đến TTTM Vincom Mega Mall',
                    '5 phút đến bệnh viện Vinmec',
                ],
                'payment_policy' => 'Thanh toán giãn tiến độ cực kỳ tốt, hỗ trợ nhận nhà ngay.',
                'sales_policy' => 'Miễn phí quản lý dịch vụ trong 3 năm đầu, hỗ trợ vay 80%.',
                'booking_policy' => 'Thủ tục nhanh gọn, nhận nhà ở ngay sau khi hoàn thành thanh toán 20%.',
                'virtual_tour_url' => null,
                'amenities' => ['Trees', 'Waves', 'Dumbbell', 'ShieldCheck'],
            ]
        );
        if ($catApartment) {
            $p2->categories()->sync([$catApartment->id]);
        }
        $p2->seoMeta()->updateOrCreate(
            ['seoable_id' => $p2->id, 'seoable_type' => get_class($p2)],
            [
                'title' => 'Masteri Centre Point | Căn Hộ Compound Cao Cấp Quận 9',
                'description' => 'Khám phá khu compound Masteri Centre Point tại Vinhomes Grand Park. Chính sách nhận nhà ngay và các ưu đãi thanh toán mới nhất.',
                'keywords' => 'masteri centre point, compound quan 9, can ho masteri',
            ]
        );

        // 3. Grand Marina Saigon
        $p3 = Project::updateOrCreate(
            ['slug' => 'grand-marina-saigon'],
            [
                'name' => 'Grand Marina Saigon',
                'description' => 'Dự án căn hộ hàng hiệu Marriott lớn nhất thế giới, tọa lạc tại vị trí độc tôn Bến Nghé, Quận 1.',
                'content' => 'Grand Marina, Saigon là khu căn hộ hàng hiệu Marriott International quy mô lớn nhất thế giới, ôm trọn dải ven sông Sài Gòn thơ mộng tại trung tâm Quận 1. Biểu tượng thượng lưu toàn cầu đầu tiên tại Việt Nam.',
                'location' => 'Số 2 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'region' => 'Quận 1',
                'address' => 'Số 2 Tôn Đức Thắng, P. Bến Nghé, Quận 1, TP. HCM',
                'price_min' => 350000000.00,
                'price_max' => 450000000.00,
                'price_text' => 'Từ 25,0 tỷ/căn',
                'area_size' => '10 ha',
                'developer' => 'Masterise Homes',
                'scale' => 'Căn hộ hàng hiệu Marriott & JW Marriott',
                'status' => 'selling',
                'sales_status' => 'selling',
                'handover_year' => 2025,
                'handover_time' => 'Q4/2025',
                'legal_status' => 'Sở hữu lâu dài',
                'ownership_type' => 'Lâu dài',
                'is_featured' => true,
                'is_published' => true,
                'published_at' => now(),
                'thumbnail' => 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
                'banner_image' => 'https://images.unsplash.com/photo-1565623833408-d77e39b88af6?q=80&w=1200&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop'
                ],
                'highlight_points' => [
                    'Bất động sản hàng hiệu Marriott lớn nhất thế giới',
                    'Vị trí độc tôn ven sông Sài Gòn tại Bến Ba Son Quận 1',
                    'Dịch vụ quản lý tiền sảnh chuẩn khách sạn 5 sao',
                ],
                'nearby_places' => [
                    '1 phút đến ga Metro Ba Son',
                    '2 phút đến cầu Thủ Thiêm 2',
                    '5 phút đến phố đi bộ Nguyễn Huệ',
                ],
                'payment_policy' => 'Thanh toán chuẩn theo tiến độ xây dựng hoặc phương án chiết khấu đặc biệt cho thanh toán nhanh.',
                'sales_policy' => 'Hỗ trợ đặc quyền quản lý căn hộ, dịch vụ Marriott Butler 24/7.',
                'booking_policy' => 'Giữ chỗ có điều kiện đối với giỏ hàng VIP trực tiếp từ chủ đầu tư.',
                'virtual_tour_url' => null,
                'amenities' => ['Waves', 'Dumbbell', 'Store', 'ShieldCheck'],
            ]
        );
        if ($catApartment) {
            $p3->categories()->sync([$catApartment->id]);
        }
        $p3->seoMeta()->updateOrCreate(
            ['seoable_id' => $p3->id, 'seoable_type' => get_class($p3)],
            [
                'title' => 'Grand Marina Saigon | Căn Hộ Hàng Hiệu Marriott Quận 1',
                'description' => 'Grand Marina Saigon - Biểu tượng phong cách sống thượng lưu tại trung tâm Quận 1. Căn hộ branded residences Marriott.',
                'keywords' => 'grand marina saigon, marriott saigon, branded residences q1',
            ]
        );

        // 4. Lumière Boulevard
        $p4 = Project::updateOrCreate(
            ['slug' => 'lumiere-boulevard'],
            [
                'name' => 'Lumière Boulevard',
                'description' => 'Không gian sống xanh chuẩn resort kết hợp cùng kiến trúc xanh thẳng đứng độc đáo tại Thủ Đức.',
                'content' => 'Lumière Boulevard kiến tạo nên một chuẩn mực sống xanh hiện đại hàng đầu Việt Nam với vườn treo thẳng đứng lớn nhất TP. HCM. Nơi mang thiên nhiên xanh ngập tràn vào từng không gian sống sang trọng của căn hộ.',
                'location' => 'Trung tâm Vinhomes Grand Park, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh',
                'region' => 'Thành phố Thủ Đức',
                'address' => 'Vinhomes Grand Park, P. Long Bình, TP. Thủ Đức, TP. HCM',
                'price_min' => 50000000.00,
                'price_max' => 70000000.00,
                'price_text' => 'Từ 4,5 tỷ/căn',
                'area_size' => '2.1 ha',
                'developer' => 'Masterise Homes',
                'scale' => 'Căn hộ cao cấp, Penthouse',
                'status' => 'completed',
                'sales_status' => 'handover',
                'handover_year' => 2024,
                'handover_time' => 'Q2/2024',
                'legal_status' => 'Sổ hồng từng căn',
                'ownership_type' => 'Lâu dài',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => now(),
                'thumbnail' => 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
                'banner_image' => 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop'
                ],
                'highlight_points' => [
                    'Kiến trúc xanh thẳng đứng lớn nhất Việt Nam',
                    'Hệ thống vườn 3D ngập tràn cây xanh nội khu',
                    'Được quản lý vận hành theo tiêu chuẩn Masterise Property Management',
                ],
                'nearby_places' => [
                    '2 phút đến Vincom Mega Mall lớn nhất miền Nam',
                    '3 phút đến công viên biển nhân tạo 36ha',
                    '5 phút đến bến du thuyền Manhattan Glory',
                ],
                'payment_policy' => 'Hỗ trợ thanh toán vay ngân hàng và hưởng lãi suất 0%.',
                'sales_policy' => 'Tặng gói quản lý căn hộ dịch vụ cao cấp.',
                'booking_policy' => 'Thủ tục giữ căn online nhanh chóng.',
                'virtual_tour_url' => null,
                'amenities' => ['Trees', 'Waves', 'Dumbbell', 'ShieldCheck'],
            ]
        );
        if ($catApartment) {
            $p4->categories()->sync([$catApartment->id]);
        }
        $p4->seoMeta()->updateOrCreate(
            ['seoable_id' => $p4->id, 'seoable_type' => get_class($p4)],
            [
                'title' => 'Lumière Boulevard | Căn Hộ Xanh Chuẩn Quốc Tế Thủ Đức',
                'description' => 'Lumière Boulevard Masterise Homes - Trải nghiệm phong cách sống xanh compound giữa trung tâm Thủ Đức.',
                'keywords' => 'lumiere boulevard, can ho xanh thu duc, masterise thu duc',
            ]
        );

        // 5. Masteri Waterfront
        $p5 = Project::updateOrCreate(
            ['slug' => 'masteri-waterfront'],
            [
                'name' => 'Masteri Waterfront',
                'description' => 'Dự án căn hộ cao cấp ven hồ tại vị trí đắc địa của đại đô thị Ocean Park, Hà Nội.',
                'content' => 'Masteri Waterfront mang lại không gian sống nghệ thuật lấy cảm hứng từ các tác phẩm của danh họa Van Gogh. Tọa lạc ngay tại trung tâm Ocean Park, Hà Nội với tầm nhìn hướng trực diện hồ nước mặn 6,1ha.',
                'location' => 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
                'region' => 'Hà Nội',
                'address' => 'Vinhomes Ocean Park, Gia Lâm, Hà Nội',
                'price_min' => 55000000.00,
                'price_max' => 75000000.00,
                'price_text' => 'Từ 4,8 tỷ/căn',
                'area_size' => '3.7 ha',
                'developer' => 'Masterise Homes',
                'scale' => 'Căn hộ cao cấp, Studio, Duplex',
                'status' => 'completed',
                'sales_status' => 'handover',
                'handover_year' => 2023,
                'handover_time' => 'Q3/2023',
                'legal_status' => 'Sổ hồng lâu dài',
                'ownership_type' => 'Lâu dài',
                'is_featured' => false,
                'is_published' => true,
                'published_at' => now(),
                'thumbnail' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop',
                'banner_image' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop',
                'gallery' => [
                    'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop'
                ],
                'highlight_points' => [
                    'Tầm nhìn panorama hướng biển hồ nước mặn',
                    'Bể bơi bốn mùa trên tầng thượng mỗi tòa căn hộ',
                    'Hồ cảnh quan và khu ngắm cảnh thư giãn phong cách resort',
                ],
                'nearby_places' => [
                    '1 phút đến đại học quốc tế VinUni',
                    '2 phút đến trung tâm thương mại Vincom Mega Mall',
                    '3 phút đến biển hồ nước mặn nhân tạo',
                ],
                'payment_policy' => 'Thanh toán giãn linh hoạt hoặc gói tài chính vay hỗ trợ lãi suất.',
                'sales_policy' => 'Chiết khấu đặc biệt cho khách hàng miền Bắc sở hữu căn hộ Masterise.',
                'booking_policy' => 'Số lượng căn hộ VIP giới hạn từ giỏ hàng chủ đầu tư.',
                'virtual_tour_url' => null,
                'amenities' => ['Trees', 'Waves', 'Dumbbell', 'ShieldCheck'],
            ]
        );
        if ($catApartment) {
            $p5->categories()->sync([$catApartment->id]);
        }
        $p5->seoMeta()->updateOrCreate(
            ['seoable_id' => $p5->id, 'seoable_type' => get_class($p5)],
            [
                'title' => 'Masteri Waterfront | Căn Hộ Cao Cấp Ocean Park Hà Nội',
                'description' => 'Khám phá Masteri Waterfront Ocean Park Hà Nội. Căn hộ mặt tiền hồ cao cấp hàng đầu từ Masterise Homes.',
                'keywords' => 'masteri waterfront, ocean park ha noi, bat dong san gia lam',
            ]
        );
        $catMasteriseColletion = ProjectCategory::where('slug', 'masterise-colletion')->first();
        $catLumiere = ProjectCategory::where('slug', 'lumiere-series')->first();

        $requiredProjects = [
            [
                'category' => $catMasteriseColletion,
                'slug' => 'masterise-grand-view',
                'name' => 'Masterise Grand View',
                'description' => 'Can ho cao cap voi tam nhin rong mo, tien ich dong bo va khong gian song hien dai.',
                'location' => 'Thanh pho Thu Duc, TP. Ho Chi Minh',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Tu 6,8 ty/can',
                'sales_status' => 'coming_soon',
                'is_hot' => false,
                'open_sale_at' => now()->addMonths(2),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category' => $catMasteriseColletion,
                'slug' => 'masterise-central-point',
                'name' => 'Masterise Central Point',
                'description' => 'Du an can ho cao cap nam tai truc ket noi trung tam, thiet ke cho cu dan thanh dat.',
                'location' => 'Trung tam TP. Ho Chi Minh',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Tu 7,2 ty/can',
                'sales_status' => 'selling',
                'is_hot' => false,
                'open_sale_at' => now()->subDays(10),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category' => $catMasteriseColletion,
                'slug' => 'masterise-riverside',
                'name' => 'Masterise Riverside',
                'description' => 'Khong gian song ven song cao cap voi he tien ich nghi duong va gia tri khai thac dai han.',
                'location' => 'Ven song Sai Gon, TP. Ho Chi Minh',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Tu 8,5 ty/can',
                'sales_status' => 'selling',
                'is_hot' => true,
                'open_sale_at' => now()->subMonth(),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category' => $catLumiere,
                'slug' => 'lumiere-boulevard',
                'name' => 'Lumiere Boulevard',
                'description' => 'Dong can ho hang sang thuoc Lumiere Series voi kien truc xanh va phong cach song tinh te.',
                'location' => 'Vinhomes Grand Park, TP. Thu Duc',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Tu 5,5 ty/can',
                'sales_status' => 'selling',
                'is_hot' => false,
                'open_sale_at' => now()->subDays(20),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category' => $catLumiere,
                'slug' => 'lumiere-riverside',
                'name' => 'Lumiere Riverside',
                'description' => 'Can ho hang sang ven song voi cong dong cu dan rieng tu va dich vu quan ly cao cap.',
                'location' => 'Thao Dien, TP. Thu Duc',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Tu 7,9 ty/can',
                'sales_status' => 'selling',
                'is_hot' => true,
                'open_sale_at' => now()->subDays(5),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop',
            ],
            [
                'category' => $catLumiere,
                'slug' => 'lumiere-midtown',
                'name' => 'Lumiere Midtown',
                'description' => 'San pham hang sang sap mo ban danh cho khach hang uu tien va nha dau tu dai han.',
                'location' => 'Khu do thi moi, TP. Ho Chi Minh',
                'region' => 'TP. Ho Chi Minh',
                'price_text' => 'Dang cap nhat',
                'sales_status' => 'coming_soon',
                'is_hot' => false,
                'open_sale_at' => now()->addMonths(1),
                'is_featured' => true,
                'thumbnail' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop',
            ],
        ];

        foreach ($requiredProjects as $index => $item) {
            $category = $item['category'];
            unset($item['category']);

            $project = Project::updateOrCreate(
                ['slug' => $item['slug']],
                array_merge($item, [
                    'content' => $item['description'] . ' Du an duoc phat trien theo dinh huong bat dong san cao cap, toi uu trai nghiem song, gia tri so huu va tiem nang dau tu.',
                    'status' => $item['sales_status'] === 'coming_soon' ? 'upcoming' : 'selling',
                    'developer' => 'Masterise Homes',
                    'scale' => 'Can ho cao cap',
                    'area_text' => '55 - 120 m2',
                    'area_size' => 'Dang cap nhat',
                    'banner_image' => $item['thumbnail'],
                    'gallery' => [$item['thumbnail']],
                    'highlight_points' => [
                        'Vi tri ket noi thuan tien',
                        'Tien ich noi khu dong bo',
                        'Thiet ke hien dai va rieng tu',
                        'Gia tri khai thac dai han',
                    ],
                    'nearby_places' => [
                        '5 phut den trung tam thuong mai',
                        '10 phut den khu van phong trung tam',
                        '15 phut den cac truc giao thong chinh',
                    ],
                    'payment_policy' => 'Thanh toan linh hoat theo tien do, ho tro vay ngan hang theo chinh sach tung giai doan.',
                    'sales_policy' => 'Chinh sach ban hang va uu dai duoc cap nhat theo dot mo ban.',
                    'booking_policy' => 'Dang ky tu van de nhan thong tin gio hang va lich mo ban moi nhat.',
                    'is_published' => true,
                    'published_at' => now(),
                    'sort_order' => $index + 1,
                    'amenities' => ['Trees', 'Waves', 'Dumbbell', 'ShieldCheck'],
                ])
            );

            if ($category) {
                $project->categories()->syncWithoutDetaching([$category->id]);
            }

            $project->seoMeta()->updateOrCreate(
                ['seoable_id' => $project->id, 'seoable_type' => get_class($project)],
                [
                    'title' => $project->name . ' | Masterise Homes',
                    'description' => $project->description,
                    'keywords' => $project->name . ', Masterise Homes, Masterise Collection, Lumiere Series, can ho cao cap',
                ]
            );
        }
    }
}
