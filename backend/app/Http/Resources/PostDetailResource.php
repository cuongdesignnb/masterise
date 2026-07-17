<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class PostDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $author = $this->whenLoaded('author');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'post_type' => $this->post_type,
            'summary' => $this->summary,
            'intro_content' => $this->intro_content,
            'content' => $this->content,
            'thumbnail' => is_string($this->thumbnail) && ! Str::startsWith($this->thumbnail, 'data:')
                ? $this->thumbnail
                : null,
            'status' => $this->status,
            'is_featured' => (bool) $this->is_featured,
            'post_category_id' => $this->post_category_id,
            'author_id' => $this->author_id,
            'published_at' => $this->published_at,
            'event_start_at' => $this->event_start_at,
            'event_end_at' => $this->event_end_at,
            'event_location' => $this->event_location,
            'event_register_url' => $this->event_register_url,
            'category' => $this->whenLoaded('category'),
            'author' => $author ? [
                'id' => $author->id,
                'name' => $author->name,
                'avatar' => $author->avatar,
            ] : null,
            'tags' => $this->whenLoaded('tags'),
            'seo_meta' => $this->whenLoaded('seoMeta'),
            'media_items' => $this->whenLoaded('mediaItems'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
