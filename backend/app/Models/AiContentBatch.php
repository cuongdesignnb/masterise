<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiContentBatch extends Model
{
    protected $fillable = [
        'title',
        'status',
        'keywords_count',
        'generated_count',
        'failed_count',
        'default_category_id',
        'default_author_id',
        'schedule_mode',
        'schedule_start_at',
        'schedule_interval_minutes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'keywords_count' => 'integer',
            'generated_count' => 'integer',
            'failed_count' => 'integer',
            'schedule_start_at' => 'datetime',
            'schedule_interval_minutes' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(PostCategory::class, 'default_category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'default_author_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function jobs()
    {
        return $this->hasMany(AiGenerationJob::class, 'batch_id');
    }
}
