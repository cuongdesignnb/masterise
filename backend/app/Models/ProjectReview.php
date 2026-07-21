<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectReview extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'reviewer_name',
        'reviewer_role',
        'rating',
        'review_body',
        'reviewed_at',
        'source_type',
        'source_url',
        'is_verified',
        'moderation_status',
        'is_published',
        'approved_by',
        'approved_at',
        'rejected_reason',
    ];

    protected $casts = [
        'rating' => 'float',
        'is_verified' => 'boolean',
        'is_published' => 'boolean',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the project that owns the review.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user who approved the review.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope for public, approved and published reviews.
     */
    public function scopePublished($query)
    {
        return $query->where('moderation_status', 'approved')
                     ->where('is_published', true);
    }
}
