<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostMedia extends Model
{
    protected $table = 'post_media';

    protected $fillable = [
        'post_id',
        'media_id',
        'type',
        'title',
        'url',
        'thumbnail_url',
        'mime_type',
        'file_size',
        'sort_order',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'file_size' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function media()
    {
        return $this->belongsTo(Media::class);
    }
}
