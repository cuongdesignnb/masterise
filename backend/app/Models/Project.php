<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'content',
        'location',
        'region',
        'price_min',
        'price_max',
        'price_text',
        'status',
        'handover_year',
        'is_featured',
        'thumbnail',
        'gallery',
        'brochure_url',
        'lat',
        'lng',
        'area_size',
        'developer',
        'scale',
        'amenities',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'amenities' => 'array',
            'is_featured' => 'boolean',
            'price_min' => 'decimal:2',
            'price_max' => 'decimal:2',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function categories()
    {
        return $this->belongsToMany(ProjectCategory::class, 'project_category_project');
    }

    public function savedByUsers()
    {
        return $this->belongsToMany(User::class, 'saved_projects')->withTimestamps();
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function seoMeta()
    {
        return $this->morphOne(SeoMeta::class, 'seoable');
    }
}
