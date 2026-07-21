<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminProjectReviewResource;
use App\Models\Project;
use App\Models\ProjectReview;
use App\Support\NextCacheRevalidator;
use App\Support\PublicContentCache;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProjectReviewAdminController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|integer|exists:projects,id',
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'search' => 'nullable|string|max:100',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = ProjectReview::query()->with('project:id,name,slug');
        if (!empty($validated['project_id'])) $query->where('project_id', $validated['project_id']);
        if (!empty($validated['status'])) $query->where('moderation_status', $validated['status']);
        if (!empty($validated['search'])) {
            $search = trim($validated['search']);
            $query->where(fn ($builder) => $builder
                ->where('reviewer_name', 'like', "%{$search}%")
                ->orWhere('review_body', 'like', "%{$search}%")
                ->orWhereHas('project', fn ($project) => $project->where('name', 'like', "%{$search}%")));
        }

        $reviews = $query->latest()->paginate($validated['per_page'] ?? 20);
        return response()->json([
            'success' => true,
            'data' => AdminProjectReviewResource::collection($reviews->items())->resolve($request),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(true));
        $review = ProjectReview::create([
            ...$this->cleanContent($validated),
            'reviewed_at' => $validated['reviewed_at'] ?? now(),
            'source_type' => $validated['source_type'] ?? 'admin',
            'source_url' => $validated['source_url'] ?? null,
            'is_verified' => $validated['is_verified'] ?? true,
            'moderation_status' => 'approved',
            'is_published' => $validated['is_published'] ?? true,
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
            'rejected_reason' => null,
        ]);
        $review->load('project:id,name,slug');
        $this->invalidate($review->project);

        return response()->json([
            'success' => true,
            'message' => 'Tạo đánh giá thành công.',
            'data' => (new AdminProjectReviewResource($review))->resolve($request),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        return response()->json(['success' => true, 'data' => (new AdminProjectReviewResource($review))->resolve($request)]);
    }

    public function update(Request $request, int $id)
    {
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        $validated = $request->validate($this->rules(false));
        $status = $validated['moderation_status'] ?? $review->moderation_status;
        $published = array_key_exists('is_published', $validated) ? (bool) $validated['is_published'] : $review->is_published;
        $this->validateState($status, $published);

        $review->fill($this->cleanContent($validated));
        $review->fill(collect($validated)->only([
            'reviewed_at', 'source_type', 'source_url', 'is_verified', 'moderation_status', 'is_published', 'rejected_reason',
        ])->all());
        if ($status === 'approved' && !$review->approved_at) {
            $review->approved_by = $request->user()?->id;
            $review->approved_at = now();
        }
        if ($status !== 'rejected') $review->rejected_reason = null;
        $review->save();
        $this->invalidate($review->project);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật đánh giá thành công.',
            'data' => (new AdminProjectReviewResource($review->fresh('project:id,name,slug')))->resolve($request),
        ]);
    }

    public function approve(Request $request, int $id)
    {
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        $review->update([
            'moderation_status' => 'approved',
            'is_published' => true,
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
            'rejected_reason' => null,
        ]);
        $this->invalidate($review->project);

        return response()->json([
            'success' => true,
            'message' => 'Phê duyệt đánh giá thành công.',
            'data' => (new AdminProjectReviewResource($review->fresh('project:id,name,slug')))->resolve($request),
        ]);
    }

    public function reject(Request $request, int $id)
    {
        $validated = $request->validate(['reason' => 'required|string|min:3|max:1000']);
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        $review->update([
            'moderation_status' => 'rejected',
            'is_published' => false,
            'rejected_reason' => trim(strip_tags($validated['reason'])),
        ]);
        $this->invalidate($review->project);

        return response()->json([
            'success' => true,
            'message' => 'Đã từ chối đánh giá.',
            'data' => (new AdminProjectReviewResource($review->fresh('project:id,name,slug')))->resolve($request),
        ]);
    }

    public function destroy(int $id)
    {
        $review = ProjectReview::with('project:id,name,slug')->findOrFail($id);
        $project = $review->project;
        $review->delete();
        $this->invalidate($project);
        return response()->json(['success' => true, 'message' => 'Đã xóa đánh giá thành công.']);
    }

    private function rules(bool $creating): array
    {
        $required = $creating ? 'required' : 'sometimes|required';
        return [
            'project_id' => [$required, 'integer', 'exists:projects,id'],
            'reviewer_name' => [$required, 'string', 'max:100'],
            'reviewer_role' => 'nullable|string|max:100',
            'rating' => [$required, 'numeric', 'min:1', 'max:5'],
            'review_body' => [$required, 'string', 'min:5', 'max:2000'],
            'reviewed_at' => 'nullable|date',
            'source_type' => 'nullable|string|max:50',
            'source_url' => 'nullable|url:http,https|max:512',
            'is_verified' => 'sometimes|boolean',
            'moderation_status' => ['sometimes', Rule::in(['pending', 'approved', 'rejected'])],
            'is_published' => 'sometimes|boolean',
            'rejected_reason' => 'nullable|string|max:1000',
        ];
    }

    private function cleanContent(array $validated): array
    {
        return collect($validated)->only(['project_id', 'reviewer_name', 'reviewer_role', 'rating', 'review_body'])
            ->map(fn ($value, $key) => in_array($key, ['reviewer_name', 'reviewer_role', 'review_body'], true) && is_string($value)
                ? trim(strip_tags($value))
                : $value)
            ->all();
    }

    private function validateState(string $status, bool $published): void
    {
        if ($published && $status !== 'approved') {
            throw ValidationException::withMessages([
                'is_published' => 'Chỉ đánh giá đã duyệt mới được phép phát hành.',
            ]);
        }
    }

    private function invalidate(?Project $project): void
    {
        if (!$project) return;
        $tags = ["project-{$project->slug}", "project-reviews-{$project->slug}"];
        PublicContentCache::invalidate('projects.list', 'projects.featured', ...$tags);
        NextCacheRevalidator::tags($tags);
    }
}
