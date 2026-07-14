<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function projects()
    {
        return $this->hasManyThrough(Project::class, Location::class);
    }
}
