<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Setting;
use App\Models\AiContentBatch;
use App\Models\AiGenerationJob;
use App\Jobs\GenerateBulkAiArticlesJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class AiBatchController extends Controller
{
    /**
     * Get list of batches.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $batches = AiContentBatch::orderBy('created_at', 'desc')->paginate($perPage);

        // Map progress percentage for list
        $batches->getCollection()->transform(function($batch) {
            $batch->progress_percent = $batch->keywords_count > 0
                ? round((($batch->generated_count + $batch->failed_count) / $batch->keywords_count) * 100)
                : 0;
            return $batch;
        });

        return response()->json([
            'success' => true,
            'data' => $batches->items(),
            'meta' => [
                'current_page' => $batches->currentPage(),
                'last_page' => $batches->lastPage(),
                'per_page' => $batches->perPage(),
                'total' => $batches->total(),
            ]
        ]);
    }

    /**
     * Store and start a new batch.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'keywords' => 'required|string',
            'default_category_id' => 'required|exists:post_categories,id',
            'default_author_id' => 'nullable|exists:users,id',
            'enable_image_generation' => 'required|boolean',
            'image_size' => 'nullable|string|max:20',
            'image_quality' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Split keywords by newline and trim
        $rawKeywords = explode("\n", $request->keywords);
        $keywords = array_filter(array_map('trim', $rawKeywords), function($item) {
            return !empty($item);
        });

        $keywordsCount = count($keywords);
        if ($keywordsCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Danh sách từ khóa không được rỗng.'
            ], 422);
        }

        // Limit check
        $maxBatchSize = (int)Setting::get('ai_max_articles_per_batch', 20);
        if ($keywordsCount > $maxBatchSize) {
            return response()->json([
                'success' => false,
                'message' => "Hạn ngạch giới hạn: Bạn chỉ được tạo tối đa {$maxBatchSize} bài viết mỗi lần chạy hàng loạt."
            ], 422);
        }

        // Rate limiter check
        $user = $request->user();
        $executedJobsThisHour = AiGenerationJob::where('created_by', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        $maxJobsPerHour = (int)Setting::get('ai_max_jobs_per_hour', 30);
        if (($executedJobsThisHour + $keywordsCount) > $maxJobsPerHour) {
            $available = max(0, $maxJobsPerHour - $executedJobsThisHour);
            return response()->json([
                'success' => false,
                'message' => "Giới hạn quota: Bạn chỉ có thể tạo thêm {$available} tác vụ AI trong giờ này (Đã chạy {$executedJobsThisHour}/{$maxJobsPerHour}). Vui lòng giảm số từ khóa hoặc đợi thêm."
            ], 429);
        }

        // Create batch record
        $batch = AiContentBatch::create([
            'title' => $request->title,
            'status' => 'draft',
            'keywords_count' => $keywordsCount,
            'generated_count' => 0,
            'failed_count' => 0,
            'default_category_id' => $request->default_category_id,
            'default_author_id' => $request->default_author_id ?: $user->id,
            'created_by' => $user->id,
        ]);

        // Dispatch bulk job to queue (requires a running queue worker in background)
        GenerateBulkAiArticlesJob::dispatch($batch, array_values($keywords), [
            'language' => Setting::get('ai_default_language', 'vi'),
            'tone' => Setting::get('ai_default_tone'),
            'article_length' => Setting::get('ai_default_article_length'),
            'enable_image_generation' => $request->enable_image_generation,
            'image_size' => $request->image_size,
            'image_quality' => $request->image_quality,
        ]);

        $batch->update(['status' => 'queued']);

        return response()->json([
            'success' => true,
            'message' => 'Khởi tạo chiến dịch viết bài hàng loạt thành công! Tác vụ đã được chuyển vào hàng đợi.',
            'data' => $batch
        ], 201);
    }

    /**
     * Get details of a batch and its progress.
     */
    public function show($id)
    {
        $batch = AiContentBatch::with(['category', 'author', 'creator'])->find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $batch->progress_percent = $batch->keywords_count > 0
            ? round((($batch->generated_count + $batch->failed_count) / $batch->keywords_count) * 100)
            : 0;

        // Fetch jobs for status details
        $jobs = AiGenerationJob::where('batch_id', $batch->id)
            ->select(['id', 'status', 'input_keywords', 'post_id', 'error_message', 'finished_at'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'batch' => $batch,
                'jobs' => $jobs
            ]
        ]);
    }

    /**
     * Cancel pending/queued jobs in a batch.
     */
    public function cancel($id)
    {
        $batch = AiContentBatch::find($id);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        if (in_array($batch->status, ['completed', 'failed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy chiến dịch đã kết thúc hoặc đã hủy trước đó.'
            ], 400);
        }

        // Cancel jobs that are not completed/failed
        $cancelledCount = AiGenerationJob::where('batch_id', $batch->id)
            ->whereIn('status', ['pending', 'queued', 'processing'])
            ->update([
                'status' => 'cancelled',
                'finished_at' => now(),
                'error_message' => 'Cancelled by user request.'
            ]);

        $batch->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => "Đã hủy chiến dịch thành công! Dừng {$cancelledCount} tác vụ chưa thực hiện. Các bài đã tạo thành công trước đó vẫn được giữ lại."
        ]);
    }

    /**
     * Schedule all completed articles in a batch cyclically.
     */
    public function schedule(Request $request, $id)
    {
        $batch = AiContentBatch::find($id);
        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'schedule_start_at' => 'required|date|after:now',
            'schedule_interval_minutes' => 'required|integer|min:1',
            'posts_per_slot' => 'nullable|integer|min:1',
        ], [
            'schedule_start_at.after' => 'Thời gian đặt lịch bắt đầu phải nằm trong tương lai.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get all completed posts created by this batch
        $jobPostIds = AiGenerationJob::where('batch_id', $batch->id)
            ->where('status', 'completed')
            ->whereNotNull('post_id')
            ->pluck('post_id');

        $posts = Post::whereIn('id', $jobPostIds)
            ->where('status', 'draft')
            ->get();

        $postsCount = $posts->count();
        if ($postsCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết nháp nào thuộc chiến dịch này để đặt lịch.'
            ], 400);
        }

        $interval = (int)$request->schedule_interval_minutes;
        $postsPerSlot = (int)$request->get('posts_per_slot', 1);
        $startTime = Carbon::parse($request->schedule_start_at);

        // Cyclic scheduling
        $scheduledCount = 0;
        foreach ($posts as $index => $post) {
            $slotIndex = floor($index / $postsPerSlot);
            $scheduledTime = $startTime->copy()->addMinutes($slotIndex * $interval);

            $post->update([
                'status' => 'scheduled',
                'scheduled_at' => $scheduledTime,
            ]);
            $scheduledCount++;
        }

        $batch->update([
            'schedule_mode' => 'cyclic',
            'schedule_start_at' => $startTime,
            'schedule_interval_minutes' => $interval,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Đặt lịch hàng loạt thành công cho {$scheduledCount} bài viết!"
        ]);
    }
}
