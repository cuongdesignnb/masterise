<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Post;
use App\Models\Project;
use App\Models\Region;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('posts:publish-scheduled')->everyMinute();

Artisan::command('careers:sync-schedule', function () {
    $published = \App\Models\CareerJob::query()
        ->where('status', 'scheduled')->whereNotNull('published_at')->where('published_at', '<=', now())
        ->update(['status' => 'published', 'is_published' => true]);
    $closed = \App\Models\CareerJob::query()
        ->where('status', 'published')->whereNotNull('application_deadline')->where('application_deadline', '<', now())
        ->update(['status' => 'closed', 'is_published' => false, 'closed_at' => now()]);
    $this->info("Đã xuất bản {$published} tin và đóng {$closed} tin tuyển dụng.");
})->purpose('Xuất bản và đóng tin tuyển dụng theo lịch');

Schedule::command('careers:sync-schedule')->everyMinute()->withoutOverlapping();

Artisan::command('content:audit-taxonomy', function () {
    $posts = Post::with('category')->orderBy('id')->get()->map(fn (Post $post) => [
        $post->id,
        $post->title,
        $post->slug ?: '(thiếu)',
        $post->post_type,
        $post->category?->name ?: '(thiếu)',
        $post->category?->slug ?: '(thiếu)',
        $post->status,
        optional($post->published_at)->toDateTimeString() ?: '(thiếu)',
    ]);
    $this->table(['ID', 'Title', 'Slug', 'Type', 'Category', 'Category slug', 'Status', 'Published at'], $posts);

    $allowedRegions = Region::query()->pluck('name')->all();
    $unusualRegions = Project::query()
        ->whereNotNull('region')->where('region', '!=', '')
        ->whereNotIn('region', $allowedRegions)
        ->get(['id', 'name', 'slug', 'region'])
        ->map(fn (Project $project) => [$project->id, $project->name, $project->slug, $project->region]);
    $this->newLine();
    $this->info('Region bất thường (chỉ báo cáo, không tự sửa):');
    $this->table(['ID', 'Project', 'Slug', 'Region'], $unusualRegions);
})->purpose('Audit post taxonomy, missing publishing data, and unusual project regions without modifying data');
