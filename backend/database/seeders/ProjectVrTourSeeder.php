<?php

namespace Database\Seeders;

use App\Models\ProjectVrTour;
use App\Models\ProjectVrScene;
use App\Models\ProjectVrHotspot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProjectVrTourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a VR Tour for The Global City (project ID 1)
        $tour = ProjectVrTour::create([
            'project_id' => 1,
            'title' => 'Trải nghiệm Thực tế ảo VR 360° The Global City',
            'description' => 'Khám phá đô thị biểu tượng mới tại trung tâm TP. Thủ Đức được Foster + Partners quy hoạch.',
            'cover_image' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=88&w=600&auto=format&fit=crop',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        // 2. Create Scenes
        // Scene 1: Overview
        $sceneOverview = ProjectVrScene::create([
          'tour_id' => $tour->id,
          'project_id' => 1,
          'title' => 'Toàn cảnh đô thị',
          'slug' => 'toan-canh-do-thi',
          'description' => 'Góc nhìn từ trên cao của đại đô thị 117.4 ha',
          'panorama_url' => 'https://pannellum.org/images/alma.jpg',
          'thumbnail_url' => 'https://pannellum.org/images/alma.jpg',
          'scene_type' => 'overview',
          'initial_yaw' => 0,
          'initial_pitch' => 0,
          'initial_zoom' => 80,
          'autorotate' => true,
          'sort_order' => 0,
          'is_active' => true,
        ]);

        // Scene 2: Apartment
        $sceneApartment = ProjectVrScene::create([
          'tour_id' => $tour->id,
          'project_id' => 1,
          'title' => 'Căn hộ mẫu 3PN',
          'slug' => 'can-ho-mau-3pn',
          'description' => 'Trải nghiệm phong cách sống Branded Residences sang trọng',
          'panorama_url' => 'https://pannellum.org/images/jure-chapel.jpg',
          'thumbnail_url' => 'https://pannellum.org/images/jure-chapel.jpg',
          'scene_type' => 'apartment',
          'initial_yaw' => 180,
          'initial_pitch' => -5,
          'initial_zoom' => 85,
          'autorotate' => false,
          'sort_order' => 1,
          'is_active' => true,
        ]);

        // 3. Create Hotspots
        // Hotspots for Overview Scene
        ProjectVrHotspot::create([
            'scene_id' => $sceneOverview->id,
            'project_id' => 1,
            'type' => 'navigation',
            'title' => 'Di chuyển vào Căn hộ 3PN',
            'description' => 'Tham quan nhà mẫu 3 phòng ngủ sang trọng.',
            'yaw' => 12.5,
            'pitch' => -8.2,
            'target_scene_id' => $sceneApartment->id,
            'is_active' => true,
        ]);

        ProjectVrHotspot::create([
            'scene_id' => $sceneOverview->id,
            'project_id' => 1,
            'type' => 'lead',
            'title' => 'Nhận bảng giá & giỏ hàng',
            'description' => 'Xem chi tiết giá bán shophouse và căn hộ mở bán.',
            'yaw' => -45.0,
            'pitch' => -12.0,
            'cta_type' => 'price_form',
            'cta_label' => 'Đăng ký nhận bảng giá',
            'is_active' => true,
        ]);

        ProjectVrHotspot::create([
            'scene_id' => $sceneOverview->id,
            'project_id' => 1,
            'type' => 'info',
            'title' => 'Kênh đào nhạc nước 2km',
            'description' => 'Khu nhạc nước quy mô lớn nhất Đông Nam Á, tâm điểm lễ hội của TP. Thủ Đức.',
            'yaw' => 110.0,
            'pitch' => -4.5,
            'is_active' => true,
        ]);

        // Hotspots for Apartment Scene
        ProjectVrHotspot::create([
            'scene_id' => $sceneApartment->id,
            'project_id' => 1,
            'type' => 'navigation',
            'title' => 'Trở về Toàn cảnh dự án',
            'description' => 'Xem đô thị từ góc nhìn trên cao.',
            'yaw' => 0.0,
            'pitch' => 2.0,
            'target_scene_id' => $sceneOverview->id,
            'is_active' => true,
        ]);

        ProjectVrHotspot::create([
            'scene_id' => $sceneApartment->id,
            'project_id' => 1,
            'type' => 'lead',
            'title' => 'Đặt lịch xem thực tế',
            'description' => 'Đăng ký xe đưa đón tham quan dự án và căn hộ mẫu.',
            'yaw' => -120.0,
            'pitch' => -10.0,
            'cta_type' => 'schedule_visit',
            'cta_label' => 'Đặt lịch tham quan ngay',
            'is_active' => true,
        ]);
    }
}
