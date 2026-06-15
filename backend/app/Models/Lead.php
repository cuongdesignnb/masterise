<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'type',
        'message',
        'status',
        'project_id',
        'user_id',
        'assigned_to',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'landing_page',
        'referrer',
        'demand_type',
        'budget_range',
        'product_type',
        'score',
        'temperature',
        'last_contacted_at',
        'next_follow_up_at',
        'visitor_id',
        'lead_source_position',
        'vr_scene_id',
        'vr_scene_title',
        'vr_hotspot_id',
        'vr_hotspot_title',
    ];

    protected $casts = [
        'score' => 'integer',
        'last_contacted_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notes()
    {
        return $this->hasMany(LeadNote::class)->orderBy('created_at', 'desc');
    }

    public function activities()
    {
        return $this->hasMany(LeadActivity::class)->orderBy('created_at', 'desc');
    }

    public function assignments()
    {
        return $this->hasMany(LeadAssignment::class)->orderBy('created_at', 'desc');
    }

    public function vrScene()
    {
        return $this->belongsTo(ProjectVrScene::class, 'vr_scene_id');
    }

    public function vrHotspot()
    {
        return $this->belongsTo(ProjectVrHotspot::class, 'vr_hotspot_id');
    }
}
