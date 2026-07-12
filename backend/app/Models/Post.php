<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'post_type',
        'summary',
        'intro_content',
        'content',
        'thumbnail',
        'status',
        'is_featured',
        'post_category_id',
        'author_id',
        'published_at',
        'event_start_at',
        'event_end_at',
        'event_location',
        'event_register_url',
        'ai_generated',
        'ai_generation_job_id',
        'ai_prompt',
        'source_keyword',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'event_start_at' => 'datetime',
            'event_end_at' => 'datetime',
            'ai_generated' => 'boolean',
            'scheduled_at' => 'datetime',
        ];
    }

    public function category()
    {
        return $this->belongsTo(PostCategory::class, 'post_category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function manualRelatedPosts()
    {
        return $this->belongsToMany(
            Post::class,
            'post_related_posts',
            'post_id',
            'related_post_id'
        )
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderBy('post_related_posts.sort_order');
    }

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }

    public function mediaItems()
    {
        return $this->hasMany(PostMedia::class)->orderBy('sort_order');
    }
}
