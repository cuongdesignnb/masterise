<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProjectReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project->id,
                'name' => $this->project->name,
                'slug' => $this->project->slug,
            ]),
            'reviewer_name' => $this->reviewer_name,
            'reviewer_role' => $this->reviewer_role,
            'rating' => (float) $this->rating,
            'review_body' => $this->review_body,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'source_type' => $this->source_type,
            'source_url' => $this->source_url,
            'is_verified' => (bool) $this->is_verified,
            'moderation_status' => $this->moderation_status,
            'is_published' => (bool) $this->is_published,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'rejected_reason' => $this->rejected_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
