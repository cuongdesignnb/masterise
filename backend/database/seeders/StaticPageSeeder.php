<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class StaticPageSeeder extends Seeder
{
    /**
     * Seed default public static pages without deleting existing content.
     */
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'chinh-sach-bao-mat',
                'title' => 'Chính sách bảo mật',
                'content' => '<p>Nội dung chính sách bảo mật đang được cập nhật.</p>',
                'seo_title' => 'Chính sách bảo mật | Masterise Homes',
                'seo_description' => 'Chính sách bảo mật thông tin khách hàng của Masterise Homes.',
            ],
            [
                'slug' => 'dieu-khoan-su-dung',
                'title' => 'Điều khoản sử dụng',
                'content' => '<p>Nội dung điều khoản sử dụng đang được cập nhật.</p>',
                'seo_title' => 'Điều khoản sử dụng | Masterise Homes',
                'seo_description' => 'Điều khoản sử dụng website và dịch vụ của Masterise Homes.',
            ],
        ];

        foreach ($pages as $item) {
            $page = Page::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'title' => $item['title'],
                    'content' => $item['content'],
                    'status' => 'published',
                    'created_by' => null,
                ]
            );

            $page->seoMeta()->updateOrCreate(
                ['seoable_id' => $page->id, 'seoable_type' => Page::class],
                [
                    'title' => $item['seo_title'],
                    'description' => $item['seo_description'],
                    'keywords' => null,
                    'path' => '/chuyen-trang/' . $page->slug,
                ]
            );
        }
    }
}
