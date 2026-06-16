<?php

namespace App\Jobs;

use App\Models\AiContentBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateBulkAiArticlesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 600;

    protected AiContentBatch $batch;
    protected array $keywords;
    protected array $settings;

    /**
     * Create a new job instance.
     */
    public function __construct(AiContentBatch $batch, array $keywords, array $settings = [])
    {
        $this->batch = $batch;
        $this->keywords = $keywords;
        $this->settings = $settings;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Update batch status to processing
        $this->batch->update(['status' => 'processing']);

        $delaySeconds = 0;
        foreach ($this->keywords as $keyword) {
            $keyword = trim($keyword);
            if (empty($keyword)) {
                continue;
            }

            // Dispatch GenerateAiArticleWithImageJob for each keyword with a delayed queue time
            // to avoid hitting OpenAI Rate Limits (RPM / TPM).
            GenerateAiArticleWithImageJob::dispatch(
                $keyword,
                $this->batch->id,
                $this->batch->created_by,
                $this->batch->default_category_id,
                $this->batch->default_author_id,
                $this->settings
            )->delay(now()->addSeconds($delaySeconds));

            // Increment delay by 5 seconds per keyword
            $delaySeconds += 5;
        }
    }
}
