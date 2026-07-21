<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectReview;
use App\Http\Resources\ProjectReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectReviewAdminController extends Controller
{
    /**
     * Admin list reviews with filters.
     */
    public function index(Request $request)
    {
        $query = ProjectReview::with('project:id,name,slug');

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            $query->where('moderation_status', $request->status);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function($q) use ($search) {
                $q->where('reviewer_name', 'like', "%{$search}%")
                  ->orWhere('review_body', 'like', "%{$search}%");
            });
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => ProjectReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ]
        ]);
    }

    /**
     * Admin create verified review.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'reviewer_name' => 'required|string|max:100',
            'reviewer_role' => 'nullable|string|max:100',
            'rating' => 'required|numeric|min:1|max:5',
            'review_body' => 'required|string|min:5|max:2000',
            'is_verified' => 'boolean',
            'source_type' => 'nullable|string|max:50',
            'source_url' => 'nullable|url|max:255',
            'is_published' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $isPublished = $request->boolean('is_published', true);

        $review = ProjectReview::create([
            'project_id' => $request->project_id,
            'reviewer_name' => trim($request->reviewer_name),
            'reviewer_role' => $request->reviewer_role ? trim($request->reviewer_role) : 'Khách hàng',
            'rating' => (float) $request->rating,
            'review_body' => trim($request->review_body),
            'reviewed_at' => now(),
            'source_type' => $request->source_type ?: 'admin',
            'source_url' => $request->source_url ?: null,
            'is_verified' => $request->boolean('is_verified', true),
            'moderation_status' => 'approved',
            'is_published' => $isPublished,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tạo đánh giá thành công!',
            'data' => new ProjectReviewResource($review),
        ], 201);
    }

    /**
     * Show single review details.
     */
    public function show($id)
    {
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => new ProjectReviewResource($review),
        ]);
    }

    /**
     * Update review details.
     */
    public function update(Request $request, $id)
    {
        $review = ProjectReview::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reviewer_name' => 'sometimes|required|string|max:100',
            'reviewer_role' => 'nullable|string|max:100',
            'rating' => 'sometimes|required|numeric|min:1|max:5',
            'review_body' => 'sometimes|required|string|min:5|max:2000',
            'is_verified' => 'boolean',
            'is_published' => 'boolean',
            'source_type' => 'nullable|string|max:50',
            'source_url' => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->only([
            'reviewer_name', 'reviewer_role', 'rating', 'review_body',
            'is_verified', 'is_published', 'source_type', 'source_url'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đánh giá thành công!',
            'data' => new ProjectReviewResource($review),
        ]);
    }

    /**
     * Approve review.
     */
    public function approve($id)
    {
        $review = ProjectReview::findOrFail($id);
        $review->update([
            'moderation_status' => 'approved',
            'is_published' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejected_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Phê duyệt đánh giá thành công!',
            'data' => new ProjectReviewResource($review),
        ]);
    }

    /**
     * Reject review.
     */
    public function reject(Request $request, $id)
    {
        $review = ProjectReview::findOrFail($id);
        $review->update([
            'moderation_status' => 'rejected',
            'is_published' => false,
            'rejected_reason' => $request->get('reason', 'Nội dung chưa đạt tiêu chuẩn'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã từ chối đánh giá.',
            'data' => new ProjectReviewResource($review),
        ]);
    }

    /**
     * Delete review.
     */
    public function destroy($id)
    {
        $review = ProjectReview::findOrFail($id);
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đánh giá thành công.',
        ]);
    }
}
