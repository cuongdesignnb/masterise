<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadActivity extends Model
{
    protected $fillable = [
        'lead_id',
        'visitor_id',
        'type',
        'title',
        'description',
        'metadata',
        'created_by',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
