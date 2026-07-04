<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Media;
use App\Models\Setting;
use App\Models\AiGenerationJob;
use App\Services\OpenAIService;
use App\Services\AI\ArticlePromptBuilder;
use App\Jobs\GenerateAiArticleWithImageJob;
use App\Helpers\AiContentHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AiContentController extends Controller
{
    protected OpenAIService $openai;

    public function __construct(OpenAIService $openai)
    {
        $this->openai = $openai;
    }

    /**
     * Get list of AI generated drafts.
     */
    public function drafts(Request $request)
    {
        $query = Post::query()
            ->where('ai_generated', true)
            ->where('status', 'draft')
            ->with(['category', 'author']);

        if ($request->has('q') && !empty($request->q)) {
            $search = $request->q;
            $query->where('title', 'like', "%{$search}%");
        }

        $perPage = $request->get('per_page', 10);
        $drafts = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $drafts->items(),
            'meta' => [
                'current_page' => $drafts->currentPage(),
                'last_page' => $drafts->lastPage(),
                'per_page' => $drafts->perPage(),
                'total' => $drafts->total(),
            ]
        ]);
    }

    /**
     * Generate a single article synchronously (immediate feedback for Admin).
     */
    public function generateArticle(Request $request, ArticlePromptBuilder $promptBuilder)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'post_category_id' => 'required|exists:post_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'tone' => 'nullable|string|max:255',
            'article_length' => 'nullable|string|max:50',
            'enable_image_generation' => 'required|boolean',
            'image_size' => 'nullable|string|max:20',
            'image_quality' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Dữ liệu tạo bài AI chưa hợp lệ.',
                'errors' => $validator->errors()
            ], 422);
        }

        $tone = $request->get('tone') ?: Setting::get('ai_default_tone');
        $length = $request->get('article_length') ?: Setting::get('ai_default_article_length');
        $enableImage = $request->get('enable_image_generation');

        // Apply rate limiter check
        $user = $request->user();
        $executedJobsThisHour = AiGenerationJob::where('created_by', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        $maxJobsPerHour = (int)Setting::get('ai_max_jobs_per_hour', 30);
        if ($executedJobsThisHour >= $maxJobsPerHour) {
            return response()->json([
                'success' => false,
                'message' => "Hạn ngạch giới hạn: Bạn đã vượt quá giới hạn {$maxJobsPerHour} lượt chạy AI mỗi giờ. Vui lòng thử lại sau."
            ], 429);
        }

        // Run synchronously to return results immediately for single generator
        $startedAt = now();
        $job = new GenerateAiArticleWithImageJob(
            $request->title,
            null, // batchId
            $user->id,
            $request->post_category_id,
            $request->author_id ?: $user->id,
            [
                'language' => Setting::get('ai_default_language', 'vi'),
                'tone' => $tone,
                'article_length' => $length,
                'enable_image_generation' => $enableImage,
                'image_size' => $request->image_size,
                'image_quality' => $request->image_quality,
            ]
        );

        // Dispatch synchronously
        $job->handle($this->openai, $promptBuilder);

        // Fetch the created job to see if it failed or completed
        $jobRecord = AiGenerationJob::where('created_by', $user->id)
            ->where('input_keywords', $request->title)
            ->where('created_at', '>=', $startedAt->copy()->subSecond())
            ->orderBy('created_at', 'desc')
            ->first();

        if ($jobRecord && $jobRecord->status === 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo bài viết bằng AI.',
                'details' => $jobRecord->error_message
            ], 500);
        }

        $post = $jobRecord ? Post::with(['category', 'author', 'seoMeta'])->find($jobRecord->post_id) : null;

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Tác vụ AI hoàn thành nhưng không thể tìm thấy bài viết đã tạo.'
            ], 500);
        }

        $isImageError = $jobRecord && str_contains($jobRecord->error_message ?? '', 'Image Error');

        return response()->json([
            'success' => true,
            'message' => $isImageError 
                ? 'Tạo bài viết nháp thành công! Tuy nhiên sinh ảnh lỗi: ' . $jobRecord->error_message
                : 'Tạo bài viết bằng AI thành công!',
            'data' => $post,
            'image_error' => $isImageError
        ]);
    }

    /**
     * Regenerate image for an existing AI post.
     */
    public function regenerateImage(Request $request, $postId, ArticlePromptBuilder $promptBuilder)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $user = $request->user();
        $jobRecord = AiGenerationJob::create([
            'type' => 'regenerate_image',
            'status' => 'processing',
            'provider' => 'openai',
            'image_model' => Setting::get('ai_image_model', 'gpt-image-1'),
            'post_id' => $post->id,
            'created_by' => $user->id,
            'started_at' => now(),
        ]);

        try {
            $imagePrompt = $post->seoMeta ? "Featured image for article titled: '{$post->title}'. " . $post->seoMeta->description : $post->title;
            $imagePrompt = $promptBuilder->buildFallbackImagePrompt($imagePrompt);

            $jobRecord->update(['prompt' => $imagePrompt]);

            $base64Image = $this->openai->generateImageWithImageApi(
                $imagePrompt,
                Setting::get('ai_default_image_size', '1536x1024'),
                Setting::get('ai_default_image_quality', 'medium')
            );

            $imageData = base64_decode($base64Image);
            $fileName = 'ai-re-' . Str::slug($post->title) . '-' . time() . '.png';
            $yearMonth = now()->format('Y/m');
            $savedPath = "media/ai/{$yearMonth}/{$fileName}";

            Storage::disk('public')->put($savedPath, $imageData);
            $publicUrl = Storage::disk('public')->url($savedPath);

            // Create media record
            Media::create([
                'name' => 'Thumbnail AI Regenerated: ' . $post->title,
                'file_name' => $fileName,
                'mime_type' => 'image/png',
                'size' => strlen($imageData),
                'path' => $savedPath,
                'url' => $publicUrl,
                'uploaded_by' => $user->id,
            ]);

            // Update Post
            $post->update(['thumbnail' => $publicUrl]);

            $jobRecord->update([
                'status' => 'completed',
                'finished_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sinh lại ảnh đại diện bằng AI thành công!',
                'thumbnail' => $publicUrl
            ]);

        } catch (\Exception $e) {
            $jobRecord->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể sinh ảnh đại diện bằng AI.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Schedule a post to be published in the future.
     */
    public function schedulePost(Request $request, $postId)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ], [
            'scheduled_at.after' => 'Thời gian đặt lịch đăng phải là thời gian trong tương lai.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $post->update([
            'status' => 'scheduled',
            'scheduled_at' => $request->scheduled_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đặt lịch đăng bài viết thành công!',
            'data' => $post
        ]);
    }

    /**
     * Publish a post immediately.
     */
    public function publishNow($postId)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Post not found'
            ], 404);
        }

        $post->update([
            'status' => 'published',
            'published_at' => now(),
            'scheduled_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Xuất bản bài viết thành công!',
            'data' => $post
        ]);
    }

    /**
     * Manually trigger scheduler to publish due posts.
     */
    public function publishDue()
    {
        try {
            Artisan::call('posts:publish-scheduled');
            $output = Artisan::output();
            
            return response()->json([
                'success' => true,
                'message' => 'Kích hoạt xử lý bài viết đến lịch thành công!',
                'details' => trim($output)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi kích hoạt đăng bài: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get AI Jobs history list.
     */
    public function jobsHistory(Request $request)
    {
        $query = AiGenerationJob::query()->with(['created_by_relation']);
        
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 15);
        $jobs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Load custom user reference
        $jobs->getCollection()->transform(function($job) {
            $job->created_by_name = $job->created_by_relation ? $job->created_by_relation->name : 'System';
            unset($job->created_by_relation);
            return $job;
        });

        return response()->json([
            'success' => true,
            'data' => $jobs->items(),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ]
        ]);
    }
}
