<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HeroBanner;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\Partner;

class HomepageContentSeeder extends Seeder
{
    /**
     * Seed the homepage content tables with data from seed.ts.
     */
    public function run(): void
    {
        // Hero Banners (from heroSlides in seed.ts)
        $heroBanners = [
            [
                'title_lines' => ['NÂNG TẦM', 'PHONG CÁCH SỐNG'],
                'highlight' => 'KIẾN TẠO GIÁ TRỊ BỀN VỮNG',
                'description' => 'Masterise Homes mang đến những bất động sản hàng hiệu với tầm nhìn quốc tế, kiến tạo cộng đồng thịnh vượng và phong cách sống xứng tầm.',
                'image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title_lines' => ['DẤU ẤN', 'BẤT ĐỘNG SẢN HÀNG HIỆU'],
                'highlight' => 'CHUẨN SỐNG QUỐC TẾ',
                'description' => 'Mỗi dự án là một biểu tượng kiến trúc, kết nối vị trí chiến lược, tiện ích toàn diện và giá trị đầu tư dài hạn.',
                'image' => 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1400&auto=format&fit=crop',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title_lines' => ['KHÔNG GIAN', 'SỐNG THỊNH VƯỢNG'],
                'highlight' => 'DÀNH CHO CỘNG ĐỒNG TINH HOA',
                'description' => 'Trải nghiệm hệ sinh thái sống đẳng cấp, dịch vụ quản lý chuyên nghiệp và cộng đồng cư dân văn minh.',
                'image' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($heroBanners as $banner) {
            HeroBanner::updateOrCreate(
                ['highlight' => $banner['highlight']],
                $banner
            );
        }

        // FAQs (from faqs in seed.ts)
        $faqs = [
            [
                'question' => 'Quy trình mua nhà tại Masterise Homes như thế nào?',
                'answer' => 'Khách hàng lựa chọn dự án phù hợp, đăng ký tư vấn, tham quan nhà mẫu, nhận bảng giá, đặt cọc và ký kết hợp đồng theo quy trình minh bạch.',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'question' => 'Các phương thức thanh toán khi mua nhà?',
                'answer' => 'Khách hàng có thể thanh toán theo tiến độ chuẩn, thanh toán sớm hoặc sử dụng gói hỗ trợ tài chính từ ngân hàng đối tác.',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'question' => 'Chính sách hỗ trợ vay ngân hàng có những ưu đãi gì?',
                'answer' => 'Các dự án có thể áp dụng chính sách hỗ trợ lãi suất, ân hạn nợ gốc và tư vấn hồ sơ vay tùy từng thời điểm mở bán.',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'question' => 'Thời gian bàn giao và bảo hành sản phẩm?',
                'answer' => 'Thời gian bàn giao tùy từng dự án. Chính sách bảo hành và bảo trì được công bố rõ trong hợp đồng mua bán.',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                $faq
            );
        }

        // Testimonials (from testimonials in seed.ts)
        $testimonials = [
            [
                'name' => 'Nguyễn Thanh Hưng',
                'role' => 'Nhà đầu tư',
                'content' => 'Tôi đánh giá cao tầm nhìn và uy tín của Masterise Homes. Dự án luôn có vị trí đẹp, chất lượng vượt trội và tiềm năng tăng giá cao.',
                'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
                'rating' => 5,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Trần Minh Anh',
                'role' => 'Khách hàng',
                'content' => 'Không gian sống tại Masterise luôn mang đến trải nghiệm khác biệt, tiện ích đẳng cấp và cộng đồng văn minh.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
                'rating' => 5,
                'sort_order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(
                ['name' => $testimonial['name']],
                $testimonial
            );
        }

        // Partners (from partners in seed.ts)
        $partners = [
            ['name' => 'AECOM', 'sort_order' => 1, 'is_active' => true],
            ['name' => 'HBA', 'sort_order' => 2, 'is_active' => true],
            ['name' => 'ARUP', 'sort_order' => 3, 'is_active' => true],
            ['name' => 'SAVILLS', 'sort_order' => 4, 'is_active' => true],
            ['name' => 'CBRE', 'sort_order' => 5, 'is_active' => true],
            ['name' => 'JLL', 'sort_order' => 6, 'is_active' => true],
        ];

        foreach ($partners as $partner) {
            Partner::updateOrCreate(
                ['name' => $partner['name']],
                $partner
            );
        }
    }
}
