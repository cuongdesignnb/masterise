<?php

namespace App\Jobs;

use App\Models\Post;
use App\Models\Media;
use App\Models\Setting;
use App\Models\AiContentBatch;
use App\Models\AiGenerationJob;
use App\Services\OpenAIService;
use App\Services\AI\ArticlePromptBuilder;
use App\Helpers\AiContentHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenerateAiArticleWithImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 180;

    protected string $keyword;
    protected ?int $batchId;
    protected ?int $createdBy;
    protected ?int $categoryId;
    protected ?int $authorId;
    protected array $settings;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $keyword,
        ?int $batchId = null,
        ?int $createdBy = null,
        ?int $categoryId = null,
        ?int $authorId = null,
        array $settings = []
    ) {
        $this->keyword = $keyword;
        $this->batchId = $batchId;
        $this->createdBy = $createdBy;
        $this->categoryId = $categoryId;
        $this->authorId = $authorId;
        $this->settings = $settings;
    }

    /**
     * Execute the job.
     */
    public function handle(OpenAIService $openai, ArticlePromptBuilder $promptBuilder): void
    {
        // 1. Create a job record
        $jobRecord = AiGenerationJob::create([
            'type' => 'bulk_item',
            'status' => 'processing',
            'provider' => 'openai',
            'text_model' => Setting::get('ai_text_model', 'gpt-4o-mini'),
            'image_model' => Setting::get('ai_image_model', 'gpt-image-1'),
            'input_keywords' => $this->keyword,
            'batch_id' => $this->batchId,
            'created_by' => $this->createdBy,
            'started_at' => now(),
        ]);

        $batch = $this->batchId ? AiContentBatch::find($this->batchId) : null;
        if ($batch && $batch->status === 'cancelled') {
            $jobRecord->update(['status' => 'cancelled', 'finished_at' => now()]);
            return;
        }

        try {
            // 2. Generate prompt and call OpenAI
            $prompt = $promptBuilder->buildArticlePrompt($this->keyword, $this->settings);
            $jobRecord->update(['prompt' => $prompt]);

            $textResponse = $openai->generateArticleWithResponsesApi($prompt, $this->settings);
            $jsonString = $textResponse['data']['choices'][0]['message']['content'] ?? null;

            if (!$jsonString) {
                throw new \Exception('No content returned from OpenAI API.');
            }

            $jsonString = trim($jsonString);
            if (str_starts_with($jsonString, '```')) {
                $jsonString = preg_replace('/^```(?:json)?\s*/', '', $jsonString);
                $jsonString = preg_replace('/\s*```$/', '', $jsonString);
                $jsonString = trim((string) $jsonString);
            }

            // Parse response
            $articleData = json_decode($jsonString, true);
            if (!$articleData || !is_array($articleData)) {
                throw new \Exception('Failed to parse OpenAI JSON response.');
            }

            // Schema validation
            if (!AiContentHelper::validateJsonSchema($articleData)) {
                throw new \Exception('OpenAI JSON response is missing required schema fields.');
            }

            // Sanitize content
            $cleanContent = AiContentHelper::sanitizeHtml($articleData['content_html']);
            if (empty($cleanContent)) {
                throw new \Exception('Article content was empty after HTML sanitization.');
            }
            if (!empty($articleData['cta'])) {
                $cleanContent .= '<blockquote><p><strong>' . e($articleData['cta']) . '</strong></p></blockquote>';
                $cleanContent = AiContentHelper::sanitizeHtml($cleanContent);
            }

            // 3. Handle image generation if enabled
            $thumbnailUrl = null;
            $imageJobFailed = false;
            $imageErrorMsg = null;

            $enableImage = $this->settings['enable_image_generation'] ?? filter_var(Setting::get('ai_enable_image_generation', true), FILTER_VALIDATE_BOOLEAN);
            if ($enableImage) {
                try {
                    $imagePrompt = $articleData['image_prompt'] ?: $promptBuilder->buildFallbackImagePrompt($articleData['title']);
                    $base64Image = $openai->generateImageWithImageApi(
                        $imagePrompt,
                        $this->settings['image_size'] ?? null,
                        $this->settings['image_quality'] ?? null
                    );

                    // Decode base64 image and save locally
                    $imageData = base64_decode($base64Image);
                    $fileName = 'ai-' . Str::slug($articleData['title']) . '-' . time() . '.png';
                    
                    // Path format: public/media/ai/YYYY/MM/filename.png
                    $yearMonth = now()->format('Y/m');
                    $savedPath = "media/ai/{$yearMonth}/{$fileName}";
                    
                    Storage::disk('public')->put($savedPath, $imageData);
                    $publicUrl = Storage::disk('public')->url($savedPath);

                    // Create media record
                    $media = Media::create([
                        'name' => 'Thumbnail AI: ' . $articleData['title'],
                        'file_name' => $fileName,
                        'mime_type' => 'image/png',
                        'size' => strlen($imageData),
                        'path' => $savedPath,
                        'url' => $publicUrl,
                        'uploaded_by' => $this->createdBy,
                    ]);

                    $thumbnailUrl = $publicUrl;
                } catch (\Exception $imgEx) {
                    Log::error('[GenerateAiArticleJob] Image generation failed: ' . $imgEx->getMessage());
                    $imageJobFailed = true;
                    $imageErrorMsg = 'Image Error: ' . $imgEx->getMessage();
                }
            }

            // 4. Create unique slug & Save Post
            $uniqueSlug = AiContentHelper::generateUniqueSlug($articleData['title'], $articleData['slug_suggestion']);
            
            $post = Post::create([
                'title' => $articleData['title'],
                'slug' => $uniqueSlug,
                'post_type' => 'news',
                'summary' => $articleData['excerpt'],
                'content' => $cleanContent,
                'thumbnail' => $thumbnailUrl,
                'status' => 'draft',
                'published_at' => null,
                'scheduled_at' => null,
                'post_category_id' => $this->categoryId,
                'author_id' => $this->authorId ?? $this->createdBy,
                'ai_generated' => true,
                'ai_generation_job_id' => $jobRecord->id,
                'ai_prompt' => $prompt,
                'source_keyword' => $this->keyword,
            ]);

            // Save SEO Meta
            $post->seoMeta()->create([
                'title' => $articleData['seo_title'],
                'description' => $articleData['seo_description'],
                'keywords' => is_array($articleData['seo_keywords']) ? implode(', ', $articleData['seo_keywords']) : $articleData['seo_keywords'],
            ]);

            // 5. Update Job record status
            $usage = $textResponse['data']['usage'] ?? [];
            $tokensInput = $usage['prompt_tokens'] ?? null;
            $tokensOutput = $usage['completion_tokens'] ?? null;

            $jobRecord->update([
                'status' => 'completed',
                'post_id' => $post->id,
                'error_message' => $imageJobFailed ? $imageErrorMsg : null,
                'tokens_input' => $tokensInput,
                'tokens_output' => $tokensOutput,
                'response_metadata' => [
                    'model_used' => $textResponse['model_used'] ?? null,
                    'image_model' => $enableImage ? Setting::get('ai_image_model', 'gpt-image-1') : null,
                    'image_status' => $enableImage ? ($imageJobFailed ? 'failed' : 'completed') : 'disabled'
                ],
                'finished_at' => now(),
            ]);

            // 6. Update Batch counts
            if ($batch) {
                $batch->increment('generated_count');
                $this->checkBatchCompletion($batch);
            }

        } catch (\Exception $e) {
            Log::error('[GenerateAiArticleJob] Failed to generate article: ' . $e->getMessage());

            $jobRecord->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            if ($batch) {
                $batch->increment('failed_count');
                $this->checkBatchCompletion($batch);
            }
        }
    }

    /**
     * Check if all batch jobs are processed and transition batch status.
     */
    protected function checkBatchCompletion(AiContentBatch $batch): void
    {
        $totalProcessed = $batch->generated_count + $batch->failed_count;
        if ($totalProcessed >= $batch->keywords_count) {
            $finalStatus = 'completed';
            if ($batch->failed_count == $batch->keywords_count) {
                $finalStatus = 'failed';
            } elseif ($batch->failed_count > 0) {
                $finalStatus = 'partially_failed';
            }
            $batch->update(['status' => $finalStatus]);
        } else {
            $batch->update(['status' => 'processing']);
        }
    }
}
