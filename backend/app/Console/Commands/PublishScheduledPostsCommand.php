<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PublishScheduledPostsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish posts that have reached their scheduled time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting scheduled posts publishing...');

        try {
            $publishedCount = 0;

            \Illuminate\Support\Facades\DB::transaction(function () use (&$publishedCount) {
                // Fetch scheduled posts whose publish time has arrived, and lock them for update
                $posts = \App\Models\Post::where('status', 'scheduled')
                    ->whereNotNull('scheduled_at')
                    ->where('scheduled_at', '<=', now())
                    ->lockForUpdate()
                    ->get();

                foreach ($posts as $post) {
                    $post->update([
                        'status' => 'published',
                        'published_at' => now(),
                    ]);
                    $publishedCount++;
                    $this->info("Published post: [ID: {$post->id}] '{$post->title}'");
                }
            });

            // Record scheduler execution time in settings
            \App\Models\Setting::set('last_scheduler_run_at', now()->toDateTimeString(), 'string');

            $this->info("Published {$publishedCount} post(s) successfully.");
            \Illuminate\Support\Facades\Log::info("[Scheduler] Published {$publishedCount} scheduled post(s) successfully.");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to publish scheduled posts: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('[Scheduler] Failed to publish scheduled posts: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
