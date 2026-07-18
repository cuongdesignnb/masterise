<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ProjectRelatedPostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $category = $this->whenLoaded('category');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'post_type' => $this->post_type,
            'excerpt' => Str::limit(trim(strip_tags((string) $this->summary)), 180),
            'summary' => Str::limit(trim(strip_tags((string) $this->summary)), 180),
            'thumbnail' => is_string($this->thumbnail) && ! Str::startsWith($this->thumbnail, 'data:')
                ? $this->thumbnail
                : null,
            'category' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ] : null,
            'published_at' => $this->published_at,
        ];
    }
}
