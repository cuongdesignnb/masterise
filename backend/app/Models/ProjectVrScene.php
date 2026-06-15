<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectVrScene extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'project_id',
        'title',
        'slug',
        'description',
        'panorama_url',
        'thumbnail_url',
        'scene_type',
        'initial_yaw',
        'initial_pitch',
        'initial_zoom',
        'autorotate',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'initial_yaw' => 'float',
        'initial_pitch' => 'float',
        'initial_zoom' => 'float',
        'autorotate' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function tour()
    {
        return $this->belongsTo(ProjectVrTour::class, 'tour_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function hotspots()
    {
        return $this->hasMany(ProjectVrHotspot::class, 'scene_id')->orderBy('sort_order');
    }
}
