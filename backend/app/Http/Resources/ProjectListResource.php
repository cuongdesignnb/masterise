<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $location = $this->whenLoaded('locationRelation');
        $region = $location && $location->relationLoaded('region') ? $location->region : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'project_label' => $this->project_label,
            'location' => $this->location,
            'address' => $this->address,
            'region' => $this->region,
            'region_name' => $region?->name ?: $this->region,
            'region_details' => $region ? ['id' => $region->id, 'name' => $region->name, 'slug' => $region->slug] : null,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'price_text' => $this->price_text,
            'area_min' => $this->area_min,
            'area_max' => $this->area_max,
            'area_text' => $this->area_text,
            'project_status' => $this->project_status,
            'project_status_detail' => $this->whenLoaded('projectStatusDetail'),
            'open_sale_at' => $this->open_sale_at,
            'is_featured' => (bool) $this->is_featured,
            'is_hot' => (bool) $this->is_hot,
            'is_published' => (bool) $this->is_published,
            'published_at' => $this->published_at,
            'sort_order' => (int) $this->sort_order,
            'thumbnail' => $this->thumbnail,
            'banner_image' => $this->banner_image,
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'taxonomy_type' => $category->taxonomy_type,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
