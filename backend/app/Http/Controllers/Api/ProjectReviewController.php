<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectReview;
use App\Http\Resources\ProjectReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectReviewController extends Controller
{
    /**
     * Get published reviews for a project.
     */
    public function index($slug)
    {
        $project = Project::where('slug', $slug)->firstOrFail();

        $reviews = ProjectReview::published()
            ->where('project_id', $project->id)
            ->orderBy('reviewed_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => ProjectReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'summary' => $project->review_summary,
        ]);
    }

    /**
     * Submit a public review for a project (pending moderation).
     */
    public function store(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reviewer_name' => 'required|string|max:100',
            'reviewer_role' => 'nullable|string|max:100',
            'rating' => 'required|numeric|min:1|max:5',
            'review_body' => 'required|string|min:10|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu đánh giá chưa hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $review = ProjectReview::create([
            'project_id' => $project->id,
            'reviewer_name' => trim($request->reviewer_name),
            'reviewer_role' => $request->reviewer_role ? trim($request->reviewer_role) : 'Khách hàng',
            'rating' => (float) $request->rating,
            'review_body' => trim($request->review_body),
            'reviewed_at' => now(),
            'source_type' => 'website',
            'is_verified' => false,
            'moderation_status' => 'pending',
            'is_published' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn đã gửi đánh giá! Đánh giá của bạn sẽ được hiển thị sau khi duyệt.',
            'data' => new ProjectReviewResource($review),
        ], 201);
    }
}
