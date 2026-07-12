<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Post;
use App\Models\Project;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('posts:publish-scheduled')->everyMinute();

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

    $allowedRegions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Quốc tế'];
    $unusualRegions = Project::query()
        ->whereNotNull('region')->where('region', '!=', '')
        ->whereNotIn('region', $allowedRegions)
        ->get(['id', 'name', 'slug', 'region'])
        ->map(fn (Project $project) => [$project->id, $project->name, $project->slug, $project->region]);
    $this->newLine();
    $this->info('Region bất thường (chỉ báo cáo, không tự sửa):');
    $this->table(['ID', 'Project', 'Slug', 'Region'], $unusualRegions);
})->purpose('Audit post taxonomy, missing publishing data, and unusual project regions without modifying data');
