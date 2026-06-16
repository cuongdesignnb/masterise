<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'thumbnail',
        'status',
        'is_featured',
        'post_category_id',
        'author_id',
        'published_at',
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

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }
}
