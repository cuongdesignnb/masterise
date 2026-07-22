<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicProjectReviewResource;
use App\Models\Project;
use App\Models\ProjectReview;
use App\Support\NextCacheRevalidator;
use App\Support\PublicContentCache;
use App\Support\SeoFeatureFlags;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProjectReviewController extends Controller
{
    public function index(Request $request, string $slug)
    {
        $project = Project::query()->where('slug', $slug)->where('is_published', true)->firstOrFail();
        $scope = ProjectReview::query()->published()->where('project_id', $project->id);
        $aggregateRow = (clone $scope)
            ->selectRaw('COUNT(*) as review_count, AVG(rating) as rating_value')
            ->first();
        $count = (int) ($aggregateRow?->review_count ?? 0);
        $aggregate = $count > 0 ? [
            'ratingValue' => round((float) $aggregateRow->rating_value, 1),
            'ratingCount' => $count,
            'reviewCount' => $count,
            'bestRating' => 5,
            'worstRating' => 1,
        ] : null;

        $reviews = (clone $scope)->orderByDesc('reviewed_at')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => [
                'items' => PublicProjectReviewResource::collection($reviews->items())->resolve($request),
                'aggregate' => $aggregate,
            ],
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function challenge(int $id)
    {
        abort_unless(SeoFeatureFlags::enabled('public_project_review_submission_enabled'), 404);
        Project::query()->where('is_published', true)->findOrFail($id);

        $issuedAt = now()->timestamp;
        return response()->json([
            'success' => true,
            'data' => [
                'token' => Crypt::encryptString(json_encode([
                    'project_id' => $id,
                    'issued_at' => $issuedAt,
                    'nonce' => (string) Str::uuid(),
                ], JSON_THROW_ON_ERROR)),
                'issued_at' => $issuedAt,
                'minimum_fill_seconds' => 3,
            ],
        ])->header('Cache-Control', 'no-store');
    }

    public function store(Request $request, int $id)
    {
        if (!SeoFeatureFlags::enabled('public_project_review_submission_enabled')) {
            return response()->json(['success' => false, 'message' => 'Chức năng gửi đánh giá hiện chưa được mở.'], 404);
        }

        if ($request->filled('website_hp')) {
            Log::notice('Project review honeypot triggered.', ['project_id' => $id, 'ip' => $request->ip()]);
            return response()->json(['success' => true, 'message' => 'Cảm ơn bạn đã gửi đánh giá!']);
        }

        $project = Project::query()->where('is_published', true)->findOrFail($id);
        $validated = $request->validate([
            'reviewer_name' => 'required|string|min:2|max:100',
            'reviewer_role' => 'nullable|string|max:100',
            'rating' => 'required|numeric|min:1|max:5',
            'review_body' => 'required|string|min:10|max:2000',
            'website_hp' => 'nullable|max:0',
            'submission_token' => 'required|string|max:2048',
            'consent' => 'accepted',
        ]);

        try {
            $challenge = json_decode(Crypt::decryptString($validated['submission_token']), true, flags: JSON_THROW_ON_ERROR);
            $age = now()->timestamp - (int) ($challenge['issued_at'] ?? 0);
            if ((int) ($challenge['project_id'] ?? 0) !== $project->id || $age < 3 || $age > 1800) {
                throw new \RuntimeException('Invalid review submission challenge.');
            }
        } catch (DecryptException|\JsonException|\RuntimeException $exception) {
            Log::notice('Project review challenge rejected.', ['project_id' => $id, 'ip' => $request->ip()]);
            return response()->json(['success' => false, 'message' => 'Phiên gửi đánh giá không hợp lệ. Vui lòng mở lại biểu mẫu.'], 422);
        }

        $reviewerName = trim(strip_tags($validated['reviewer_name']));
        $reviewBody = trim(strip_tags($validated['review_body']));
        $duplicate = ProjectReview::query()
            ->where('project_id', $project->id)
            ->where('reviewer_name', $reviewerName)
            ->where('review_body', $reviewBody)
            ->where('created_at', '>=', now()->subDay())
            ->exists();
        if ($duplicate) {
            Log::notice('Duplicate project review rejected.', ['project_id' => $id, 'ip' => $request->ip()]);
            return response()->json(['success' => false, 'message' => 'Đánh giá này đã được gửi trước đó.'], 422);
        }

        ProjectReview::create([
            'project_id' => $project->id,
            'reviewer_name' => $reviewerName,
            'reviewer_role' => filled($validated['reviewer_role'] ?? null)
                ? trim(strip_tags($validated['reviewer_role']))
                : 'Khách hàng',
            'rating' => (float) $validated['rating'],
            'review_body' => $reviewBody,
            'reviewed_at' => now(),
            'source_type' => 'website',
            'is_verified' => false,
            'moderation_status' => 'pending',
            'is_published' => false,
        ]);

        $this->invalidate($project);

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn! Đánh giá đã được tiếp nhận và đang chờ kiểm duyệt.',
        ], 201);
    }

    private function invalidate(Project $project): void
    {
        $tags = ["project-{$project->slug}", "project-reviews-{$project->slug}"];
        PublicContentCache::invalidate('projects.list', 'projects.featured', ...$tags);
        NextCacheRevalidator::tags($tags);
    }
}
