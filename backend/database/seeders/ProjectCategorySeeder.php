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
            ]
        );

        ProjectCategory::updateOrCreate(
            ['slug' => 'biet-thu-dinh-thu'],
            [
                'name' => 'Biệt Thự & Dinh Thự',
                'description' => 'Biệt thự sinh thái, dinh thực hạng sang ven sông đẳng cấp thượng lưu.',
            ]
        );

        ProjectCategory::updateOrCreate(
            ['slug' => 'shophouse-commercial'],
            [
                'name' => 'Nhà Phố Thương Mại (Shophouse)',
                'description' => 'Nhà phố thương mại, shophouse mặt tiền kinh doanh sầm uất tại các đại đô thị.',
            ]
        );
    }
}
