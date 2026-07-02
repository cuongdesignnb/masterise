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
        'hero_subtitle',
        'badge_text',
        'project_label',
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
        'quick_cards',
        'project_facts',
        'project_stats',
        'nearby_places',
        'connectivity',
        'payment_policy',
        'sales_policy',
        'booking_policy',
        'policy_cards',
        'project_timeline',
        'investment_reasons',
        'project_testimonials',
        'project_faqs',
        'is_featured',
        'is_hot',
        'is_published',
        'published_at',
        'sort_order',
        'thumbnail',
        'banner_image',
        'gallery',
        'gallery_label',
        'gallery_title',
        'gallery_description',
        'detail_gallery',
        'detail_gallery_label',
        'detail_gallery_title',
        'detail_gallery_description',
        'section_titles',
        'brochure_url',
        'video_url',
        'virtual_tour_url',
        'lat',
        'lng',
        'area_size',
        'developer',
        'scale',
        'amenities',
        'amenity_details',
        'floor_tabs',
        'floor_plans',
        'handover_standards',
        'price_rows',
        'map_image_url',
        'location_description',
        'schema_price',
        'schema_price_currency',
        'schema_availability',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'detail_gallery' => 'array',
            'amenities' => 'array',
            'highlight_points' => 'array',
            'quick_cards' => 'array',
            'project_facts' => 'array',
            'project_stats' => 'array',
            'nearby_places' => 'array',
            'connectivity' => 'array',
            'amenity_details' => 'array',
            'floor_tabs' => 'array',
            'floor_plans' => 'array',
            'handover_standards' => 'array',
            'price_rows' => 'array',
            'policy_cards' => 'array',
            'project_timeline' => 'array',
            'investment_reasons' => 'array',
            'project_testimonials' => 'array',
            'project_faqs' => 'array',
            'section_titles' => 'array',
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
