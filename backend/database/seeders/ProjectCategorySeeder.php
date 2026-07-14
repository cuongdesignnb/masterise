<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProjectCategory;

class ProjectCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ProjectCategory::updateOrCreate(
            ['slug' => 'can-ho-cao-cap'],
            [
                'name' => 'Căn Hộ Cao Cấp',
                'description' => 'Các dự án căn hộ cao cấp, căn hộ hàng hiệu (Branded Residences) hợp tác với Marriott International.',
                'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
            ]
        );

        ProjectCategory::updateOrCreate(
            ['slug' => 'biet-thu-dinh-thu'],
            [
                'name' => 'Biệt Thự & Dinh Thự',
                'description' => 'Biệt thự sinh thái, dinh thực hạng sang ven sông đẳng cấp thượng lưu.',
                'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
            ]
        );

        ProjectCategory::updateOrCreate(
            ['slug' => 'shophouse-thuong-mai'],
            [
                'name' => 'Shophouse thương mại',
                'description' => 'Nhà phố thương mại, shophouse mặt tiền kinh doanh sầm uất tại các đại đô thị.',
                'taxonomy_type' => ProjectCategory::TYPE_PROJECT,
            ]
        );
        ProjectCategory::updateOrCreate(
            ['slug' => 'masterise-colletion'],
            [
                'name' => 'Masterise Collection',
                'description' => 'Bo suu tap bat dong san can ho cao cap, huong den chuan song hien dai, tien ich dong bo va gia tri so huu ben vung. Alias SEO: Masterise Collection.',
                'taxonomy_type' => ProjectCategory::TYPE_COLLECTION,
            ]
        );

        ProjectCategory::updateOrCreate(
            ['slug' => 'lumiere-series'],
            [
                'name' => 'Lumiere Series',
                'description' => 'Dong bat dong san can ho hang sang mang phong cach thiet ke tinh te, khong gian song xanh, rieng tu va chuan trai nghiem cao cap.',
                'taxonomy_type' => ProjectCategory::TYPE_COLLECTION,
            ]
        );
    }
}
