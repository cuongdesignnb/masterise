<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'reviewer_name' => $this->reviewer_name,
            'reviewer_role' => $this->reviewer_role,
            'rating' => (float) $this->rating,
            'review_body' => $this->review_body,
            'reviewed_at' => $this->reviewed_at ? $this->reviewed_at->toIso8601String() : null,
            'source_type' => $this->source_type,
            'source_url' => $this->source_url,
            'is_verified' => (bool) $this->is_verified,
            'moderation_status' => $this->moderation_status,
            'is_published' => (bool) $this->is_published,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
        ];
    }
}
