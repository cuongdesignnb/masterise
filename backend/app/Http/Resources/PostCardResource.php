<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PostCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $author = $this->whenLoaded('author');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'post_type' => $this->post_type,
            'summary' => Str::limit(trim(strip_tags((string) $this->summary)), 500),
            'thumbnail' => is_string($this->thumbnail) && ! Str::startsWith($this->thumbnail, 'data:')
                ? $this->thumbnail
                : null,
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
            'post_category_id' => $this->post_category_id,
            'author_id' => $this->author_id,
            'published_at' => $this->published_at,
            'category' => $this->whenLoaded('category'),
            'author' => $author ? [
                'id' => $author->id,
                'name' => $author->name,
                'avatar' => $author->avatar,
            ] : null,
            'tags' => $this->whenLoaded('tags'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
