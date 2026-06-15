<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectVrTour;
use Illuminate\Http\Request;

class ProjectVrTourController extends Controller
{
    /**
     * Display the active VR Tour for a project.
     */
    public function show($slug)
    {
        $project = Project::where('slug', $slug)->first();

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dự án.'
            ], 404);
        }

        $tour = ProjectVrTour::where('project_id', $project->id)
            ->where('is_active', true)
            ->first();

        if (!$tour) {
            return response()->json([
                'success' => false,
                'message' => 'Dự án chưa có cấu hình VR 360.',
                'virtual_tour_url' => $project->virtual_tour_url // Send fallback URL
            ], 404);
        }

        // Load active scenes and active hotspots
        $scenes = $tour->scenes()
            ->where('is_active', true)
            ->with(['hotspots' => function ($query) {
                $query->where('is_active', true)->with('targetScene:id,slug');
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tour' => $tour,
                'scenes' => $scenes,
                'virtual_tour_url' => $project->virtual_tour_url // Send fallback URL anyway
            ]
        ], 200);
    }
}
