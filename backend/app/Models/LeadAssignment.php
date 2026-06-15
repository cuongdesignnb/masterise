<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadAssignment extends Model
{
    protected $fillable = [
        'lead_id',
        'sale_id',
        'assigned_by',
        'assigned_at',
        'status',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function sale()
    {
        return $this->belongsTo(User::class, 'sale_id');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
