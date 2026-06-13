<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'budget_min',
        'budget_max',
        'preferred_regions',
        'preferred_types',
        'preferred_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'preferred_regions' => 'array',
            'preferred_types' => 'array',
            'preferred_status' => 'array',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
