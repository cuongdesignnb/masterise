<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostContentSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'admin@masterise.local')->first() ?? User::first();

        if (!$author) {
            return;
        }

        $categories = [
            'tin-tuc' => ['Tin tuc', 'Cap nhat thi truong va du an moi'],
            'co-hoi-dau-tu' => ['Co hoi dau tu', 'Thong tin co hoi so huu va phan tich dau tu'],
            'su-kien' => ['Su kien', 'Su kien mo ban va gioi thieu du an'],
            'chinh-sach' => ['Chinh sach ban hang', 'Chinh sach, uu dai va cap nhat ban hang'],
            'phan-tich-thi-truong' => ['Phan tich thi truong', 'Goc nhin ve thi truong bat dong san cao cap'],
        ];

        foreach ($categories as $slug => [$name, $description]) {
            PostCategory::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'description' => $description]
            );
        }

        $newsCategory = PostCategory::where('slug', 'tin-tuc')->first();
        $investmentCategory = PostCategory::where('slug', 'co-hoi-dau-tu')->first();
        $eventCategory = PostCategory::where('slug', 'su-kien')->first();
        $policyCategory = PostCategory::where('slug', 'chinh-sach')->first();
        $marketCategory = PostCategory::where('slug', 'phan-tich-thi-truong')->first();

        $thumbnail = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop';

        $items = [
            ['news', $newsCategory, 'Masterise Homes va chuan song bat dong san hang hieu'],
            ['news', $newsCategory, 'Xu huong can ho cao cap tai cac do thi lon'],
            ['news', $marketCategory, 'Ly do bat dong san hang sang thu hut nha dau tu'],
            ['news', $marketCategory, 'Nhung yeu to tao nen gia tri ben vung cua du an cao cap'],
            ['news', $newsCategory, 'Cap nhat thi truong can ho cao cap nam 2026'],
            ['news', $newsCategory, 'Trai nghiem song chuan quoc te tai cac du an Masterise Homes'],
            ['news', $marketCategory, 'Vai tro cua vi tri trong dau tu bat dong san cao cap'],
            ['news', $policyCategory, 'Chinh sach ban hang va nhung diem nha dau tu can quan tam'],
            ['investment', $investmentCategory, 'Co hoi so huu can ho cao cap trong giai doan mo ban moi'],
            ['investment', $marketCategory, 'Phan tich tiem nang tang gia cua bat dong san hang sang'],
            ['event', $eventCategory, 'Su kien gioi thieu dong san pham Lumiere Series'],
            ['investment', $policyCategory, 'Chinh sach ban hang danh cho nha dau tu giai doan dau'],
            ['investment', $marketCategory, 'Vi sao can ho cao cap van giu suc hut voi nha dau tu dai han'],
            ['investment', $marketCategory, 'Loi the vi tri trong chien luoc dau tu bat dong san do thi'],
            ['investment', $investmentCategory, 'Dong tien cho thue tu can ho hang sang can luu y dieu gi'],
            ['event', $eventCategory, 'Event private preview danh cho khach hang quan tam Masterise Homes'],
        ];

        foreach ($items as $index => [$type, $category, $title]) {
            $slug = Str::slug($title);
            $isEvent = $type === 'event';

            $post = Post::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'post_type' => $type,
                    'summary' => 'Cap nhat thong tin moi nhat tu he sinh thai Masterise Homes, danh cho khach hang va nha dau tu quan tam den bat dong san cao cap.',
                    'content' => '<p>Masterise Homes tap trung phat trien nhung san pham bat dong san cao cap voi thiet ke hien dai, tien ich dong bo va gia tri dau tu dai han.</p><p>Bai viet nay cung cap goc nhin tong quan, cac diem can luu y va loi ich khi khach hang tim hieu co hoi so huu hoac dau tu vao du an.</p>',
                    'thumbnail' => $thumbnail,
                    'status' => 'published',
                    'is_featured' => $index < 4,
                    'post_category_id' => $category?->id,
                    'author_id' => $author->id,
                    'published_at' => now()->subDays($index),
                    'event_start_at' => $isEvent ? now()->addDays(14 + $index) : null,
                    'event_end_at' => $isEvent ? now()->addDays(14 + $index)->addHours(3) : null,
                    'event_location' => $isEvent ? 'Masterise Sales Gallery, TP. Ho Chi Minh' : null,
                    'event_register_url' => $isEvent ? '/lien-he' : null,
                ]
            );

            $post->seoMeta()->updateOrCreate(
                ['seoable_id' => $post->id, 'seoable_type' => get_class($post)],
                [
                    'title' => $title . ' | Masterise Homes',
                    'description' => $post->summary,
                    'keywords' => 'Masterise Homes, bat dong san cao cap, dau tu, tin tuc, su kien',
                ]
            );
        }
    }
}
