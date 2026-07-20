<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class ContactPageContent
{
    public const SECTION_KEYS = [
        'hero', 'commitments', 'introduction', 'salesTeam', 'achievements',
        'contactForm', 'departments', 'faqs', 'cta',
    ];

    public const ICONS = [
        'PhoneCall', 'Users', 'BadgeCheck', 'ShieldCheck', 'HeartHandshake',
        'Sparkles', 'Building2', 'Headphones', 'Megaphone', 'Mail', 'MapPin',
        'Clock3', 'BriefcaseBusiness', 'Award', 'Gem', 'Handshake', 'CheckCircle2',
        'MessageCircle', 'Globe2', 'TrendingUp', 'CalendarCheck',
    ];

    public static function default(): array
    {
        return [
            'sectionOrder' => self::SECTION_KEYS,
            'seo' => [
                'title' => 'Liên hệ Masterise Homes | Tư vấn bất động sản cao cấp',
                'description' => 'Kết nối cùng đội ngũ tư vấn để nhận thông tin dự án, bảng giá và lịch tham quan phù hợp.',
                'keywords' => 'liên hệ Masterise Homes, tư vấn bất động sản cao cấp',
                'ogTitle' => 'Liên hệ Masterise Homes',
                'ogDescription' => 'Nhận tư vấn chuyên sâu về các dự án bất động sản cao cấp.',
                'ogImage' => '',
            ],
            'hero' => [
                'enabled' => true,
                'sortOrder' => 10,
                'eyebrow' => 'KẾT NỐI CÙNG CHÚNG TÔI',
                'title' => 'Một cuộc trò chuyện đúng lúc có thể mở ra lựa chọn xứng tầm',
                'description' => 'Đội ngũ tư vấn sẵn sàng lắng nghe nhu cầu, chia sẻ thông tin minh bạch và đồng hành cùng Quý khách trong từng quyết định.',
                'image' => 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1600&auto=format&fit=crop',
                'imageAlt' => 'Không gian tư vấn bất động sản cao cấp',
                'primaryCta' => ['label' => 'Nhận tư vấn ngay', 'url' => '#global-contact-form'],
                'secondaryCta' => ['label' => 'Khám phá dự án', 'url' => '/du-an'],
                'hotlineLine' => 'Hotline tư vấn trực tiếp',
                'responseLine' => 'Phản hồi trong giờ làm việc',
                'quickInfo' => [
                    ['id' => 'hero-consulting', 'label' => 'Tư vấn', 'value' => 'Theo đúng nhu cầu', 'icon' => 'HeartHandshake', 'isActive' => true, 'sortOrder' => 10],
                    ['id' => 'hero-information', 'label' => 'Thông tin', 'value' => 'Minh bạch & cập nhật', 'icon' => 'ShieldCheck', 'isActive' => true, 'sortOrder' => 20],
                ],
            ],
            'commitments' => [
                'enabled' => true,
                'sortOrder' => 20,
                'label' => 'CAM KẾT DỊCH VỤ',
                'title' => 'Sự an tâm bắt đầu từ thông tin đáng tin cậy',
                'description' => 'Những nguyên tắc xuyên suốt trong quá trình tư vấn và đồng hành cùng khách hàng.',
                'items' => [
                    ['id' => 'commitment-transparent', 'title' => 'Thông tin minh bạch', 'description' => 'Thông tin dự án được đối chiếu và trình bày rõ ràng.', 'icon' => 'ShieldCheck', 'isActive' => true, 'sortOrder' => 10],
                    ['id' => 'commitment-needs', 'title' => 'Tư vấn đúng nhu cầu', 'description' => 'Giải pháp được chọn lọc dựa trên mục tiêu và ưu tiên thực tế.', 'icon' => 'HeartHandshake', 'isActive' => true, 'sortOrder' => 20],
                    ['id' => 'commitment-policy', 'title' => 'Chính sách cập nhật', 'description' => 'Bảng giá và chính sách bán hàng được cập nhật theo từng thời điểm.', 'icon' => 'BadgeCheck', 'isActive' => true, 'sortOrder' => 30],
                    ['id' => 'commitment-journey', 'title' => 'Đồng hành dài hạn', 'description' => 'Hỗ trợ trước, trong và sau quá trình giao dịch.', 'icon' => 'Handshake', 'isActive' => true, 'sortOrder' => 40],
                ],
            ],
            'introduction' => [
                'enabled' => true,
                'sortOrder' => 30,
                'label' => 'ĐỘI NGŨ TƯ VẤN',
                'title' => 'Hiểu sản phẩm, thấu nhu cầu, đặt lợi ích dài hạn lên trước',
                'paragraphs' => [
                    'Chúng tôi tập trung vào trải nghiệm tư vấn rõ ràng, chuyên sâu và phù hợp với từng nhu cầu an cư hoặc đầu tư.',
                    'Mỗi lựa chọn được phân tích trên nền tảng thông tin sản phẩm, thị trường và mục tiêu dài hạn của khách hàng.',
                ],
                'images' => [
                    ['id' => 'introduction-main', 'url' => 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1400&auto=format&fit=crop', 'alt' => 'Đội ngũ tư vấn trao đổi cùng khách hàng', 'isActive' => true, 'sortOrder' => 10],
                ],
                'bullets' => [
                    ['id' => 'intro-experience', 'text' => 'Kinh nghiệm tư vấn bất động sản cao cấp', 'isActive' => true, 'sortOrder' => 10],
                    ['id' => 'intro-market', 'text' => 'Hiểu rõ sản phẩm và diễn biến thị trường', 'isActive' => true, 'sortOrder' => 20],
                    ['id' => 'intro-process', 'text' => 'Hỗ trợ từ lựa chọn đến thủ tục', 'isActive' => true, 'sortOrder' => 30],
                    ['id' => 'intro-benefit', 'text' => 'Ưu tiên lợi ích dài hạn của khách hàng', 'isActive' => true, 'sortOrder' => 40],
                ],
                'cta' => ['label' => 'Trao đổi cùng chuyên viên', 'url' => '#global-contact-form'],
            ],
            'salesTeam' => [
                'enabled' => true,
                'sortOrder' => 40,
                'label' => 'CHUYÊN VIÊN TƯ VẤN',
                'title' => 'Đội ngũ Sale đồng hành cùng Quý khách',
                'description' => 'Lựa chọn chuyên viên phù hợp với khu vực hoặc dự án Quý khách quan tâm.',
                'items' => [],
            ],
            'achievements' => [
                'enabled' => true,
                'sortOrder' => 50,
                'label' => 'NĂNG LỰC & DẤU ẤN',
                'title' => 'Uy tín được xây dựng bằng trải nghiệm thực tế',
                'description' => 'Những dấu ấn nổi bật trên hành trình kiến tạo giá trị bền vững.',
                'metricsEnabled' => true,
                'milestonesEnabled' => true,
                'metrics' => [],
                'milestones' => [],
            ],
            'contactForm' => [
                'enabled' => true,
                'sortOrder' => 60,
                'label' => 'TƯ VẤN CÁ NHÂN HÓA',
                'title' => 'Bắt đầu cuộc trò chuyện cùng chúng tôi',
                'description' => 'Để lại thông tin, đội ngũ tư vấn sẽ liên hệ và hỗ trợ Quý khách lựa chọn dự án phù hợp.',
                'officeTitle' => 'Không gian kết nối & tư vấn',
                'hotline' => '',
                'email' => '',
                'address' => '',
                'workingHours' => 'Thứ Hai – Chủ Nhật, 08:30 – 18:00',
                'mapUrl' => '',
                'mapEmbedUrl' => '',
                'mapImage' => '',
                'mapImageAlt' => 'Bản đồ văn phòng',
                'directionsLabel' => 'Xem chỉ đường',
                'directionsUrl' => '',
            ],
            'departments' => [
                'enabled' => true,
                'sortOrder' => 70,
                'label' => 'HỖ TRỢ ĐÚNG NHU CẦU',
                'title' => 'Kết nối trực tiếp với bộ phận phụ trách',
                'description' => 'Chọn đúng đầu mối để nhận hỗ trợ nhanh chóng và chính xác.',
                'items' => [],
            ],
            'faqs' => [
                'enabled' => true,
                'sortOrder' => 80,
                'label' => 'THÔNG TIN HỮU ÍCH',
                'title' => 'Câu hỏi thường gặp',
                'description' => 'Một số thông tin giúp Quý khách thuận tiện hơn trước khi kết nối.',
                'items' => [
                    ['id' => 'faq-price', 'question' => 'Làm sao để nhận bảng giá mới nhất?', 'answer' => 'Quý khách có thể để lại thông tin trong form hoặc gọi hotline để được gửi bảng giá và chính sách theo từng dự án.', 'isActive' => true, 'sortOrder' => 10],
                    ['id' => 'faq-visit', 'question' => 'Tôi muốn đặt lịch tham quan dự án?', 'answer' => 'Đội ngũ tư vấn sẽ xác nhận dự án, thời gian và hướng dẫn tham quan phù hợp sau khi nhận thông tin đăng ký.', 'isActive' => true, 'sortOrder' => 20],
                    ['id' => 'faq-support', 'question' => 'Sau giao dịch có được tiếp tục hỗ trợ?', 'answer' => 'Bộ phận phụ trách sẽ tiếp tục đồng hành và hỗ trợ các thông tin liên quan trong phạm vi dịch vụ.', 'isActive' => true, 'sortOrder' => 30],
                ],
            ],
            'cta' => [
                'enabled' => true,
                'sortOrder' => 90,
                'label' => 'SẴN SÀNG ĐỒNG HÀNH',
                'title' => 'Tìm một lựa chọn phù hợp bắt đầu từ cuộc trao đổi chân thành',
                'description' => 'Kết nối cùng đội ngũ tư vấn để nhận thông tin phù hợp với nhu cầu và kế hoạch của Quý khách.',
                'image' => 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop',
                'imageAlt' => 'Không gian sống cao cấp',
                'primaryCta' => ['label' => 'Nhận tư vấn ngay', 'url' => '#global-contact-form'],
                'secondaryCta' => ['label' => 'Khám phá dự án', 'url' => '/du-an'],
            ],
        ];
    }

    public static function ensureSetting(): bool
    {
        if (Setting::query()->where('key', 'contact_page_content')->exists()) {
            return false;
        }

        $legacy = Setting::get('contact_departments', []);
        Setting::set('contact_page_content', self::normalize([], is_array($legacy) ? $legacy : []), 'json');

        return true;
    }

    public static function validateAndNormalize(mixed $value): array
    {
        if (!is_array($value)) {
            throw ValidationException::withMessages(['contact_page_content' => ['Nội dung trang liên hệ phải là một object JSON.']]);
        }

        $normalized = self::normalize($value);
        $urlRule = function (string $attribute, mixed $url, \Closure $fail): void {
            if ($url === null || $url === '') return;
            if (!self::isSafeUrl((string) $url)) $fail("{$attribute} phải là URL http(s), đường dẫn nội bộ hoặc liên kết neo hợp lệ.");
        };
        $mapEmbedRule = function (string $attribute, mixed $url, \Closure $fail): void {
            if ($url === null || $url === '') return;
            if (!self::isSafeUrl((string) $url)) {
                $fail("{$attribute} phải là URL hợp lệ.");
                return;
            }
            $host = strtolower((string) parse_url((string) $url, PHP_URL_HOST));
            $path = strtolower((string) parse_url((string) $url, PHP_URL_PATH));
            if (!str_contains($host, 'google.') || !str_contains($path, '/maps')) {
                $fail("{$attribute} phải là URL Google Maps hợp lệ.");
            }
        };

        $rules = [
            'sectionOrder' => ['required', 'array', 'size:9'],
            'sectionOrder.*' => ['required', Rule::in(self::SECTION_KEYS), 'distinct'],
            'seo' => ['required', 'array'],
            'seo.title' => ['nullable', 'string', 'max:180'],
            'seo.description' => ['nullable', 'string', 'max:500'],
            'seo.keywords' => ['nullable', 'string', 'max:500'],
            'seo.ogTitle' => ['nullable', 'string', 'max:180'],
            'seo.ogDescription' => ['nullable', 'string', 'max:500'],
            'seo.ogImage' => ['nullable', 'string', 'max:2048', $urlRule],
        ];

        foreach (self::SECTION_KEYS as $section) {
            $rules[$section] = ['required', 'array'];
            $rules["{$section}.enabled"] = ['required', 'boolean'];
            $rules["{$section}.sortOrder"] = ['required', 'integer', 'min:0', 'max:10000'];
        }

        foreach (['hero.quickInfo', 'commitments.items', 'introduction.images', 'introduction.bullets', 'salesTeam.items', 'achievements.metrics', 'achievements.milestones', 'departments.items', 'faqs.items'] as $path) {
            $rules[$path] = ['present', 'array', 'max:50'];
            $rules["{$path}.*.id"] = ['required', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/', 'distinct'];
            $rules["{$path}.*.isActive"] = ['required', 'boolean'];
            $rules["{$path}.*.sortOrder"] = ['required', 'integer', 'min:0', 'max:10000'];
        }

        foreach (['hero.quickInfo', 'commitments.items', 'achievements.metrics', 'departments.items'] as $path) {
            $rules["{$path}.*.icon"] = ['required', Rule::in(self::ICONS)];
        }

        $textRules = [
            'hero.eyebrow', 'hero.title', 'hero.description', 'hero.imageAlt', 'hero.hotlineLine', 'hero.responseLine',
            'commitments.label', 'commitments.title', 'commitments.description',
            'introduction.label', 'introduction.title', 'salesTeam.label', 'salesTeam.title', 'salesTeam.description',
            'achievements.label', 'achievements.title', 'achievements.description',
            'contactForm.label', 'contactForm.title', 'contactForm.description', 'contactForm.officeTitle', 'contactForm.address', 'contactForm.workingHours', 'contactForm.mapImageAlt', 'contactForm.directionsLabel',
            'departments.label', 'departments.title', 'departments.description',
            'faqs.label', 'faqs.title', 'faqs.description', 'cta.label', 'cta.title', 'cta.description', 'cta.imageAlt',
        ];
        foreach ($textRules as $path) $rules[$path] = ['nullable', 'string', 'max:2000'];

        foreach (['hero.image', 'hero.primaryCta.url', 'hero.secondaryCta.url', 'introduction.cta.url', 'contactForm.mapUrl', 'contactForm.mapImage', 'contactForm.directionsUrl', 'cta.image', 'cta.primaryCta.url', 'cta.secondaryCta.url'] as $path) {
            $rules[$path] = ['nullable', 'string', 'max:2048', $urlRule];
        }

        $rules += [
            'contactForm.email' => ['nullable', 'email:rfc', 'max:255'],
            'contactForm.hotline' => ['nullable', 'string', 'max:100'],
            'contactForm.mapEmbedUrl' => ['nullable', 'string', 'max:2048', $mapEmbedRule],
            'hero.primaryCta.label' => ['nullable', 'string', 'max:100'],
            'hero.secondaryCta.label' => ['nullable', 'string', 'max:100'],
            'introduction.cta.label' => ['nullable', 'string', 'max:100'],
            'cta.primaryCta.label' => ['nullable', 'string', 'max:100'],
            'cta.secondaryCta.label' => ['nullable', 'string', 'max:100'],
            'hero.quickInfo.*.label' => ['required', 'string', 'max:150'],
            'hero.quickInfo.*.value' => ['required', 'string', 'max:255'],
            'commitments.items.*.title' => ['required', 'string', 'max:255'],
            'commitments.items.*.description' => ['nullable', 'string', 'max:1000'],
            'introduction.paragraphs' => ['present', 'array', 'max:12'],
            'introduction.paragraphs.*' => ['required', 'string', 'max:3000'],
            'introduction.images.*.url' => ['required', 'string', 'max:2048', $urlRule],
            'introduction.images.*.alt' => ['nullable', 'string', 'max:255'],
            'introduction.bullets.*.text' => ['required', 'string', 'max:500'],
            'salesTeam.items.*.name' => ['required', 'string', 'max:255'],
            'salesTeam.items.*.title' => ['nullable', 'string', 'max:255'],
            'salesTeam.items.*.avatar' => ['nullable', 'string', 'max:2048', $urlRule],
            'salesTeam.items.*.avatarAlt' => ['nullable', 'string', 'max:255'],
            'salesTeam.items.*.description' => ['nullable', 'string', 'max:1000'],
            'salesTeam.items.*.responsibility' => ['nullable', 'string', 'max:255'],
            'salesTeam.items.*.phone' => ['nullable', 'string', 'max:100'],
            'salesTeam.items.*.email' => ['nullable', 'email:rfc', 'max:255'],
            'salesTeam.items.*.zaloUrl' => ['nullable', 'string', 'max:2048', $urlRule],
            'salesTeam.items.*.facebookUrl' => ['nullable', 'string', 'max:2048', $urlRule],
            'salesTeam.items.*.tags' => ['required', 'array', 'max:20'],
            'salesTeam.items.*.tags.*' => ['string', 'max:100'],
            'achievements.metrics.*.value' => ['required', 'string', 'max:100'],
            'achievements.metrics.*.suffix' => ['nullable', 'string', 'max:50'],
            'achievements.metrics.*.label' => ['required', 'string', 'max:255'],
            'achievements.metrics.*.description' => ['nullable', 'string', 'max:1000'],
            'achievements.milestones.*.year' => ['nullable', 'string', 'max:50'],
            'achievements.milestones.*.title' => ['required', 'string', 'max:255'],
            'achievements.milestones.*.description' => ['nullable', 'string', 'max:1500'],
            'achievements.milestones.*.image' => ['nullable', 'string', 'max:2048', $urlRule],
            'achievements.milestones.*.imageAlt' => ['nullable', 'string', 'max:255'],
            'achievements.milestones.*.referenceUrl' => ['nullable', 'string', 'max:2048', $urlRule],
            'departments.items.*.name' => ['required', 'string', 'max:255'],
            'departments.items.*.description' => ['nullable', 'string', 'max:1000'],
            'departments.items.*.phone' => ['nullable', 'string', 'max:100'],
            'departments.items.*.email' => ['nullable', 'email:rfc', 'max:255'],
            'departments.items.*.workingHours' => ['nullable', 'string', 'max:255'],
            'faqs.items.*.question' => ['required', 'string', 'max:500'],
            'faqs.items.*.answer' => ['required', 'string', 'max:3000'],
        ];

        $validator = Validator::make($normalized, $rules);
        $validator->after(function ($validator) use ($normalized): void {
            self::walkStrings($normalized, function (string $path, string $text) use ($validator): void {
                if (preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $text) || preg_match('/javascript\s*:/i', $text)) {
                    $validator->errors()->add($path, 'Không chấp nhận HTML, script hoặc giao thức không an toàn.');
                }
            });
        });
        $validator->validate();

        return $normalized;
    }

    public static function normalize(array $value, array $legacyDepartments = []): array
    {
        $default = self::default();
        $result = $default;
        $result['seo'] = self::normalizeRecord($value['seo'] ?? null, $default['seo']);

        $order = array_values(array_unique(array_filter($value['sectionOrder'] ?? [], fn ($key) => in_array($key, self::SECTION_KEYS, true))));
        $result['sectionOrder'] = count($order) === count(self::SECTION_KEYS)
            ? $order
            : self::SECTION_KEYS;

        foreach (self::SECTION_KEYS as $section) {
            $result[$section] = self::normalizeRecord($value[$section] ?? null, $default[$section]);
        }

        if (trim((string) $result['achievements']['description']) === 'Các số liệu và dấu mốc chỉ hiển thị sau khi được quản trị viên xác nhận.') {
            $result['achievements']['description'] = $default['achievements']['description'];
        }

        $listSchemas = [
            'hero.quickInfo' => ['quick-info', 'label', [
                'id' => '', 'label' => '', 'value' => '', 'icon' => 'HeartHandshake',
                'isActive' => true, 'sortOrder' => 0,
            ]],
            'commitments.items' => ['commitment', 'title', [
                'id' => '', 'title' => '', 'description' => '', 'icon' => 'ShieldCheck',
                'isActive' => true, 'sortOrder' => 0,
            ]],
            'introduction.images' => ['contact-image', 'url', [
                'id' => '', 'url' => '', 'alt' => '', 'isActive' => true, 'sortOrder' => 0,
            ]],
            'introduction.bullets' => ['contact-bullet', 'text', [
                'id' => '', 'text' => '', 'isActive' => true, 'sortOrder' => 0,
            ]],
            'salesTeam.items' => ['sales-member', 'name', [
                'id' => '', 'name' => '', 'title' => '', 'avatar' => '', 'avatarAlt' => '',
                'description' => '', 'responsibility' => '', 'phone' => '', 'email' => '',
                'zaloUrl' => '', 'facebookUrl' => '', 'tags' => [],
                'isActive' => true, 'sortOrder' => 0,
            ]],
            'achievements.metrics' => ['achievement', 'label', [
                'id' => '', 'value' => '', 'suffix' => '', 'label' => '', 'description' => '',
                'icon' => 'Award', 'isActive' => true, 'sortOrder' => 0,
            ]],
            'achievements.milestones' => ['milestone', 'title', [
                'id' => '', 'year' => '', 'title' => '', 'description' => '', 'image' => '',
                'imageAlt' => '', 'referenceUrl' => '', 'isActive' => true, 'sortOrder' => 0,
            ]],
            'departments.items' => ['department', 'name', [
                'id' => '', 'name' => '', 'description' => '', 'phone' => '', 'email' => '',
                'workingHours' => '', 'icon' => 'Headphones', 'isActive' => true, 'sortOrder' => 0,
            ]],
            'faqs.items' => ['faq', 'question', [
                'id' => '', 'question' => '', 'answer' => '', 'isActive' => true, 'sortOrder' => 0,
            ]],
        ];
        foreach ($listSchemas as $path => [$prefix, $primaryField, $schema]) {
            $incoming = Arr::get($value, $path);
            $items = $incoming === null && Arr::has($value, $path)
                ? []
                : ($incoming === null ? Arr::get($default, $path, []) : $incoming);
            Arr::set($result, $path, self::normalizeItems($items, $schema, $prefix, $primaryField));
        }

        $paragraphs = Arr::has($value, 'introduction.paragraphs')
            ? Arr::get($value, 'introduction.paragraphs')
            : $default['introduction']['paragraphs'];
        $result['introduction']['paragraphs'] = is_array($paragraphs)
            ? collect($paragraphs)->filter(fn ($text) => is_string($text))->map(fn ($text) => trim($text))->filter()->values()->all()
            : [];

        if (!$value && $legacyDepartments) {
            $result['departments']['items'] = collect($legacyDepartments)->values()->map(function ($item, $index) {
                $name = trim((string) ($item['name'] ?? $item['title'] ?? ''));
                return [
                    'id' => 'legacy-department-'.($index + 1).'-'.(Str::slug($name) ?: 'item'),
                    'name' => $name,
                    'description' => trim((string) ($item['description'] ?? '')),
                    'phone' => trim((string) ($item['phone'] ?? '')),
                    'email' => trim((string) ($item['email'] ?? '')),
                    'workingHours' => trim((string) ($item['time'] ?? $item['workingHours'] ?? '')),
                    'icon' => in_array($item['icon'] ?? '', self::ICONS, true) ? $item['icon'] : 'Headphones',
                    'isActive' => true,
                    'sortOrder' => ($index + 1) * 10,
                ];
            })->filter(fn ($item) => $item['name'] !== '')->values()->all();
        }

        return $result;
    }

    private static function normalizeRecord(mixed $value, array $defaults): array
    {
        $source = is_array($value) && !array_is_list($value) ? $value : [];
        $result = [];

        foreach ($defaults as $key => $fallback) {
            if (!array_key_exists($key, $source)) {
                $result[$key] = $fallback;
                continue;
            }

            $incoming = $source[$key];
            if (is_string($fallback)) {
                $result[$key] = is_string($incoming) ? $incoming : ($incoming === null ? '' : $fallback);
            } elseif (is_bool($fallback)) {
                $result[$key] = self::normalizeBoolean($incoming, $fallback);
            } elseif (is_int($fallback) || is_float($fallback)) {
                $result[$key] = self::normalizeNumber($incoming, $fallback);
            } elseif (is_array($fallback) && !array_is_list($fallback)) {
                $result[$key] = self::normalizeRecord($incoming, $fallback);
            } elseif (is_array($fallback)) {
                $result[$key] = is_array($incoming) ? array_values($incoming) : [];
            } else {
                $result[$key] = $fallback;
            }
        }

        return $result;
    }

    private static function normalizeItems(mixed $value, array $schema, string $prefix, string $primaryField): array
    {
        if (!is_array($value)) return [];

        return collect(array_values($value))
            ->filter(fn ($item) => is_array($item) && !array_is_list($item))
            ->map(function (array $item, int $index) use ($schema, $prefix): array {
                $normalized = self::normalizeRecord($item, $schema);
                if ($normalized['id'] === '') $normalized['id'] = $prefix.'-'.($index + 1);
                if (($normalized['sortOrder'] ?? 0) === 0) $normalized['sortOrder'] = ($index + 1) * 10;
                if (array_key_exists('tags', $normalized)) {
                    $normalized['tags'] = is_array($item['tags'] ?? null)
                        ? array_values(array_filter($item['tags'], fn ($tag) => is_string($tag)))
                        : [];
                }
                return $normalized;
            })
            ->filter(fn ($item) => trim($item[$primaryField]) !== '')
            ->values()
            ->all();
    }

    private static function normalizeBoolean(mixed $value, bool $fallback): bool
    {
        if ($value === true || $value === 1 || $value === '1') return true;
        if ($value === false || $value === 0 || $value === '0') return false;
        return $fallback;
    }

    private static function normalizeNumber(mixed $value, int|float $fallback): int|float
    {
        if (!is_numeric($value)) return $fallback;
        $number = $value + 0;
        return is_finite((float) $number) ? $number : $fallback;
    }

    private static function isSafeUrl(string $url): bool
    {
        $url = trim($url);
        if ($url === '') return true;
        if (str_starts_with($url, '/') && !str_starts_with($url, '//')) return true;
        if (str_starts_with($url, '#')) return (bool) preg_match('/^#[A-Za-z][A-Za-z0-9_-]*$/', $url);
        return filter_var($url, FILTER_VALIDATE_URL) !== false && in_array(parse_url($url, PHP_URL_SCHEME), ['http', 'https'], true);
    }

    private static function walkStrings(mixed $value, callable $callback, string $path = 'contact_page_content'): void
    {
        if (is_string($value)) {
            $callback($path, $value);
            return;
        }
        if (!is_array($value)) return;
        foreach ($value as $key => $child) self::walkStrings($child, $callback, $path.'.'.$key);
    }
}
