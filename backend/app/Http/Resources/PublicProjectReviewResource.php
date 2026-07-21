<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProjectReviewResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reviewer_name' => $this->reviewer_name,
            'reviewer_role' => $this->reviewer_role,
            'rating' => (float) $this->rating,
            'review_body' => $this->review_body,
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'is_verified' => (bool) $this->is_verified,
        ];
    }
}
