<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectVrTour;
use App\Models\ProjectVrScene;
use App\Models\ProjectVrHotspot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ProjectVrTourAdminController extends Controller
{
    /**
     * Get VR Tour details for a project (including all scenes and hotspots).
     */
    public function getTour($project_id)
    {
        $project = Project::find($project_id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án.'
            ], 404);
        }

        $tour = ProjectVrTour::where('project_id', $project->id)
            ->with(['scenes' => function ($query) {
                $query->orderBy('sort_order')
                      ->with(['hotspots' => function ($q) {
                          $q->orderBy('sort_order')->with('targetScene:id,title,slug');
                      }]);
            }])
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'tour' => $tour,
                'project_name' => $project->name,
                'virtual_tour_url' => $project->virtual_tour_url
            ]
        ], 200);
    }

    /**
     * Create or update a VR Tour configuration for a project.
     */
    public function saveTour(Request $request, $project_id)
    {
        $project = Project::find($project_id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string|max:2048',
            'is_active' => 'required|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi dữ liệu đầu vào.',
                'errors' => $validator->errors()
            ], 422);
        }

        $tour = ProjectVrTour::updateOrCreate(
            ['project_id' => $project->id],
            [
                'title' => $request->title,
                'description' => $request->description,
                'cover_image' => $request->cover_image,
                'is_active' => $request->is_active,
                'sort_order' => $request->get('sort_order', 0),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Lưu cấu hình VR Tour thành công.',
            'data' => $tour
        ], 200);
    }

    /**
     * Add a scene to a VR Tour.
     */
    public function addScene(Request $request, $tour_id)
    {
        $tour = ProjectVrTour::find($tour_id);

        if (!$tour) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy VR Tour.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'description' => 'nullable|string',
            'panorama_url' => 'nullable|string',
            'panorama_file' => 'nullable|file|image|max:15360|mimes:jpeg,jpg,png,webp',
            'thumbnail_url' => 'nullable|string',
            'scene_type' => 'nullable|string|max:100',
            'initial_yaw' => 'nullable|numeric|between:-180,180',
            'initial_pitch' => 'nullable|numeric|between:-85,85',
            'initial_zoom' => 'nullable|numeric|between:10,120',
            'autorotate' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi dữ liệu đầu vào.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check unique slug within this tour
        $existingScene = ProjectVrScene::where('tour_id', $tour->id)
            ->where('slug', $request->slug)
            ->first();

        if ($existingScene) {
            return response()->json([
                'success' => false,
                'message' => 'Slug của cảnh này đã tồn tại trong Tour.',
                'errors' => ['slug' => ['Slug này đã được sử dụng cho một cảnh khác.']]
            ], 422);
        }

        $warning = null;
        $panoramaUrl = $request->get('panorama_url');

        if ($request->hasFile('panorama_file')) {
            $file = $request->file('panorama_file');
            
            // Check Aspect Ratio (2:1 standard)
            try {
                $img = Image::read($file);
                $width = $img->width();
                $height = $img->height();
                $ratio = $width / $height;
                if (abs($ratio - 2.0) > 0.1) { // 5% tolerance
                    $warning = "Cảnh báo: Ảnh Panorama tải lên có tỷ lệ " . round($ratio, 2) . ":1. Tỷ lệ chuẩn khuyên dùng là 2:1.";
                }
            } catch (\Exception $e) {
                // Ignore decoding errors for metadata warning
            }

            // Convert to webp if image
            try {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileName = Str::slug($originalName) . '-' . time() . '.webp';
                $savedPath = 'media/' . $fileName;

                $img = Image::read($file);
                $encoded = $img->toWebp(85);
                Storage::disk('public')->put($savedPath, $encoded);
                $panoramaUrl = Storage::disk('public')->url($savedPath);
            } catch (\Exception $e) {
                // Fallback to direct store
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileName = Str::slug($originalName) . '-' . time() . '.' . $file->getClientOriginalExtension();
                $savedPath = $file->storeAs('media', $fileName, 'public');
                $panoramaUrl = Storage::disk('public')->url($savedPath);
            }
        }

        if (empty($panoramaUrl)) {
            return response()->json([
                'success' => false,
                'message' => 'Cần chọn tệp ảnh Panorama hoặc điền URL ảnh.',
                'errors' => ['panorama_url' => ['Trường ảnh Panorama không được để trống.']]
            ], 422);
        }

        $scene = ProjectVrScene::create([
            'tour_id' => $tour->id,
            'project_id' => $tour->project_id,
            'title' => $request->title,
            'slug' => $request->slug,
            'description' => $request->description,
            'panorama_url' => $panoramaUrl,
            'thumbnail_url' => $request->get('thumbnail_url', $panoramaUrl), // fallback to panorama if no thumb
            'scene_type' => $request->get('scene_type', 'other'),
            'initial_yaw' => $request->get('initial_yaw', 0.0),
            'initial_pitch' => $request->get('initial_pitch', 0.0),
            'initial_zoom' => $request->get('initial_zoom', 80.0),
            'autorotate' => $request->get('autorotate', false),
            'sort_order' => $request->get('sort_order', 0),
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm cảnh mới thành công.',
            'data' => $scene,
            'warning' => $warning
        ], 201);
    }

    /**
     * Update an existing scene details.
     */
    public function updateScene(Request $request, $scene_id)
    {
        $scene = ProjectVrScene::find($scene_id);

        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cảnh.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'description' => 'nullable|string',
            'panorama_url' => 'nullable|string',
            'panorama_file' => 'nullable|file|image|max:15360|mimes:jpeg,jpg,png,webp',
            'thumbnail_url' => 'nullable|string',
            'scene_type' => 'nullable|string|max:100',
            'initial_yaw' => 'nullable|numeric|between:-180,180',
            'initial_pitch' => 'nullable|numeric|between:-85,85',
            'initial_zoom' => 'nullable|numeric|between:10,120',
            'autorotate' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi dữ liệu đầu vào.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check unique slug within same tour
        $existingScene = ProjectVrScene::where('tour_id', $scene->tour_id)
            ->where('slug', $request->slug)
            ->where('id', '!=', $scene->id)
            ->first();

        if ($existingScene) {
            return response()->json([
                'success' => false,
                'message' => 'Slug của cảnh này đã tồn tại trong Tour.',
                'errors' => ['slug' => ['Slug này đã được sử dụng cho một cảnh khác.']]
            ], 422);
        }

        $warning = null;
        $panoramaUrl = $request->get('panorama_url', $scene->panorama_url);

        if ($request->hasFile('panorama_file')) {
            $file = $request->file('panorama_file');
            
            // Check Aspect Ratio (2:1 standard)
            try {
                $img = Image::read($file);
                $width = $img->width();
                $height = $img->height();
                $ratio = $width / $height;
                if (abs($ratio - 2.0) > 0.1) {
                    $warning = "Cảnh báo: Ảnh Panorama tải lên có tỷ lệ " . round($ratio, 2) . ":1. Tỷ lệ chuẩn khuyên dùng là 2:1.";
                }
            } catch (\Exception $e) {
                // Ignore decoding errors
            }

            // Convert to webp
            try {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileName = Str::slug($originalName) . '-' . time() . '.webp';
                $savedPath = 'media/' . $fileName;

                $img = Image::read($file);
                $encoded = $img->toWebp(85);
                Storage::disk('public')->put($savedPath, $encoded);
                $panoramaUrl = Storage::disk('public')->url($savedPath);
            } catch (\Exception $e) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $fileName = Str::slug($originalName) . '-' . time() . '.' . $file->getClientOriginalExtension();
                $savedPath = $file->storeAs('media', $fileName, 'public');
                $panoramaUrl = Storage::disk('public')->url($savedPath);
            }
        }

        $scene->update([
            'title' => $request->title,
            'slug' => $request->slug,
            'description' => $request->description,
            'panorama_url' => $panoramaUrl,
            'thumbnail_url' => $request->get('thumbnail_url', $request->hasFile('panorama_file') ? $panoramaUrl : $scene->thumbnail_url),
            'scene_type' => $request->get('scene_type', $scene->scene_type),
            'initial_yaw' => $request->get('initial_yaw', $scene->initial_yaw),
            'initial_pitch' => $request->get('initial_pitch', $scene->initial_pitch),
            'initial_zoom' => $request->get('initial_zoom', $scene->initial_zoom),
            'autorotate' => $request->get('autorotate', $scene->autorotate),
            'sort_order' => $request->get('sort_order', $scene->sort_order),
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật cảnh thành công.',
            'data' => $scene,
            'warning' => $warning
        ], 200);
    }

    /**
     * Delete a scene.
     */
    public function destroyScene($scene_id)
    {
        $scene = ProjectVrScene::find($scene_id);

        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cảnh.'
            ], 404);
        }

        // Delete from database (cascade deletes hotspots due to migrations schema)
        $scene->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa cảnh thành công.'
        ], 200);
    }

    /**
     * Add a hotspot to a scene.
     */
    public function addHotspot(Request $request, $scene_id)
    {
        $scene = ProjectVrScene::find($scene_id);

        if (!$scene) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cảnh.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:info,navigation,lead,media,map',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'yaw' => 'required|numeric|between:-180,180',
            'pitch' => 'required|numeric|between:-85,85',
            'icon' => 'nullable|string|max:100',
            'target_scene_id' => 'nullable|exists:project_vr_scenes,id',
            'media_url' => 'nullable|string|max:2048',
            'cta_type' => 'nullable|string|in:price_form,schedule_visit,zalo,hotline',
            'cta_label' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:2048',
            'metadata' => 'nullable|array',
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi dữ liệu đầu vào.',
                'errors' => $validator->errors()
            ], 422);
        }

        $hotspot = ProjectVrHotspot::create([
            'scene_id' => $scene->id,
            'project_id' => $scene->project_id,
            'type' => $request->type,
            'title' => $request->title,
            'description' => $request->description,
            'yaw' => $request->yaw,
            'pitch' => $request->pitch,
            'icon' => $request->icon,
            'target_scene_id' => $request->target_scene_id,
            'media_url' => $request->media_url,
            'cta_type' => $request->cta_type,
            'cta_label' => $request->cta_label,
            'cta_url' => $request->cta_url,
            'metadata' => $request->metadata,
            'sort_order' => $request->get('sort_order', 0),
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm hotspot thành công.',
            'data' => $hotspot
        ], 201);
    }

    /**
     * Update an existing hotspot.
     */
    public function updateHotspot(Request $request, $hotspot_id)
    {
        $hotspot = ProjectVrHotspot::find($hotspot_id);

        if (!$hotspot) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hotspot.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:info,navigation,lead,media,map',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'yaw' => 'required|numeric|between:-180,180',
            'pitch' => 'required|numeric|between:-85,85',
            'icon' => 'nullable|string|max:100',
            'target_scene_id' => 'nullable|exists:project_vr_scenes,id',
            'media_url' => 'nullable|string|max:2048',
            'cta_type' => 'nullable|string|in:price_form,schedule_visit,zalo,hotline',
            'cta_label' => 'nullable|string|max:255',
            'cta_url' => 'nullable|string|max:2048',
            'metadata' => 'nullable|array',
            'sort_order' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi dữ liệu đầu vào.',
                'errors' => $validator->errors()
            ], 422);
        }

        $hotspot->update([
            'type' => $request->type,
            'title' => $request->title,
            'description' => $request->description,
            'yaw' => $request->yaw,
            'pitch' => $request->pitch,
            'icon' => $request->icon,
            'target_scene_id' => $request->target_scene_id,
            'media_url' => $request->media_url,
            'cta_type' => $request->cta_type,
            'cta_label' => $request->cta_label,
            'cta_url' => $request->cta_url,
            'metadata' => $request->metadata,
            'sort_order' => $request->get('sort_order', 0),
            'is_active' => $request->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hotspot thành công.',
            'data' => $hotspot
        ], 200);
    }

    /**
     * Delete a hotspot.
     */
    public function destroyHotspot($hotspot_id)
    {
        $hotspot = ProjectVrHotspot::find($hotspot_id);

        if (!$hotspot) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hotspot.'
            ], 404);
        }

        $hotspot->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa hotspot thành công.'
        ], 200);
    }
}
