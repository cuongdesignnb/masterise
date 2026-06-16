<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiGenerationJob extends Model
{
    protected $fillable = [
        'type',
        'status',
        'provider',
        'text_model',
        'image_model',
        'input_title',
        'input_keywords',
        'prompt',
        'response_metadata',
        'error_message',
        'tokens_input',
        'tokens_output',
        'estimated_cost',
        'post_id',
        'batch_id',
        'created_by',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'response_metadata' => 'json',
            'tokens_input' => 'integer',
            'tokens_output' => 'integer',
            'estimated_cost' => 'decimal:6',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function created_by_relation()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function batch()
    {
        return $this->belongsTo(AiContentBatch::class, 'batch_id');
    }
}
