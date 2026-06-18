<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'code',
        'developer_id',
        'location_id',
        'description',
        'content',
        'location',
        'region',
        'address',
        'province',
        'district',
        'ward',
        'price_min',
        'price_max',
        'price_text',
        'area_min',
        'area_max',
        'area_text',
        'status',
        'sales_status',
        'open_sale_at',
        'handover_year',
        'handover_time',
        'legal_status',
        'ownership_type',
        'construction_density',
        'total_area',
        'total_units',
        'total_blocks',
        'total_floors',
        'highlight_points',
        'nearby_places',
        'payment_policy',
        'sales_policy',
        'booking_policy',
        'is_featured',
        'is_hot',
        'is_published',
        'published_at',
        'sort_order',
        'thumbnail',
        'banner_image',
        'gallery',
        'brochure_url',
        'video_url',
        'virtual_tour_url',
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
            'highlight_points' => 'array',
            'nearby_places' => 'array',
            'is_featured' => 'boolean',
            'is_hot' => 'boolean',
            'is_published' => 'boolean',
            'open_sale_at' => 'datetime',
            'published_at' => 'datetime',
            'price_min' => 'decimal:2',
            'price_max' => 'decimal:2',
            'area_min' => 'decimal:2',
            'area_max' => 'decimal:2',
            'sort_order' => 'integer',
            'total_units' => 'integer',
            'total_blocks' => 'integer',
            'total_floors' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function developerRelation()
    {
        return $this->belongsTo(Developer::class, 'developer_id');
    }

    public function locationRelation()
    {
        return $this->belongsTo(Location::class, 'location_id');
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

    public function vrTour()
    {
        return $this->hasOne(ProjectVrTour::class, 'project_id');
    }
}
